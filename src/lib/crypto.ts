import crypto, { BinaryLike, HexBase64Latin1Encoding } from "crypto";

export function createHash (algorithm:string,source:BinaryLike,encoding:HexBase64Latin1Encoding="hex"){
  return crypto
    .createHash(algorithm)
    .update(source)
    .digest(encoding);
}

export function sha1 (source:BinaryLike,encoding:HexBase64Latin1Encoding="hex"){
  return createHash("sha1",source,encoding);
}

export function sha256 (source:BinaryLike,encoding:HexBase64Latin1Encoding="hex"){
  return createHash("sha256",source,encoding);
}


export function md5 (source:BinaryLike,encoding:HexBase64Latin1Encoding="hex"){
  return createHash("md5",source,encoding);
}
