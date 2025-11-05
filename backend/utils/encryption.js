const crypto = require('crypto');

// Encryption key from environment - MUST be set in production
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY;

// Validate encryption key on startup
if (!ENCRYPTION_KEY) {
  console.warn('WARNING: SETTINGS_ENCRYPTION_KEY not set in environment. Encrypted settings will not work properly.');
}

const ALGORITHM = 'aes-256-ctr';

/**
 * Encrypt sensitive text
 * @param {string} text - The text to encrypt
 * @returns {string|null} - Encrypted text in format 'iv:encrypted' or null
 */
function encrypt(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) {
    console.error('Cannot encrypt: SETTINGS_ENCRYPTION_KEY not configured');
    return null;
  }

  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32); // Use first 32 bytes (256 bits)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error.message);
    return null;
  }
}

/**
 * Decrypt encrypted text
 * @param {string} text - The encrypted text in format 'iv:encrypted'
 * @returns {string|null} - Decrypted text or null
 */
function decrypt(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY) {
    console.error('Cannot decrypt: SETTINGS_ENCRYPTION_KEY not configured');
    return null;
  }

  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32); // Use first 32 bytes (256 bits)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};
