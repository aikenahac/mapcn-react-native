import { View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapMarker } from "@/components/ui/map-marker";
import { TrendingUp } from "@/lib/icons";

interface TrendingDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function TrendingDemo({ onScrollEnabledChange }: TrendingDemoProps) {
  const trendingLocations: Array<{
    coordinate: [number, number];
    count: number;
  }> = [
    { coordinate: [-122.4194, 37.7749], count: 1240 },
    { coordinate: [-122.4083, 37.7849], count: 980 },
    { coordinate: [-122.4294, 37.7649], count: 756 },
  ];

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        {trendingLocations.map((loc, idx) => (
          <MapMarker
            key={idx}
            coordinate={loc.coordinate}
            label={`${loc.count} visits`}
          >
            <View className="items-center gap-1">
              <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </View>
            </View>
          </MapMarker>
        ))}
      </Map>
    </ScrollViewMapWrapper>
  );
}
