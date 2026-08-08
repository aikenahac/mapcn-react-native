import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { PolygonDemo } from "@/components/examples/polygon";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PolygonExample() {
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
              Service Area
            </Text>
            <Text className="text-lg text-muted-foreground">
              Static geofence polygon with custom fill and stroke styling
            </Text>
          </View>

          <PolygonDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Static Geofence
              </Text>
              <Text className="text-sm text-muted-foreground">
                Define service areas, delivery zones, or geofence boundaries as
                static polygons on the map
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Fill & Stroke Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Customize both the fill color/opacity and stroke color/width for
                clear visual distinction
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Ring vs Geometry Interop
              </Text>
              <Text className="text-sm text-muted-foreground">
                Pass coordinates as rings directly, or provide a ready GeoJSON
                Polygon/MultiPolygon geometry
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
