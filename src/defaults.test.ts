import { describe, it, expect, vi, afterEach } from "vitest";
import {
  BASE62,
  generateId,
  MAX_SUFFIX_LENGTH,
  TIMESTAMP_WIDTH,
} from "./defaults";

// Decodes a base62 string back to a number (inverse of encodeBase62Fixed).
const decodeBase62 = (s: string): number =>
  [...s].reduce((acc, c) => acc * 62 + BASE62.indexOf(c), 0);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MAX_SUFFIX_LENGTH", () => {
  it("is 22", () => {
    expect(MAX_SUFFIX_LENGTH).toBe(22);
  });
});

describe("TIMESTAMP_WIDTH", () => {
  it("is 8", () => {
    expect(TIMESTAMP_WIDTH).toBe(8);
  });
});

describe("BASE62", () => {
  it("has exactly 62 characters", () => {
    expect(BASE62).toHaveLength(62);
  });

  it("contains no duplicate characters", () => {
    expect(new Set(BASE62).size).toBe(62);
  });

  it("is ASCII-sorted (lexicographic order = numeric order)", () => {
    for (let i = 0; i < BASE62.length - 1; i++) {
      expect(BASE62[i] < BASE62[i + 1]).toBe(true);
    }
  });
});

describe("generateId", () => {
  it("returns a string of exactly the requested length", () => {
    for (const len of [
      4,
      6,
      TIMESTAMP_WIDTH,
      TIMESTAMP_WIDTH + 1,
      16,
      MAX_SUFFIX_LENGTH,
    ]) {
      expect(generateId(len)).toHaveLength(len);
    }
  });

  it("uses only base62 characters", () => {
    const id = generateId(MAX_SUFFIX_LENGTH);
    expect(id).toMatch(/^[0-9A-Za-z]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(
      Array.from({ length: 100 }, () => generateId(MAX_SUFFIX_LENGTH)),
    );
    expect(ids.size).toBe(100);
  });

  describe("for length > TIMESTAMP_WIDTH", () => {
    it("encodes the current timestamp in the first chars", () => {
      const before = Date.now();
      const id = generateId(MAX_SUFFIX_LENGTH);
      const after = Date.now();
      const decoded = decodeBase62(id.slice(0, TIMESTAMP_WIDTH));
      expect(decoded).toBeGreaterThanOrEqual(before);
      expect(decoded).toBeLessThanOrEqual(after);
    });

    it("IDs sort chronologically (earlier < later lexicographically)", () => {
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1_000_000)
        .mockReturnValueOnce(2_000_000);
      const earlier = generateId(MAX_SUFFIX_LENGTH);
      const later = generateId(MAX_SUFFIX_LENGTH);
      expect(earlier < later).toBe(true);
    });

    it("IDs with the same timestamp still differ (random suffix)", () => {
      vi.spyOn(Date, "now").mockReturnValue(1_748_217_600_000);
      const ids = new Set(
        Array.from({ length: 50 }, () => generateId(MAX_SUFFIX_LENGTH)),
      );
      expect(ids.size).toBe(50);
    });
  });

  describe("for length <= TIMESTAMP_WIDTH", () => {
    it("does not use a timestamp prefix (output varies even at fixed time)", () => {
      vi.spyOn(Date, "now").mockReturnValue(1_748_217_600_000);
      const ids = new Set(
        Array.from({ length: 20 }, () => generateId(TIMESTAMP_WIDTH)),
      );
      expect(ids.size).toBeGreaterThan(1);
    });

    it("still uses only base62 characters", () => {
      const id = generateId(6);
      expect(id).toMatch(/^[0-9A-Za-z]{6}$/);
    });
  });
});
