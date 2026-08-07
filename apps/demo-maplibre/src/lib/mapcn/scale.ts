import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Expression, MapLegendData } from "./types";
import { sampleRamp } from "./colors";

export type ChoroplethScale =
  | { type: "quantize"; steps?: number; colors?: Array<string>; domain?: [number, number] }
  | { type: "quantile"; steps?: number; colors?: Array<string> }
  | { type: "threshold"; breaks: Array<number>; colors: Array<string> }
  | { type: "linear"; colors: Array<string>; domain?: [number, number] };

const DEFAULT_COLORS = ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"];

function extractValues(data: FeatureCollection, property: string): Array<number> {
  const values: Array<number> = [];
  for (const feature of data.features as Array<Feature<Geometry>>) {
    const raw = feature.properties?.[property];
    if (typeof raw === "number" && Number.isFinite(raw)) values.push(raw);
  }
  return values;
}

function domainOf(values: Array<number>): [number, number] {
  if (values.length === 0) return [0, 1];
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

function quantiles(sorted: Array<number>, steps: number): Array<number> {
  const breaks: Array<number> = [];
  for (let i = 1; i < steps; i++) {
    const pos = (i / steps) * (sorted.length - 1);
    const lower = Math.floor(pos);
    const upper = Math.ceil(pos);
    const weight = pos - lower;
    const value =
      lower === upper
        ? (sorted[lower] as number)
        : (sorted[lower] as number) * (1 - weight) + (sorted[upper] as number) * weight;
    breaks.push(value);
  }
  return breaks;
}

export interface ComputedScale {
  /** Ascending break points, excluding the domain min/max. */
  breaks: Array<number>;
  colors: Array<string>;
  domain: [number, number];
}

/** Computes breaks + colors for a scale, given the data it will be applied to. */
export function computeScale(scale: ChoroplethScale, data: FeatureCollection, property: string): ComputedScale {
  switch (scale.type) {
    case "threshold":
      return { breaks: scale.breaks, colors: scale.colors, domain: domainOf(extractValues(data, property)) };

    case "linear": {
      const domain = scale.domain ?? domainOf(extractValues(data, property));
      return { breaks: [], colors: scale.colors, domain };
    }

    case "quantize": {
      const steps = scale.steps ?? 5;
      const domain = scale.domain ?? domainOf(extractValues(data, property));
      const [min, max] = domain;
      const span = max - min;
      const breaks: Array<number> = [];
      for (let i = 1; i < steps; i++) breaks.push(min + (span * i) / steps);
      return { breaks, colors: scale.colors ?? sampleRamp(DEFAULT_COLORS, steps), domain };
    }

    case "quantile": {
      const steps = scale.steps ?? 5;
      const sorted = extractValues(data, property).slice().sort((a, b) => a - b);
      const breaks = quantiles(sorted, steps);
      return {
        breaks,
        colors: scale.colors ?? sampleRamp(DEFAULT_COLORS, steps),
        domain: domainOf(sorted),
      };
    }
  }
}

/**
 * Compiles a computed scale into a style-spec `["step", ...]` expression.
 * Used for quantize/quantile/threshold scales, which are inherently
 * discrete.
 */
export function buildStepExpression(
  property: string,
  computed: ComputedScale,
  missingColor = "rgba(0,0,0,0)",
): Expression {
  const expression: Expression = [
    "case",
    ["!", ["has", property]],
    missingColor,
    [
      "step",
      ["get", property],
      computed.colors[0],
    ],
  ];
  const stepArgs = expression[3] as Expression;
  computed.breaks.forEach((breakpoint, i) => {
    stepArgs.push(breakpoint, computed.colors[i + 1]);
  });
  return expression;
}

/** Compiles a continuous (linear) scale into an `["interpolate", ["linear"], ...]` expression. */
export function buildInterpolateExpression(
  property: string,
  colors: Array<string>,
  domain: [number, number],
  missingColor = "rgba(0,0,0,0)",
): Expression {
  const [min, max] = domain;
  const span = max - min || 1;
  const stops: Expression = ["interpolate", ["linear"], ["get", property]];
  colors.forEach((color, i) => {
    const t = i / (colors.length - 1 || 1);
    stops.push(min + span * t, color);
  });
  return ["case", ["!", ["has", property]], missingColor, stops];
}

export function buildChoroplethLegend(
  scale: ChoroplethScale,
  computed: ComputedScale,
  options?: { unit?: string },
): MapLegendData {
  if (scale.type === "linear") {
    const [min, max] = computed.domain;
    const span = max - min || 1;
    return {
      type: "gradient",
      domain: computed.domain,
      unit: options?.unit,
      stops: computed.colors.map((color, i) => ({
        at: min + span * (i / (computed.colors.length - 1 || 1)),
        color,
      })),
    };
  }

  const edges = [computed.domain[0], ...computed.breaks, computed.domain[1]];
  return {
    type: "steps",
    unit: options?.unit,
    items: computed.colors.map((color, i) => ({
      color,
      from: edges[i],
      to: edges[i + 1],
      label: `${formatNumber(edges[i] as number)}–${formatNumber(edges[i + 1] as number)}`,
    })),
  };
}

export function buildHeatmapLegend(
  colors: Array<string>,
  domain: [number, number],
  options?: { unit?: string },
): MapLegendData {
  const [min, max] = domain;
  const span = max - min || 1;
  return {
    type: "gradient",
    domain,
    unit: options?.unit,
    stops: colors.map((color, i) => ({
      at: min + span * (i / (colors.length - 1 || 1)),
      color,
    })),
  };
}

export function buildCategoricalLegend(
  entries: Array<{ label: string; color: string; value?: string | number }>,
): MapLegendData {
  return { type: "categorical", items: entries };
}

function formatNumber(value: number): string {
  return Math.abs(value) >= 1000 ? value.toFixed(0) : Number(value.toFixed(2)).toString();
}
