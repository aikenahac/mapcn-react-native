import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { MapControlsDemo } from "@/components/examples/map-controls";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function MapControlsExample() {
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
              Map Controls
            </Text>
            <Text className="text-lg text-muted-foreground">
              Built-in zoom and location controls with user location display
            </Text>
          </View>

          <MapControlsDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom Controls
              </Text>
              <Text className="text-sm text-muted-foreground">
                Built-in zoom in/out buttons for easy map navigation
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Location Centering
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tap the locate button to center map on user location
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Permission Handling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Automatic location permission request and handling
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
