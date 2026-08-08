import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapPolygon } from "@/components/ui/mapcn";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PolygonExample() {
  const serviceAreaRing: Array<[number, number]> = [
    [-122.42, 37.79],
    [-122.40, 37.78],
    [-122.41, 37.76],
    [-122.44, 37.75],
    [-122.46, 37.76],
    [-122.45, 37.78],
    [-122.43, 37.79],
    [-122.42, 37.79],
  ];

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
      <ScrollView className="flex-1">
        <View className="px-6 py-8 w-full gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Service Area
            </Text>
            <Text className="text-lg text-muted-foreground">
              Static geofence polygon with fill and stroke
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map defaultViewport={{ zoom: 13, center: [-122.4194, 37.7749] }}>
              <MapPolygon
                coordinates={[serviceAreaRing]}
                fill={{ color: "#22c55e", opacity: 0.25 }}
                stroke={{ color: "#16a34a", width: 2 }}
              />
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Service Area Shape
              </Text>
              <Text className="text-sm text-muted-foreground">
                Irregular polygon geofence boundaries
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Fill + Stroke
              </Text>
              <Text className="text-sm text-muted-foreground">
                Customizable color and opacity for fill and stroke
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Closed Ring Format
              </Text>
              <Text className="text-sm text-muted-foreground">
                [[ [lng,lat], [lng,lat], ... ]] with first point == last
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
