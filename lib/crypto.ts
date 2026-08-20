import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const hexKey = process.env.PAN_ENCRYPTION_KEY || '4a7f289b0d1e3f8a9c2b4d6e8f0a1c3b5d7e9f1a2b4c6d8e0f1a3b5c7d9e1f2a';
  return Buffer.from(hexKey, 'hex');
}

/**
 * Validates Indian PAN format (5 letters, 4 numbers, 1 letter).
 * Example: CPRPT3173B
 */
export function isValidPAN(pan: string): boolean {
  if (!pan) return false;
  const uppercasePan = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(uppercasePan);
}

/**
 * Masks a PAN number for safe UI display.
 * Example: CPRPT3173B -> CPRPT••••B
 */
export function maskPAN(pan: string): string {
  if (!pan) return '••••••••••';
  const trimmed = pan.trim().toUpperCase();
  if (trimmed.length !== 10) return '••••••••••';
  return `${trimmed.slice(0, 5)}••••${trimmed.slice(9)}`;
}

/**
 * Encrypts a raw PAN string using AES-256-GCM (Node native crypto).
 * Format: ivHex:authTagHex:encryptedHex
 */
export function encryptPAN(pan: string): string {
  const normalizedPan = pan.trim().toUpperCase();
  if (!isValidPAN(normalizedPan)) {
    throw new Error('Invalid PAN format provided for encryption');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(normalizedPan, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted PAN string using AES-256-GCM.
 */
export function decryptPAN(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) {
    throw new Error('Invalid encrypted payload format');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted PAN payload');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
