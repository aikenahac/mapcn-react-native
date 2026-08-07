import { describe, expect, it } from "vitest";
import { contentHash, normalizeContent } from "./hash.js";

describe("normalizeContent", () => {
  it("converts CRLF to LF", () => {
    expect(normalizeContent("a\r\nb\r\n")).toBe("a\nb\n");
  });

  it("collapses trailing newlines to exactly one", () => {
    expect(normalizeContent("a\n\n\n")).toBe("a\n");
  });

  it("adds a trailing newline when missing", () => {
    expect(normalizeContent("a")).toBe("a\n");
  });
});

describe("contentHash", () => {
  it("is stable for equivalent content regardless of line endings", () => {
    expect(contentHash("a\r\nb")).toBe(contentHash("a\nb\n"));
  });

  it("differs for different content", () => {
    expect(contentHash("a")).not.toBe(contentHash("b"));
  });

  it("is prefixed with sha256-", () => {
    expect(contentHash("x")).toMatch(/^sha256-[0-9a-f]{16}$/);
  });
});
