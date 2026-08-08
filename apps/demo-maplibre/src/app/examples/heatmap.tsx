import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { HeatmapDemo } from "@/components/examples/heatmap";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function HeatmapExample() {
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
              Heatmap
            </Text>
            <Text className="text-lg text-muted-foreground">
              Density visualization over incident data with weighted magnitude
            </Text>
          </View>

          <HeatmapDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Weight Normalization
              </Text>
              <Text className="text-sm text-muted-foreground">
                Use weightRange to normalize numeric properties into the 0..1
                density range
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom-Dependent Radius
              </Text>
              <Text className="text-sm text-muted-foreground">
                Radius and intensity arrays adjust dynamically as you zoom for
                optimal visibility
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Color Ramps
              </Text>
              <Text className="text-sm text-muted-foreground">
                Choose from built-in sequential or diverging color ramps for
                different data domains
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
