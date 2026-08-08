/** Built-in sequential and diverging color ramps for choropleths/heatmaps. */
export const SEQUENTIAL_RAMPS: Record<string, Array<string>> = {
  blues: ["#f7fbff", "#c6dbef", "#6baed6", "#2171b5", "#08306b"],
  greens: ["#f7fcf5", "#c7e9c0", "#74c476", "#238b45", "#00441b"],
  oranges: ["#fff5eb", "#fdd0a2", "#fd8d3c", "#d94801", "#7f2704"],
  reds: ["#fff5f0", "#fcbba1", "#fb6a4a", "#cb181d", "#67000d"],
  purples: ["#fcfbfd", "#dadaeb", "#9e9ac8", "#6a51a3", "#3f007d"],
};

export const DIVERGING_RAMPS: Record<string, Array<string>> = {
  redBlue: ["#67001f", "#d6604d", "#f7f7f7", "#4393c3", "#053061"],
  redGreen: ["#a50026", "#f46d43", "#ffffbf", "#66bd63", "#006837"],
};

/** Converts a `#rgb`/`#rrggbb` hex color to an `rgba(...)` string with the given alpha. */
export function hexToRgba(hex: string, alpha = 1): string {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Evenly spreads `count` colors across a ramp via linear interpolation between stops. */
export function sampleRamp(ramp: Array<string>, count: number): Array<string> {
  if (count <= 1) return [ramp[0] as string];
  if (ramp.length === count) return [...ramp];

  const result: Array<string> = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const scaledIndex = t * (ramp.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(ramp.length - 1, lowerIndex + 1);
    const localT = scaledIndex - lowerIndex;
    result.push(lerpColor(ramp[lowerIndex] as string, ramp[upperIndex] as string, localT));
  }
  return result;
}

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const n = hex.replace("#", "");
    const full = n.length === 3
      ? n.split("").map((c) => c + c).join("")
      : n;
    const int = parseInt(full, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const round = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  const r = round((r1 as number) + ((r2 as number) - (r1 as number)) * t);
  const g = round((g1 as number) + ((g2 as number) - (g1 as number)) * t);
  const bl = round((b1 as number) + ((b2 as number) - (b1 as number)) * t);
  return `#${r}${g}${bl}`;
}
