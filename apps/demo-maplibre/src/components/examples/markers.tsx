import { View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapMarker } from "@/components/ui/map-marker";

interface MarkersDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function MarkersDemo({ onScrollEnabledChange }: MarkersDemoProps) {
  const locations = [
    {
      coordinate: [-122.4194, 37.7749] as [number, number],
      label: "San Francisco",
    },
    {
      coordinate: [-122.4083, 37.7849] as [number, number],
      label: "North Beach",
    },
    {
      coordinate: [-122.4294, 37.7649] as [number, number],
      label: "Mission District",
    },
  ];

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        {locations.map((loc, idx) => (
          <MapMarker key={idx} coordinate={loc.coordinate} label={loc.label}>
            <View className="w-6 h-6 bg-blue-500 rounded-full border-2 border-background" />
          </MapMarker>
        ))}
      </Map>
    </ScrollViewMapWrapper>
  );
}
