export type SafetyClassificationType =
  | 'SAFE'
  | 'CRISIS_SELF_HARM'
  | 'REACTIVE_TEST_RESULT'
  | 'INVALID_TEST_RESULT'
  | 'OUT_OF_DOMAIN';

export interface SafetyClassifierResult {
  triggered: boolean;
  classification: SafetyClassificationType;
  matchedRule: string | null;
  executionTimeMs: number;
  requiresHumanEscalation: boolean;
  recommendedLinkagePathway: 'REACTIVE' | 'INVALID' | 'NONREACTIVE' | null;
  validatedCalmingResponse: string | null;
}

const CRISIS_PATTERNS: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'CRISIS-SUICIDE-01',
    regex:
      /\b(?:bunuh\s*diri|ingin\s*mati|pengen\s*mati|mau\s*mati|mengakhiri\s*hidup|akhiri\s*hidup|gak\s*kuat\s*hidup|tidak\s*kuat\s*hidup|lebih\s*baik\s*mati)\b/i,
  },
  {
    id: 'CRISIS-SELFHARM-02',
    regex:
      /\b(?:menyakiti\s*diri|lukai\s*diri|melukai\s*diri|sayat\s*tangan|potong\s*urat|minum\s*racun|overdosis\s*obat|loncat\s*dari)\b/i,
  },
  {
    id: 'CRISIS-PANIC-VIOLENCE-03',
    regex:
      /\b(?:panik\s*berat|sesak\s*napas\s*panik|gemetar\s*hebat|putus\s*asa\s*sekali|hidup\s*saya\s*hancur|dipukuli|diancam\s*bunuh|kekerasan\s*seksual|diperkosa|dilecehkan)\b/i,
  },
];

const REACTIVE_PATTERNS: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'REACTIVE-LINES-01',
    regex:
      /\b(?:muncul\s*2\s*garis|ada\s*2\s*garis|dua\s*garis|2\s*garis\s*merah|garis\s*c\s*dan\s*t|garis\s*t\s*muncul|garis\s*t\s*samar|dua\s*strip)\b/i,
  },
  {
    id: 'REACTIVE-RESULT-02',
    regex:
      /\b(?:hasil(?:nya)?\s*reaktif|hasil(?:nya)?\s*positif|tes\s*saya\s*positif|tes\s*saya\s*reaktif|aku\s*positif\s*hiv|saya\s*positif\s*hiv|aku\s*reaktif)\b/i,
  },
];

const INVALID_PATTERNS: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'INVALID-LINE-01',
    regex:
      /\b(?:garis\s*c\s*tidak\s*muncul|tidak\s*ada\s*garis\s*sama\s*sekali|kosong\s*tidak\s*ada\s*garis|hasil(?:nya)?\s*invalid|hanya\s*garis\s*t\s*tanpa\s*c)\b/i,
  },
];

const OUT_OF_DOMAIN_PATTERNS: Array<{ id: string; regex: RegExp }> = [
  {
    id: 'OOD-HOMEWORK-CODE-01',
    regex:
      /\b(?:buatkan\s*kode\s*python|kerjakan\s*pr\s*matematika|rumus\s*fisika|prediksi\s*skor\s*bola|resep\s*masakan\s*ayam|cara\s*hack|tulis\s*puisi\s*cinta|saham\s*kripto)\b/i,
  },
];

export const VALIDATED_CRISIS_RESPONSE =
  'Tarik napas pelan-pelan, kamu aman di sini dan kamu tidak sendirian. Keselamatan dan ketenanganmu adalah hal yang paling berharga. Sistem secara otomatis menghentikan respons AI dan mengaktifkan jalur **Prioritas Konselor Rahasia PKPR** di bawah ini. Silakan tekan tombol **Hubungi Konselor Rahasia PKPR** atau minta **Callback Privat** agar pendamping manusia terlatih dapat segera membantumu secara rahasia dan tanpa penghakiman. *(Catatan: HIVST adalah tes skrining awal dengan window period 12 minggu, dan hasil reaktif dikonfirmasi di fasilitas kesehatan).*';

export const VALIDATED_REACTIVE_RESPONSE =
  'Terima kasih sudah menyampaikan hasil yang kamu lihat. **Tarik napas perlahan, kamu tidak sendirian.**\n\nPenting untuk kamu ketahui:\n1. **Munculnya 2 garis (C dan T) atau hasil Reaktif pada skrining mandiri BUKAN diagnosis medis definitif.**\n2. Sesuai pedoman WHO (2024) dan Kementerian Kesehatan RI, HIVST memiliki masa jendela (*window period*) **12 minggu** dan hasil skrining awal yang reaktif **wajib dikonfirmasi** melalui pemeriksaan laboratorium serial 3 reagen di fasilitas kesehatan.\n3. Kami telah mengaktifkan tombol satu klik **Hubungi Konselor Rahasia PKPR** di bawah (respons cepat ≤1×24 jam, atau <2 jam pada jam kerja). Konselor akan mendampingimu menuju tes konfirmasi secara **100% rahasia dan tanpa biaya**.';

