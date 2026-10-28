import crypto from 'crypto';

const DEFAULT_DEV_KEY_HEX =
  '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

function getEncryptionKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY_HEX || DEFAULT_DEV_KEY_HEX;
  const clean = hex.trim().padEnd(64, '0').slice(0, 64);
  return Buffer.from(clean, 'hex');
}

/**
 * Enkripsi AES-256-GCM untuk teks sensitif (at-rest encryption pada chat_messages).
 * Format keluaran: ivHex:authTagHex:cipherHex
 */
export function encryptAES256(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Dekripsi AES-256-GCM dari format ivHex:authTagHex:cipherHex
 */
export function decryptAES256(payload: string): string {
  try {
    const parts = payload.split(':');
    if (parts.length !== 3) return payload;
    const [ivHex, authTagHex, cipherHex] = parts;
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(cipherHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return '[Pesan Terenkripsi AES-256]';
  }
}

/**
 * Hash token pseudonim / password menggunakan PBKDF2-SHA512 / Argon2-compatible salt
 * untuk verifikasi satu arah tanpa menyimpan kredensial mentah.
 */
export function hashToken(token: string): string {
  const salt = 'SENYAP-PDP-2026-SALT';
  return crypto
    .pbkdf2Sync(token.trim().toUpperCase(), salt, 10000, 32, 'sha512')
    .toString('hex');
}

/**
 * Menghasilkan SHA-256 hash untuk jejak audit system prompt (prompt_hash).
 */
export function computePromptHash(promptText: string): string {
  return crypto.createHash('sha256').update(promptText, 'utf8').digest('hex');
}
