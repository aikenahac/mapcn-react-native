import { describe, expect, it } from "vitest";
import manifest from "../registry.config";
import { validateRegistry } from "./validate";

describe("validateRegistry against the real registry.config.ts", () => {
  it("reports zero errors for the current repo state", () => {
    const issues = validateRegistry(manifest);
    const errors = issues.filter((i) => i.level === "error");
    if (errors.length > 0) {
      // Make failures actionable in CI output, not just "expected 0 to be 1".
      console.error(errors.map((e) => `[${e.component}] ${e.message}`).join("\n"));
    }
    expect(errors).toEqual([]);
  });
});
