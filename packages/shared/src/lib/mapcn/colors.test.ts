import { describe, expect, it } from "vitest";
import { hexToRgba, sampleRamp } from "./colors";

describe("hexToRgba", () => {
  it("converts a 6-digit hex to rgba", () => {
    expect(hexToRgba("#ff0000")).toBe("rgba(255, 0, 0, 1)");
  });

  it("converts a 3-digit hex to rgba", () => {
    expect(hexToRgba("#f00")).toBe("rgba(255, 0, 0, 1)");
  });

  it("applies the alpha argument", () => {
    expect(hexToRgba("#000000", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
  });
});

describe("sampleRamp", () => {
  it("returns the ramp unchanged when count matches", () => {
    const ramp = ["#111111", "#222222", "#333333"];
    expect(sampleRamp(ramp, 3)).toEqual(ramp);
  });

  it("returns a single color when count is 1", () => {
    expect(sampleRamp(["#111111", "#222222"], 1)).toEqual(["#111111"]);
  });

  it("interpolates additional stops when count exceeds the ramp length", () => {
    const result = sampleRamp(["#000000", "#ffffff"], 5);
    expect(result).toHaveLength(5);
    expect(result[0]).toBe("#000000");
    expect(result[4]).toBe("#ffffff");
    // Middle stop should be roughly mid-gray.
    expect(result[2]?.toLowerCase()).toBe("#808080");
  });
});
