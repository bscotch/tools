import { expect } from 'chai';
import { decrypt, encrypt, md5, sha256 } from '../lib/crypto';

describe('Crypto', function () {
  it('can create an md5 checksum', function () {
    const sourceText = 'hello world';
    expect({
      hex: md5(sourceText),
      b64: md5(sourceText, 'base64'),
    }).to.eql({
      hex: '5eb63bbbe01eeed093cb22bb8f5acdc3',
      b64: 'XrY7u+Ae7tCTyyK7j1rNww==',
    });
  });
  it('can create an sha256 checksum', function () {
    const sourceText = 'hello world';
    expect({
      hex: sha256(sourceText),
      b64: sha256(sourceText, 'base64'),
    }).to.eql({
      hex: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      b64: 'uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=',
    });
  });
  it('can encrypt/decrypt a string or buffer', function () {
    const key = '00000000000000000000000000000000';
    const string = 'Hello World';
    const buffer = Buffer.from(string);
    expect(decrypt(encrypt(string, key), key).toString()).to.equal(string);
    expect(decrypt(encrypt(buffer, key), key).toString()).to.equal(string);
  });
});
