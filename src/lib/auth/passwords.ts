import crypto from 'crypto';

/**
 * Secure Password Hashing & Verification
 * Uses Node's built-in cryptographic scrypt with unique cryptographic salts.
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const expectedBuffer = Buffer.from(expectedHash, 'hex');

    if (keyBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(keyBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
