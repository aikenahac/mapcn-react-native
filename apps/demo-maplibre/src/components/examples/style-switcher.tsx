import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, MapStyleSwitcher } from "@/components/ui/mapcn";

interface StyleSwitcherDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function StyleSwitcherDemo({
  onScrollEnabledChange,
}: StyleSwitcherDemoProps) {
  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        <MapStyleSwitcher />
      </Map>
    </ScrollViewMapWrapper>
  );
}
