import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../passwords';

describe('Cryptographic Password Authentication', () => {
  it('hashes passwords with unique salts', () => {
    const p1 = hashPassword('SuperSecret123!');
    const p2 = hashPassword('SuperSecret123!');

    expect(p1.salt).not.toBe(p2.salt);
    expect(p1.hash).not.toBe(p2.hash);
    expect(p1.hash.length).toBe(128); // 64 bytes hex
  });

  it('correctly verifies valid passwords against salted hash', () => {
    const { salt, hash } = hashPassword('CorrectPassword#2026');
    const isValid = verifyPassword('CorrectPassword#2026', salt, hash);
    expect(isValid).toBe(true);
  });

  it('rejects invalid passwords', () => {
    const { salt, hash } = hashPassword('CorrectPassword#2026');
    const isValid = verifyPassword('WrongPassword#2026', salt, hash);
    expect(isValid).toBe(false);
  });

  it('rejects corrupted or mismatched salt/hashes gracefully without crashing', () => {
    const isValid = verifyPassword('any', 'corrupted', 'invalid');
    expect(isValid).toBe(false);
  });
});
