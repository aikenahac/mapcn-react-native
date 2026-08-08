import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { AnalyticsDemo } from "@/components/examples/analytics";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AnalyticsExample() {
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
              Real-time Activity Map
            </Text>
            <Text className="text-lg text-muted-foreground">
              Visualize active users with animated markers and overlaid
              statistics
            </Text>
          </View>

          <AnalyticsDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Animated Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Pulsing animation effect to indicate real-time activity
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Overlay Statistics
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display key metrics directly on the map with custom components
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
