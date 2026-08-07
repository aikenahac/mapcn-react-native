import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useMap, useOverlay } from "./map";
import { PROVIDERS, type MapStyleDefinition } from "@/lib/mapcn/provider";

export interface MapStyleSwitcherProps {
  /** Controlled selection (a style id from the configured provider). */
  value?: string;
  /** Uncontrolled initial selection. Defaults to the provider's default light-mode style. */
  defaultValue?: string;
  onValueChange?: (styleId: string, style: MapStyleDefinition) => void;

  /** Which styles to offer. Defaults to every style the configured provider exposes. */
  styles?: Array<string> | Array<MapStyleDefinition>;

  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "none";
  /** "menu" = collapsed trigger that expands a list; "inline"/"grid" render every style at once. */
  layout?: "menu" | "inline" | "grid";
  showLabels?: boolean;
  renderTrigger?: (state: { current: MapStyleDefinition; open: boolean; setOpen: (open: boolean) => void }) => ReactNode;
  renderItem?: (item: MapStyleDefinition, state: { selected: boolean; select: () => void }) => ReactNode;
  className?: string;
}

const POSITION_STYLE = {
  "top-left": { top: 8, left: 8, zIndex: 1000 },
  "top-right": { top: 8, right: 8, zIndex: 1000 },
  "bottom-left": { bottom: 8, left: 8, zIndex: 1000 },
  "bottom-right": { bottom: 8, right: 8, zIndex: 1000 },
} as const;

function resolveStyles(provider: (typeof PROVIDERS)[keyof typeof PROVIDERS], styles?: Array<string> | Array<MapStyleDefinition>): Array<MapStyleDefinition> {
  if (!styles) return Object.values(provider.styles);
  return styles.map((s: string | MapStyleDefinition) => (typeof s === "string" ? provider.styles[s] : s)).filter((s): s is MapStyleDefinition => Boolean(s));
}

/**
 * Reads its style list from the configured provider (plan §7.13, §3.2) --
 * MapTiler yields 7 named styles, CARTO 3, `custom` whatever `init`
 * configured for that project. Works standalone (its own overlay) or laid
 * out by a parent (`position="none"`, e.g. nested inside <MapControls>).
 */
export function MapStyleSwitcher({
  value,
  defaultValue,
  onValueChange,
  styles,
  position = "top-right",
  layout = "menu",
  showLabels = true,
  renderTrigger,
  renderItem,
  className,
}: MapStyleSwitcherProps) {
  const map = useMap();
  const provider = PROVIDERS[map.provider];
  const available = useMemo(() => resolveStyles(provider, styles), [provider, styles]);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? provider.defaultStyle.light);
  const currentId = isControlled ? value : uncontrolledValue;
  const current = available.find((s) => s.id === currentId) ?? available[0];

  const [open, setOpen] = useState(false);

  const select = useCallback(
    (style: MapStyleDefinition) => {
      if (!isControlled) setUncontrolledValue(style.id);
      map.setStyle(style.id);
      onValueChange?.(style.id, style);
      setOpen(false);
    },
    [isControlled, map, onValueChange],
  );

  const list = (
    <View className={cn(layout === "grid" ? "flex-row flex-wrap gap-1.5" : "gap-1", layout === "menu" && "bg-card border border-border rounded-lg shadow-sm p-1.5 mt-1")}>
      {available.map((style) => {
        const selected = style.id === current?.id;
        return renderItem ? (
          <View key={style.id}>{renderItem(style, { selected, select: () => select(style) })}</View>
        ) : (
          <StyleItem key={style.id} style={style} selected={selected} showLabel={showLabels} onPress={() => select(style)} />
        );
      })}
    </View>
  );

  const content = (
    <View className="gap-1">
      {layout === "menu" ? (
        <>
          {renderTrigger ? renderTrigger({ current, open, setOpen }) : <SwitcherTrigger current={current} open={open} onPress={() => setOpen((o) => !o)} />}
          {open && list}
        </>
      ) : (
        list
      )}
    </View>
  );

  const wrapped = (
    <View className={cn("gap-1.5", className)} style={position === "none" ? undefined : POSITION_STYLE[position]} accessibilityRole="menu">
      {content}
    </View>
  );

  if (position === "none") return wrapped;
  return <SwitcherOverlayHost>{wrapped}</SwitcherOverlayHost>;
}

function SwitcherTrigger({ current, open, onPress }: { current: MapStyleDefinition; open: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5 shadow-sm"
      style={{ elevation: 2 }}
      accessibilityRole="button"
      accessibilityLabel="Map style"
      accessibilityState={{ expanded: open }}
    >
      <Text className="text-xs font-medium text-foreground">{current?.label ?? "Style"}</Text>
    </Pressable>
  );
}

function StyleItem({ style, selected, showLabel, onPress }: { style: MapStyleDefinition; selected: boolean; showLabel: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={cn("rounded px-2.5 py-1.5 flex-row items-center gap-1.5", selected ? "bg-accent" : "active:bg-muted")}
      accessibilityRole="menuitem"
      accessibilityLabel={style.label}
      accessibilityState={{ selected }}
    >
      {showLabel && <Text className={cn("text-xs", selected ? "font-semibold text-accent-foreground" : "text-foreground")}>{style.label}</Text>}
    </Pressable>
  );
}

function SwitcherOverlayHost({ children }: { children: ReactNode }) {
  const { registerOverlay, unregisterOverlay } = useOverlay();
  const id = useId();

  useEffect(() => {
    registerOverlay(id, children);
    return () => unregisterOverlay(id);
  }, [id, children, registerOverlay, unregisterOverlay]);

  return null;
}
