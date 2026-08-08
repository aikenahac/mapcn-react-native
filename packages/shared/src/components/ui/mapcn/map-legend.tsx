import { cn } from "@/lib/utils";
import { useEffect, useId, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useOverlay } from "./map";
import type { MapLegendData } from "@/lib/mapcn/types";

export interface MapLegendProps {
  data: MapLegendData;
  title?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "none";
  orientation?: "vertical" | "horizontal";
  formatValue?: (value: number) => string;
  onItemPress?: (item: { label: string; color: string }, index: number) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const POSITION_STYLE = {
  "top-left": { top: 8, left: 8, zIndex: 1000 },
  "top-right": { top: 8, right: 8, zIndex: 1000 },
  "bottom-left": { bottom: 8, left: 8, zIndex: 1000 },
  "bottom-right": { bottom: 8, right: 8, zIndex: 1000 },
} as const;

const defaultFormat = (value: number) => (Math.abs(value) >= 1000 ? value.toFixed(0) : Number(value.toFixed(2)).toString());

/**
 * A reusable legend, driven entirely by plain data (plan §7.7) so it's
 * never coupled to a specific rendering component -- MapChoropleth and
 * MapHeatmap both produce MapLegendData via lib/mapcn/scale.ts's
 * buildChoroplethLegend/buildHeatmapLegend, but any code can hand this a
 * MapLegendData object.
 */
export function MapLegend({ data, title, position = "bottom-left", orientation = "vertical", formatValue = defaultFormat, onItemPress, className, style, children }: MapLegendProps) {
  const content = (
    <View
      className={cn("absolute bg-card border border-border rounded-lg shadow-sm p-3 gap-1.5", className)}
      style={position === "none" ? style : [POSITION_STYLE[position], style]}
      accessibilityRole="list"
    >
      {title && <Text className="text-xs font-semibold text-foreground mb-1">{title}</Text>}
      <LegendBody data={data} orientation={orientation} formatValue={formatValue} onItemPress={onItemPress} />
      {children}
    </View>
  );

  if (position === "none") return content;
  return <LegendOverlayHost>{content}</LegendOverlayHost>;
}

function LegendOverlayHost({ children }: { children: ReactNode }) {
  const { registerOverlay, unregisterOverlay } = useOverlay();
  const id = useId();

  useEffect(() => {
    registerOverlay(id, children);
    return () => unregisterOverlay(id);
  }, [id, children, registerOverlay, unregisterOverlay]);

  return null;
}

function LegendBody({
  data,
  orientation,
  formatValue,
  onItemPress,
}: {
  data: MapLegendData;
  orientation: "vertical" | "horizontal";
  formatValue: (value: number) => string;
  onItemPress?: (item: { label: string; color: string }, index: number) => void;
}) {
  if (data.type === "categorical") {
    return (
      <View className={cn(orientation === "horizontal" ? "flex-row gap-3" : "gap-1")}>
        {data.items.map((item, i) => (
          <LegendRow key={item.label} label={item.label} color={item.color} onPress={onItemPress ? () => onItemPress(item, i) : undefined} />
        ))}
      </View>
    );
  }

  if (data.type === "steps") {
    return (
      <View className={cn(orientation === "horizontal" ? "flex-row gap-3" : "gap-1")}>
        {data.items.map((item, i) => (
          <LegendRow
            key={item.label}
            label={data.unit ? `${item.label} ${data.unit}` : item.label}
            color={item.color}
            onPress={onItemPress ? () => onItemPress(item, i) : undefined}
          />
        ))}
      </View>
    );
  }

  // gradient
  return (
    <View className="gap-1">
      <View className="flex-row h-3 rounded overflow-hidden">
        {data.stops.map((stop, i) => (
          <View key={i} className="flex-1" style={{ backgroundColor: stop.color }} />
        ))}
      </View>
      <View className="flex-row justify-between">
        <Text className="text-[10px] text-muted-foreground">{formatValue(data.domain[0])}{data.unit ? ` ${data.unit}` : ""}</Text>
        <Text className="text-[10px] text-muted-foreground">{formatValue(data.domain[1])}{data.unit ? ` ${data.unit}` : ""}</Text>
      </View>
    </View>
  );
}

function LegendRow({ label, color, onPress }: { label: string; color: string; onPress?: () => void }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      className="flex-row items-center gap-2"
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? label : undefined}
      {...(onPress ? { onPress } : {})}
    >
      <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <Text className="text-xs text-foreground">{label}</Text>
    </Wrapper>
  );
}
