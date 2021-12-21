import { default as nodeCrypto, BinaryLike, Encoding } from 'crypto';
import { assert } from './errors';

export function createHash(
  algorithm: string,
  source: BinaryLike,
  encoding: Encoding = 'hex',
) {
  return (
    nodeCrypto
      .createHash(algorithm)
      .update(source)
      // @ts-ignore
      .digest(encoding)
  );
}

export function sha1(source: BinaryLike, encoding: Encoding = 'hex') {
  return createHash('sha1', source, encoding);
}

export function sha256(source: BinaryLike, encoding: Encoding = 'hex') {
  return createHash('sha256', source, encoding);
}

export function md5(source: BinaryLike, encoding: Encoding = 'hex') {
  return createHash('md5', source, encoding);
}

const ivLength = 16; // required for AES
const encoding = 'base64';
const algorithm = 'aes-256-cbc';

/**
 * Create a strong encryption of some source data using AES256-CBC
 */
export function encrypt(text: string | Buffer, key: string) {
  assert(key.length == 32, 'Key must be length 32');
  const iv = nodeCrypto.randomBytes(ivLength);
  const cipher = nodeCrypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString(encoding)}:${encrypted.toString(encoding)}`;
}

/**
 * Decrypt something encrypted using the sibling 'encrypt' function.
 */
export function decrypt(encryptionString: string, key: string) {
  assert(key.length == 32, 'Key must be length 32');
  const [iv, encrypted] = encryptionString
    .split(':')
    .map((string) => Buffer.from(string, encoding));
  const decipher = nodeCrypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted;
}

export const crypto = {
  createHash,
  decrypt,
  encrypt,
  md5,
  sha1,
  sha256,
};