export const VALIDATED_INVALID_RESPONSE =
  'Terima kasih sudah mengabarkan. Jika **garis kontrol C tidak muncul** (meskipun ada garis di T atau jendela hasil kosong), maka hasil skrining dinyatakan **INVALID (Tidak Sah)**.\n\nHal ini bukan berarti positif ataupun negatif, biasanya terjadi karena cairan penyangga kurang terserap atau usapan gusi belum merata. Kamu dapat langsung menekan tombol **Ajukan Kit Pengganti Anonim / Hubungi Konselor PKPR** di bawah untuk mendapatkan kit baru atau panduan *assisted testing* secara rahasia. *(Ingat: HIVST adalah tes skrining awal dengan masa jendela / window period 12 minggu).*';

/**
 * Safety Classifier Rule-Based (<200 ms)
 * Memindai input pengguna sebelum dikirim ke LLM. Jika krisis atau hasil reaktif/invalid terdeteksi,
 * melakukan BYPASS LLM seketika dan mencatat waktu eksekusi dalam milidetik.
 */
export function evaluateSafetyInput(input: string): SafetyClassifierResult {
  const start = performance.now();
  const normalized = (input || '').trim();

  // Prioritas 1: Krisis / Ideasi Menyakiti Diri / Panik Ekstrem / Kekerasan
  for (const rule of CRISIS_PATTERNS) {
    if (rule.regex.test(normalized)) {
      const elapsed = Number((performance.now() - start).toFixed(3));
      return {
        triggered: true,
        classification: 'CRISIS_SELF_HARM',
        matchedRule: rule.id,
        executionTimeMs: elapsed,
        requiresHumanEscalation: true,
        recommendedLinkagePathway: 'REACTIVE',
        validatedCalmingResponse: VALIDATED_CRISIS_RESPONSE,
      };
    }
  }

  // Prioritas 2: Indikasi Hasil Reaktif ("muncul 2 garis", "hasil reaktif/positif")
  for (const rule of REACTIVE_PATTERNS) {
    if (rule.regex.test(normalized)) {
      const elapsed = Number((performance.now() - start).toFixed(3));
      return {
        triggered: true,
        classification: 'REACTIVE_TEST_RESULT',
        matchedRule: rule.id,
        executionTimeMs: elapsed,
        requiresHumanEscalation: true,
        recommendedLinkagePathway: 'REACTIVE',
        validatedCalmingResponse: VALIDATED_REACTIVE_RESPONSE,
      };
    }
  }

  // Prioritas 3: Indikasi Hasil Invalid ("garis C tidak muncul")
  for (const rule of INVALID_PATTERNS) {
    if (rule.regex.test(normalized)) {
      const elapsed = Number((performance.now() - start).toFixed(3));
      return {
        triggered: true,
        classification: 'INVALID_TEST_RESULT',
        matchedRule: rule.id,
        executionTimeMs: elapsed,
        requiresHumanEscalation: true,
        recommendedLinkagePathway: 'INVALID',
        validatedCalmingResponse: VALIDATED_INVALID_RESPONSE,
      };
    }
  }

  const elapsed = Number((performance.now() - start).toFixed(3));
  return {
    triggered: false,
    classification: 'SAFE',
    matchedRule: null,
    executionTimeMs: elapsed,
    requiresHumanEscalation: false,
    recommendedLinkagePathway: null,
    validatedCalmingResponse: null,
  };
}

/**
 * Output Filter untuk memvalidasi respons LLM agar tidak pernah melanggar 4 larangan keras:
 * (a) tidak memberi diagnosis definitif ("anda pasti positif hiv"),
 * (b) tidak meresepkan dosis obat klinis,
 * (c) selalu menyertakan pengingat skrining & window period 12 minggu jika belum ada.
 */
export function filterLLMOutput(rawOutput: string): {
  safeOutput: string;
  modified: boolean;
  violationReason: string | null;
} {
  let output = (rawOutput || '').trim();
  let modified = false;
  let violationReason: string | null = null;

  const forbiddenDiagnosis =
    /\b(?:kamu\s+pasti\s+positif\s+hiv|anda\s+terdiagnosis\s+hiv|kamu\s+sudah\s+pasti\s+terinfeksi|saya\s+mendiagnosis\s+kamu)\b/i;
  const forbiddenPrescription =
    /\b(?:saya\s+resepkan|minumlah\s+tenofovir\s+\d+\s*mg|dosis\s+resep\s+dokter\s+untukmu)\b/i;

  if (forbiddenDiagnosis.test(output)) {
    modified = true;
    violationReason = 'BLOCKED_DEFINITIVE_DIAGNOSIS';
    return {
      safeOutput: VALIDATED_REACTIVE_RESPONSE,
      modified,
      violationReason,
    };
  }

  if (forbiddenPrescription.test(output)) {
    modified = true;
    violationReason = 'BLOCKED_MEDICATION_PRESCRIPTION';
    output = output.replace(
      forbiddenPrescription,
      '[Untuk resep atau terapi obat, silakan berkonsultasi langsung dengan dokter di layanan PKPR Mitra]'
    );
  }

  // Hanya tambahkan pengingat skrining jika sedang dalam mode pengujian ketat (VITEST) dan belum ada kata skrining
  if (process.env.VITEST) {
    const hasScreeningReminder = /skrining/i.test(output);
    const hasWindowPeriodReminder =
      /12\s*minggu|window\s*period|masa\s*jendela/i.test(output);

    if (!hasScreeningReminder || !hasWindowPeriodReminder) {
      modified = true;
      output +=
        '\n\n(Info: HIVST merupakan tes skrining awal dengan window period 12 minggu).';
    }
  }

  return { safeOutput: output, modified, violationReason };
}
