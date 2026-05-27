import type { Config } from "./types";

// 0-9 then A-Z then a-z: ASCII order matches index order, so base62 strings
// sort lexicographically in the same order as their numeric values.
export const BASE62 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// 62^8 ≈ 218 trillion ms — sufficient until year ~8878.
export const TIMESTAMP_WIDTH = 8;

/** Maximum suffix length: 128-bit UUID entropy encoded in base62. */
export const MAX_SUFFIX_LENGTH = 22;

const getRandomBytes = (n: number): Uint8Array => {
  const buf = new Uint8Array(n);
  // Web Crypto API: all modern browsers (2013+) and Node.js 17+.
  // Falls back to Math.random for Node < 17 / legacy browsers (not cryptographically secure).
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < n; i++) buf[i] = (Math.random() * 256) | 0;
  }
  return buf;
};

// Encodes `n` as a fixed-width base62 string (big-endian, zero-padded).
// Lexicographic order of the output matches numeric order of `n`.
const encodeBase62Fixed = (n: number, width: number): string => {
  let out = "";
  for (let i = 0; i < width; i++) {
    out = BASE62[n % 62] + out;
    n = Math.floor(n / 62);
  }
  return out;
};

export const generateId = (length: number): string => {
  const ts =
    length > TIMESTAMP_WIDTH
      ? encodeBase62Fixed(Date.now(), TIMESTAMP_WIDTH)
      : "";
  const randomLen = length - ts.length;
  const bytes = getRandomBytes(randomLen);
  let rand = "";
  for (let i = 0; i < randomLen; i++) rand += BASE62[bytes[i] % 62];
  return ts + rand;
};
