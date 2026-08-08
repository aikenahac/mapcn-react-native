import { describe, expect, it } from "vitest";
import {
  buildChoroplethLegend,
  buildInterpolateExpression,
  buildStepExpression,
  computeScale,
} from "./scale";
import type { FeatureCollection } from "geojson";

function fc(values: Array<number | null>): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: values.map((v) => ({
      type: "Feature",
      properties: v === null ? {} : { value: v },
      geometry: { type: "Point", coordinates: [0, 0] },
    })),
  };
}

describe("computeScale", () => {
  it("quantize: splits the domain into equal-width buckets", () => {
    const computed = computeScale({ type: "quantize", steps: 4 }, fc([0, 25, 50, 75, 100]), "value");
    expect(computed.domain).toEqual([0, 100]);
    expect(computed.breaks).toEqual([25, 50, 75]);
    expect(computed.colors).toHaveLength(4);
  });

  it("quantile: breaks fall at data percentiles, not equal domain width", () => {
    // Skewed distribution: quantile breaks should differ from quantize breaks.
    const data = fc([1, 1, 1, 1, 1, 1, 1, 1, 1, 100]);
    const quantile = computeScale({ type: "quantile", steps: 2 }, data, "value");
    const quantize = computeScale({ type: "quantize", steps: 2 }, data, "value");
    expect(quantile.breaks[0]).not.toBeCloseTo(quantize.breaks[0] as number, 0);
  });

  it("threshold: uses explicit user-supplied breaks verbatim", () => {
    const computed = computeScale(
      { type: "threshold", breaks: [10, 20], colors: ["#a", "#b", "#c"] },
      fc([5, 15, 25]),
      "value",
    );
    expect(computed.breaks).toEqual([10, 20]);
    expect(computed.colors).toEqual(["#a", "#b", "#c"]);
  });

  it("linear: uses continuous domain, no discrete breaks", () => {
    const computed = computeScale({ type: "linear", colors: ["#000", "#fff"] }, fc([0, 50, 100]), "value");
    expect(computed.breaks).toEqual([]);
    expect(computed.domain).toEqual([0, 100]);
  });

  it("respects an explicit domain override", () => {
    const computed = computeScale({ type: "quantize", steps: 2, domain: [0, 200] }, fc([10, 20]), "value");
    expect(computed.domain).toEqual([0, 200]);
    expect(computed.breaks).toEqual([100]);
  });
});

describe("buildStepExpression", () => {
  it("compiles to a case-guarded step expression with one color per bucket", () => {
    const computed = computeScale({ type: "quantize", steps: 3, colors: ["#a", "#b", "#c"] }, fc([0, 100]), "v");
    const expr = buildStepExpression("v", computed);
    expect(expr[0]).toBe("case");
    const stepExpr = expr[3];
    expect(stepExpr[0]).toBe("step");
    expect(stepExpr[1]).toEqual(["get", "v"]);
    // base color + (breaks.length pairs)
    expect(stepExpr).toHaveLength(2 + 1 + computed.breaks.length * 2);
  });
});

describe("buildInterpolateExpression", () => {
  it("compiles a linear interpolation across the domain", () => {
    const expr = buildInterpolateExpression("v", ["#000000", "#ffffff"], [0, 100]);
    expect(expr[0]).toBe("case");
    const interp = expr[3];
    expect(interp[0]).toBe("interpolate");
    expect(interp[1]).toEqual(["linear"]);
    expect(interp[3]).toBe(0);
    expect(interp[interp.length - 2]).toBe(100);
  });
});

describe("buildChoroplethLegend", () => {
  it("produces one legend item per color for discrete scales", () => {
    const scale = { type: "quantize" as const, steps: 3 };
    const computed = computeScale(scale, fc([0, 50, 100]), "v");
    const legend = buildChoroplethLegend(scale, computed);
    expect(legend.type).toBe("steps");
    if (legend.type === "steps") {
      expect(legend.items).toHaveLength(3);
    }
  });

  it("produces a gradient for linear scales", () => {
    const scale = { type: "linear" as const, colors: ["#000", "#fff"] };
    const computed = computeScale(scale, fc([0, 100]), "v");
    const legend = buildChoroplethLegend(scale, computed);
    expect(legend.type).toBe("gradient");
  });
});
