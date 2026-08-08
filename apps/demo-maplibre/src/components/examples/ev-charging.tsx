import { View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapMarker } from "@/components/ui/map-marker";
import { Zap } from "@/lib/icons";

interface EvChargingDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function EvChargingDemo({ onScrollEnabledChange }: EvChargingDemoProps) {
  const chargingStations: Array<{
    coordinate: [number, number];
    status: string;
  }> = [
    { coordinate: [-122.4194, 37.7749], status: "available" },
    { coordinate: [-122.4083, 37.7849], status: "in-use" },
    { coordinate: [-122.4294, 37.7649], status: "offline" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "in-use":
        return "bg-amber-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        {chargingStations.map((station, idx) => (
          <MapMarker
            key={idx}
            coordinate={station.coordinate}
            label={station.status}
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${getStatusColor(
                station.status,
              )}`}
            >
              <Zap size={20} className="text-white" />
            </View>
          </MapMarker>
        ))}
      </Map>
    </ScrollViewMapWrapper>
  );
}
