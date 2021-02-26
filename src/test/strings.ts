import { expect } from 'chai';
import {
  decodeFromBase64,
  decodeFromBase64JsonString,
  encodeToBase64,
  encodeToBase64JsonString,
  nodent,
  oneline,
  undent,
} from '../lib/strings';

describe('Strings', function () {
  it('can nodent string literals', function () {
    const interp1 = 'hello';
    const interp2 = 'goodbye';
    const nodented = nodent`
      Here is a:
        multine string ${interp1}
        look
    at it goooo ${interp2}
            weeee!
    `;
    const expected = `Here is a:
multine string ${interp1}
look
at it goooo ${interp2}
weeee!`;
    expect(expected).to.equal(nodented);
  });

  it('can undent string literals', function () {
    const interp1 = 'hello';
    const interp2 = 'goodbye';
    const dedented = undent`
      Here is a:
        multine string ${interp1}
        look
    at it goooo ${interp2}
            weeee!
    `;
    const expected = `  Here is a:
    multine string ${interp1}
    look
at it goooo ${interp2}
        weeee!`;
    expect(expected).to.equal(dedented);
  });

  it('can oneline string literals', function () {
    const interp1 = 'hello';
    const interp2 = 'goodbye';
    const onelined = oneline`
      Here is a:
        multine string ${interp1}
        look
    at it goooo ${interp2}
            weeee!
    `;
    const expected = `Here is a: multine string ${interp1} look at it goooo ${interp2} weeee!`;
    expect(expected).to.equal(onelined);
  });

  it('can encode/decode base64', function () {
    const originalText = 'Hello World';
    const knownEncoding = 'SGVsbG8gV29ybGQ=';
    expect(encodeToBase64(originalText)).to.equal(knownEncoding);
    expect(decodeFromBase64(knownEncoding)).to.equal(originalText);
    expect(encodeToBase64(Buffer.from(originalText))).to.equal(knownEncoding);
  });

  it('can encode/decode JavaScript structures via Base64', function () {
    const dataStructure = { hello: 'world' };
    const encodedStringifiedStructure = 'eyJoZWxsbyI6IndvcmxkIn0=';
    expect(encodeToBase64JsonString(dataStructure)).to.equal(
      encodedStringifiedStructure,
    );
    expect(decodeFromBase64JsonString(encodedStringifiedStructure)).to.eql(
      dataStructure,
    );
  });
});
