import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { LayerMarkersDemo } from "@/components/examples/layer-markers";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function LayerMarkersExample() {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <ScreenContainer className="flex-1 bg-background">
      <Header
        leftContent={
          <Link href="/" asChild>
            <Pressable className="p-2 rounded active:bg-muted">
              <ArrowLeftIcon size={20} className="text-muted-foreground" />
            </Pressable>
          </Link>
        }
      />
      <ScrollView className="flex-1" scrollEnabled={scrollEnabled}>
        <View className="px-6 py-8 w-full gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              GeoJSON Markers
            </Text>
            <Text className="text-lg text-muted-foreground">
              Efficient marker rendering with data-driven styling and clustering
            </Text>
          </View>

          <LayerMarkersDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Data-Driven Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Marker size and appearance automatically adjust based on data
                properties
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                High Performance
              </Text>
              <Text className="text-sm text-muted-foreground">
                Optimized for rendering thousands of markers efficiently
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
