import crypto, { BinaryLike, Encoding } from "crypto";

export function createHash (algorithm:string,source:BinaryLike,encoding:Encoding="hex"){
  return crypto
    .createHash(algorithm)
    .update(source)
    // @ts-ignore
    .digest(encoding);
}

export function sha1 (source:BinaryLike,encoding:Encoding="hex"){
  return createHash("sha1",source,encoding);
}

export function sha256 (source:BinaryLike,encoding:Encoding="hex"){
  return createHash("sha256",source,encoding);
}


export function md5 (source:BinaryLike,encoding:Encoding="hex"){
  return createHash("md5",source,encoding);
}
