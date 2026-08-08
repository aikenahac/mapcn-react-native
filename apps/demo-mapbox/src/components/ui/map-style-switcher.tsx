import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
  "top-left": { position: "absolute", top: 8, left: 8, zIndex: 1000 },
  "top-right": { position: "absolute", top: 8, right: 8, zIndex: 1000 },
  "bottom-left": { position: "absolute", bottom: 8, left: 8, zIndex: 1000 },
  "bottom-right": { position: "absolute", bottom: 8, right: 8, zIndex: 1000 },
} as const;

const MAX_LIST_HEIGHT = 240;

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

  const items = (
    <View className={cn(layout === "grid" ? "flex-row flex-wrap gap-1.5" : "gap-0.5")}>
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

  const list =
    layout === "menu" ? (
      <View className="absolute left-0 right-0 top-full mt-1.5 bg-popover border border-border rounded-lg shadow-lg overflow-hidden" style={{ elevation: 6 }}>
        <ScrollView style={{ maxHeight: MAX_LIST_HEIGHT }} className="p-1" showsVerticalScrollIndicator={false} bounces={false}>
          {items}
        </ScrollView>
      </View>
    ) : (
      items
    );

  const content = (
    <View className={cn(layout === "menu" && "relative")}>
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

  const positioned = (
    <View className={cn("items-start", className)} style={position === "none" ? undefined : POSITION_STYLE[position]} accessibilityRole="menu">
      {content}
    </View>
  );

  if (position === "none") return positioned;

  const backdrop = open && layout === "menu" && (
    <Pressable
      onPress={() => setOpen(false)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
    />
  );

  return (
    <SwitcherOverlayHost>
      <>
        {backdrop}
        {positioned}
      </>
    </SwitcherOverlayHost>
  );
}

function SwitcherTrigger({ current, open, onPress }: { current: MapStyleDefinition; open: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 shadow-sm min-w-[9rem]"
      style={{ elevation: 3 }}
      accessibilityRole="button"
      accessibilityLabel="Map style"
      accessibilityState={{ expanded: open }}
    >
      <Text className="text-xs font-medium text-foreground flex-1" numberOfLines={1}>
        {current?.label ?? "Style"}
      </Text>
      <Text className={cn("text-muted-foreground text-[10px]", open && "rotate-180")}>▾</Text>
    </Pressable>
  );
}

function StyleItem({ style, selected, showLabel, onPress }: { style: MapStyleDefinition; selected: boolean; showLabel: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={cn("rounded-md px-2.5 py-2 flex-row items-center justify-between gap-2", selected ? "bg-accent" : "active:bg-muted")}
      accessibilityRole="menuitem"
      accessibilityLabel={style.label}
      accessibilityState={{ selected }}
    >
      {showLabel && <Text className={cn("text-xs flex-1", selected ? "font-semibold text-accent-foreground" : "text-foreground")}>{style.label}</Text>}
      {selected && <Text className="text-accent-foreground text-xs font-semibold">✓</Text>}
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
