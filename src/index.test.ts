import { describe, it, expect, vi } from "vitest";
import { configure } from "./index";

const ids = configure({
  task: "t",
  user: ["tm", 6],
  project: "pr",
});

describe("newId", () => {
  it("returns prefix_suffix format", () => {
    const id = ids.newId("task");
    expect(id).toMatch(/^t_[a-zA-Z0-9]+$/);
  });

  it("uses provided suffix", () => {
    const id = ids.newId("task", "abc123");
    expect(id).toBe("t_abc123");
  });

  it("throws on unknown type", () => {
    // @ts-expect-error intentional
    expect(() => ids.newId("unknown")).toThrow("Unknown entity type: unknown");
  });
});

describe("toType", () => {
  it("extracts correct type from id", () => {
    expect(ids.toType("t_abc12345")).toBe("task");
    expect(ids.toType("tm_xyz123")).toBe("user");
    expect(ids.toType("pr_abc12345")).toBe("project");
  });

  it("returns undefined for unknown prefix", () => {
    expect(ids.toType("foo_bar12345")).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(ids.toType(undefined)).toBeUndefined();
  });
});

describe("isTypeId", () => {
  it("validates a known id", () => {
    const id = ids.newId("task", "abcd1234");
    expect(ids.isTypeId(id)).toBe(true);
  });

  it("rejects unknown prefix", () => {
    expect(ids.isTypeId("foo_abcd1234")).toBe(false);
  });

  it("rejects undefined", () => {
    expect(ids.isTypeId(undefined)).toBe(false);
  });

  it("rejects suffix that is too short", () => {
    expect(ids.isTypeId("t_ab")).toBe(false);
  });
});

describe("isTypeOf", () => {
  it("returns true for matching type", () => {
    expect(ids.isTypeOf("t_abcd1234", "task")).toBe(true);
  });

  it("returns false for different type", () => {
    expect(ids.isTypeOf("pr_abcd1234", "task")).toBe(false);
  });

  it("works as array filter predicate", () => {
    const mixed = ["t_aaa11111", "pr_bbb22222", "t_ccc33333"];
    const tasks = mixed.filter((id) => ids.isTypeOf(id, "task"));
    expect(tasks).toEqual(["t_aaa11111", "t_ccc33333"]);
  });
});

describe("toUniqPart", () => {
  it("extracts suffix", () => {
    expect(ids.toUniqPart("t_abcd1234")).toBe("abcd1234");
  });

  it("returns undefined for undefined input", () => {
    expect(ids.toUniqPart(undefined)).toBeUndefined();
  });

  it("returns undefined when no underscore", () => {
    expect(ids.toUniqPart("nounderscore")).toBeUndefined();
  });

  it("handles ids with underscores in suffix", () => {
    expect(ids.toUniqPart("t_abc_def")).toBe("abc_def");
  });
});

describe("extractIds", () => {
  it("finds all IDs embedded in text", () => {
    const text = "See t_abcd1234 and pr_xyz98765 for details.";
    expect(ids.extractIds(text)).toEqual(["t_abcd1234", "pr_xyz98765"]);
  });

  it("returns empty array when no ids found", () => {
    expect(ids.extractIds("no ids here")).toEqual([]);
  });
});

describe("custom generateId config", () => {
  it("calls the custom generator with the correct length", () => {
    const generateId = vi.fn(() => "custom12");
    const custom = configure({ task: ["task", 8] }, { generateId });
    custom.newId("task");
    expect(generateId).toHaveBeenCalledWith(8);
  });
});

describe("per-type length override", () => {
  it("respects [prefix, length] tuple", () => {
    const generateId = vi.fn((len: number) => "x".repeat(len));
    const custom = configure({ short: ["sh", 4] }, { generateId });
    const id = custom.newId("short");
    expect(generateId).toHaveBeenCalledWith(4);
    expect(id).toBe("sh_xxxx");
  });
});
