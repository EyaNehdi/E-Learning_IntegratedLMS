const crypto = require('crypto');

const MFA_SECRET_KEY = process.env.MFA_SECRET_KEY;

const encryptSecret = (plaintext) => {
  const iv = crypto.randomBytes(16); // AES-CBC requires a 16-byte IV
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(MFA_SECRET_KEY, 'base64'), iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  // Concatenate IV and ciphertext as a single string (with base64 encoding)
  const ivAndCiphertext = `${iv.toString('base64')}:${ciphertext}`;

  return ivAndCiphertext;  // Return combined IV and ciphertext
}

// Decrypt using AES-256-CBC (expecting combined IV + ciphertext)
const decryptSecret = (ivAndCiphertext) => {
  const [ivBase64, ciphertextBase64] = ivAndCiphertext.split(':');

  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = ciphertextBase64;

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(MFA_SECRET_KEY, 'base64'),
    iv
  );

  let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

module.exports = { encryptSecret, decryptSecret };
