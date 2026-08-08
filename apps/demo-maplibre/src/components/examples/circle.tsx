import { useState } from "react";
import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Button } from "@/components/ui/button";
import { Map } from "@/components/ui/map";
import { MapCircle } from "@/components/ui/map-circle";

interface CircleDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function CircleDemo({ onScrollEnabledChange }: CircleDemoProps) {
  const [center, setCenter] = useState<[number, number]>([-122.4194, 37.7749]);
  const [radius, setRadius] = useState(2000);

  const decreaseRadius = () => {
    setRadius((r) => Math.max(500, r - 500));
  };

  const increaseRadius = () => {
    setRadius((r) => Math.min(10000, r + 500));
  };

  return (
    <>
      <ScrollViewMapWrapper
        onScrollEnabledChange={onScrollEnabledChange}
        className="h-[500px] rounded-xl overflow-hidden border border-border"
      >
        <Map
          defaultViewport={{ zoom: 13, center }}
          onPress={(e) => setCenter(e.coordinate)}
        >
          <MapCircle
            center={center}
            radius={radius}
            fill={{ color: "#4285F4", opacity: 0.2 }}
            stroke={{ color: "#4285F4", width: 2 }}
          />
        </Map>
      </ScrollViewMapWrapper>

      <View className="gap-4">
        <View className="flex-row items-center justify-center gap-3">
          <Button variant="outline" size="icon" onPress={decreaseRadius}>
            <Text className="text-base font-semibold">−</Text>
          </Button>
          <Text className="text-base font-semibold text-foreground min-w-[100px] text-center">
            {radius.toLocaleString()} m
          </Text>
          <Button variant="outline" size="icon" onPress={increaseRadius}>
            <Text className="text-base font-semibold">+</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
