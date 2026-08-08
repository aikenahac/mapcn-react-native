import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { CustomLayerDemo } from "@/components/examples/custom-layer";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function CustomLayerExample() {
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
              Custom GeoJSON Layer
            </Text>
            <Text className="text-lg text-muted-foreground">
              Render polygons and shapes from GeoJSON data with custom styling
            </Text>
          </View>

          <CustomLayerDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                GeoJSON Support
              </Text>
              <Text className="text-sm text-muted-foreground">
                Import and render standard GeoJSON polygon data
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Custom Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Configure fill color, opacity, and outline styling
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
