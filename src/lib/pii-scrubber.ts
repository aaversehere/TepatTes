export interface PiiScrubResult {
  scrubbedText: string;
  redactedCount: number;
  redactedTypes: string[];
}

/**
 * Local Regex PII Scrubber (Lapisan Keselamatan 1)
 * Menghapus secara deterministik:
 * 1. Nama diri (pola perkenalan: "nama saya ...", "aku ...", "saya ... dari ...")
 * 2. Nomor telepon Indonesia (+62, 62, 08xx) & NISN (10 digit)
 * 3. Alamat email & akun media sosial (@username, ig:, wa:, tiktok:)
 * 4. Alamat rumah / jalan / RT-RW / Desa / Kecamatan
 * 5. Nama sekolah (SMA, SMAN, SMK, MAN, SMP, sekolah ...)
 * Target keberhasilan: 100% pada set uji PII.
 */
export function scrubPII(input: string): PiiScrubResult {
  if (!input) {
    return { scrubbedText: '', redactedCount: 0, redactedTypes: [] };
  }

  let text = input;
  let redactedCount = 0;
  const redactedTypes = new Set<string>();

  const applyPattern = (regex: RegExp, replacement: string, type: string) => {
    text = text.replace(regex, (match) => {
      redactedCount += 1;
      redactedTypes.add(type);
      return replacement;
    });
  };

  // 1. Email
  applyPattern(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    '[EMAIL_DIHAPUS]',
    'EMAIL'
  );

  // 2. Nomor Telepon Indonesia (+62 / 62 / 08xx dengan pemisah spasi/strip)
  applyPattern(
    /(?:\+62|62|08)[0-9\s\-]{7,15}\b/g,
    '[TELEPON_DIHAPUS]',
    'PHONE'
  );

  // 3. NISN / Nomor Induk 8-16 digit
  applyPattern(
    /\b(?:nisn|nis|nik)\s*[:=-]?\s*\d{6,16}\b/gi,
    '[ID_SISWA_DIHAPUS]',
    'STUDENT_ID'
  );
  applyPattern(/\b\d{10,16}\b/g, '[ANGKA_ID_DIHAPUS]', 'NUMERIC_ID');

  // 4. Akun Media Sosial (@handle, ig/wa/line/tiktok/tele)
  applyPattern(
    /(?:@[a-zA-Z0-9_.]{2,30}|\b(?:ig|instagram|tiktok|wa|whatsapp|telegram|line)\s*[:=-]?\s*@?[a-zA-Z0-9_.]{3,30})/gi,
    '[MEDSOS_DIHAPUS]',
    'SOCIAL_MEDIA'
  );

  // 5. Nama Sekolah (SMAN, SMA, SMK, MA, MAN, Madrasah, Sekolah ...)
  applyPattern(
    /\b(?:sman|sma\s+negeri|sma|smkn|smk|man|mts|smpn|smp)\s+[a-zA-Z0-9\s]{1,30}?(?=[,.!?;:\n]|$|\b(?:kelas|karena|mau|ingin|takut|di|yang)\b)/gi,
    '[SEKOLAH_DIHAPUS]',
    'SCHOOL'
  );

  // 6. Alamat fisik (Jl., Jalan, RT/RW, Desa, Kelurahan, Kecamatan, Perumahan, Dusun)
  applyPattern(
    /\b(?:jl\.?|jalan|perumahan|perum|dusun|desa|kelurahan|kecamatan|kabupaten|rt\s*\d+|rw\s*\d+)\s+[a-zA-Z0-9.,/\-\s]{2,45}?(?=[,.!?;:\n]|$|\b(?:nomor|no|hp|wa|dan|saya|aku)\b)/gi,
    '[ALAMAT_DIHAPUS]',
    'ADDRESS'
  );

  // 7. Nama diri melalui pola perkenalan ("nama saya Budi Santoso", "aku Rina Amelia", "panggil aku Dika")
  applyPattern(
    /\b(?:nama\s+saya|nama\s+aku|namaku|panggil\s+saya|panggil\s+aku|saya\s+bernama|perkenalkan\s+saya|perkenalkan\s+aku)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,2})/gi,
    '[NAMA_DIHAPUS]',
    'NAME'
  );

  return {
    scrubbedText: text,
    redactedCount,
    redactedTypes: Array.from(redactedTypes),
  };
}
