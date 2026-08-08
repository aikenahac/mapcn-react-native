import { describe, expect, it } from "vitest";
import {
  circlePaintFrom,
  clusterStepExpression,
  combineFilters,
  fillPaintFrom,
  geometryTypeFilter,
  linePaintFrom,
  selectionFilter,
} from "./style";

describe("circlePaintFrom", () => {
  it("maps point-style keys to circle- paint keys", () => {
    expect(circlePaintFrom({ color: "#f00", radius: 6, opacity: 0.5, strokeColor: "#fff", strokeWidth: 2 })).toEqual({
      circleColor: "#f00",
      circleRadius: 6,
      circleOpacity: 0.5,
      circleStrokeColor: "#fff",
      circleStrokeWidth: 2,
    });
  });

  it("omits unset keys rather than writing them as undefined", () => {
    expect(circlePaintFrom({ color: "#f00" })).toEqual({ circleColor: "#f00" });
  });

  it("returns undefined for false or undefined", () => {
    expect(circlePaintFrom(false)).toBeUndefined();
    expect(circlePaintFrom(undefined)).toBeUndefined();
  });
});

describe("linePaintFrom", () => {
  it("maps line-style keys to line- paint keys", () => {
    expect(linePaintFrom({ color: "#00f", width: 3, dashArray: [2, 1] })).toEqual({
      lineColor: "#00f",
      lineWidth: 3,
      lineDasharray: [2, 1],
    });
  });
});

describe("fillPaintFrom", () => {
  it("maps fill-style keys to fill- paint keys", () => {
    expect(fillPaintFrom({ color: "#0f0", opacity: 0.3, outlineColor: "#000" })).toEqual({
      fillColor: "#0f0",
      fillOpacity: 0.3,
      fillOutlineColor: "#000",
    });
  });
});

describe("geometryTypeFilter", () => {
  it("builds an 'in' expression over geometry-type", () => {
    expect(geometryTypeFilter(["Point", "MultiPoint"])).toEqual(["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]]);
  });
});

describe("combineFilters", () => {
  it("returns a bare 'all' for no filters", () => {
    expect(combineFilters()).toEqual(["all"]);
  });

  it("returns the single filter unwrapped when only one is given", () => {
    const f = geometryTypeFilter(["Point"]);
    expect(combineFilters(f, undefined)).toBe(f);
  });

  it("wraps multiple filters in 'all'", () => {
    const a = geometryTypeFilter(["Point"]);
    const b = selectionFilter("id", 1);
    expect(combineFilters(a, b)).toEqual(["all", a, b]);
  });
});

describe("selectionFilter", () => {
  it("builds an equality filter against the id property", () => {
    expect(selectionFilter("id", "abc")).toEqual(["==", ["get", "id"], "abc"]);
    expect(selectionFilter("id", 5)).toEqual(["==", ["get", "id"], 5]);
  });
});

describe("clusterStepExpression", () => {
  it("builds a step expression sorted by threshold regardless of input order", () => {
    const expr = clusterStepExpression(
      [
        { at: 100, color: "#c" },
        { at: 10, color: "#a" },
        { at: 50, color: "#b" },
      ],
      "color",
      "#base",
    );
    expect(expr).toEqual(["step", ["get", "point_count"], "#base", 10, "#a", 50, "#b", 100, "#c"]);
  });

  it("picks radius or color based on the key argument", () => {
    const steps = [{ at: 10, color: "#a", radius: 20 }];
    expect(clusterStepExpression(steps, "radius", 15)).toEqual(["step", ["get", "point_count"], 15, 10, 20]);
  });

  it("skips a step missing the requested key", () => {
    const steps = [{ at: 10, color: "#a" }];
    expect(clusterStepExpression(steps, "radius", 15)).toEqual(["step", ["get", "point_count"], 15]);
  });
});
