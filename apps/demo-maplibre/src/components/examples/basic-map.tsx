import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/mapcn";

interface BasicMapDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function BasicMapDemo({ onScrollEnabledChange }: BasicMapDemoProps) {
  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }} />
    </ScrollViewMapWrapper>
  );
}
