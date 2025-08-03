import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard

const ENCRYPTION_KEY = Buffer.from(process.env.SESSION_KEY_SECRET || '', 'hex'); // 32 bytes

export function encryptSessionKey(sessionKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(sessionKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  // Store iv and tag with ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decryptSessionKey(encrypted: string): string {
  const [ivHex, tagHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}