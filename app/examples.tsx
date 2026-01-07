import { View, Text, ScrollView, Pressable } from "react-native";
import { Link, type Href } from "expo-router";
import { Map, MapMarker, MapRoute, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, TrendingUp, Zap, Navigation, BarChart3 } from "@/lib/icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function ExamplesPage() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const deliveryRoute: [number, number][] = [
    [-122.4194, 37.7749],
    [-122.4083, 37.7849],
    [-122.4294, 37.7649],
  ];

  const trendingLocations: Array<{ coordinate: [number, number]; count: number }> = [
    { coordinate: [-122.4194, 37.7749], count: 1240 },
    { coordinate: [-122.4083, 37.7849], count: 980 },
    { coordinate: [-122.4294, 37.7649], count: 756 },
  ];

  const chargingStations: Array<{ coordinate: [number, number]; status: string }> = [
    { coordinate: [-122.4194, 37.7749], status: "available" },
    { coordinate: [-122.4083, 37.7849], status: "in-use" },
    { coordinate: [-122.4294, 37.7649], status: "offline" },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-12 max-w-5xl mx-auto w-full">
        <View className="mb-8">
          <Link href="/" asChild>
            <Pressable className="flex flex-row items-center gap-2 mb-6 active:opacity-70">
              <ArrowLeftIcon size={20} className="text-muted-foreground" />
              <Text className="text-muted-foreground">Back to Home</Text>
            </Pressable>
          </Link>

          <Text className="text-4xl font-bold text-foreground mb-3">Examples</Text>
          <Text className="text-lg text-muted-foreground">
            Interactive examples showcasing different use cases and patterns for MapLibre React
            Native.
          </Text>
        </View>

        <View className="gap-6">
          <Card>
            <View className="mb-3">
              <View className="flex flex-row items-center gap-2 mb-2">
                <BarChart3 size={20} className="text-emerald-500" />
                <Text className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Analytics
                </Text>
              </View>
              <Text className="text-xl font-semibold text-foreground mb-1">
                Real-time Activity Map
              </Text>
              <Text className="text-sm text-muted-foreground">
                Visualize active users with markers and overlaid statistics
              </Text>
            </View>

            <View className="h-[350px] rounded-lg overflow-hidden relative">
              <Map zoom={12} center={[-122.4194, 37.7749]}>
                <MapMarker coordinate={[-122.4194, 37.7749]}>
                  <View className="w-4 h-4 bg-emerald-500 rounded-full">
                    <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                  </View>
                </MapMarker>
                <MapMarker coordinate={[-122.4083, 37.7849]}>
                  <View className="w-4 h-4 bg-emerald-500 rounded-full">
                    <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                  </View>
                </MapMarker>
                <MapMarker coordinate={[-122.4294, 37.7649]}>
                  <View className="w-4 h-4 bg-emerald-500 rounded-full">
                    <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                  </View>
                </MapMarker>
              </Map>

              <View className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
                <Text className="text-xs text-muted-foreground mb-1">Active Users</Text>
                <Text className="text-2xl font-bold text-emerald-500">2,547</Text>
              </View>
            </View>
          </Card>

          <Card>
            <View className="mb-3">
              <View className="flex flex-row items-center gap-2 mb-2">
                <Navigation size={20} className="text-blue-500" />
                <Text className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Delivery
                </Text>
              </View>
              <Text className="text-xl font-semibold text-foreground mb-1">Route Tracking</Text>
              <Text className="text-sm text-muted-foreground">
                Track delivery routes with markers and polylines
              </Text>
            </View>

            <View className="h-[350px] rounded-lg overflow-hidden">
              <Map zoom={12} center={[-122.4194, 37.7749]}>
                <MapRoute coordinates={deliveryRoute} color="#3b82f6" width={4} />
                <MapMarker coordinate={deliveryRoute[0]} label="Store">
                  <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">S</Text>
                  </View>
                </MapMarker>
                <MapMarker coordinate={deliveryRoute[1]} label="In Transit">
                  <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">→</Text>
                  </View>
                </MapMarker>
                <MapMarker coordinate={deliveryRoute[2]} label="Destination">
                  <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">D</Text>
                  </View>
                </MapMarker>
              </Map>
            </View>
          </Card>

          <Card>
            <View className="mb-3">
              <View className="flex flex-row items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-red-500" />
                <Text className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Trending
                </Text>
              </View>
              <Text className="text-xl font-semibold text-foreground mb-1">
                Popular Locations
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display trending spots with visitor counts
              </Text>
            </View>

            <View className="h-[350px] rounded-lg overflow-hidden">
              <Map zoom={12} center={[-122.4194, 37.7749]}>
                {trendingLocations.map((location, idx) => (
                  <MapMarker key={idx} coordinate={location.coordinate}>
                    <View className="bg-gradient-to-br from-orange-500 to-red-500 px-3 py-2 rounded-full items-center justify-center shadow-lg">
                      <Text className="text-white text-xs font-bold">{location.count}</Text>
                    </View>
                  </MapMarker>
                ))}
              </Map>
            </View>
          </Card>

          <Card>
            <View className="mb-3">
              <View className="flex flex-row items-center gap-2 mb-2">
                <Zap size={20} className="text-yellow-500" />
                <Text className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  EV Charging
                </Text>
              </View>
              <Text className="text-xl font-semibold text-foreground mb-1">
                Charging Stations
              </Text>
              <Text className="text-sm text-muted-foreground">
                Show station availability with status indicators
              </Text>
            </View>

            <View className="h-[350px] rounded-lg overflow-hidden">
              <Map zoom={12} center={[-122.4194, 37.7749]}>
                {chargingStations.map((station, idx) => (
                  <MapMarker key={idx} coordinate={station.coordinate}>
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        station.status === "available"
                          ? "bg-emerald-500"
                          : station.status === "in-use"
                            ? "bg-amber-500"
                            : "bg-zinc-500"
                      }`}
                    >
                      <Zap size={20} className="text-white" />
                    </View>
                  </MapMarker>
                ))}
              </Map>

              <View className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <View className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <Text className="text-xs text-muted-foreground">Available</Text>
                </View>
                <View className="flex flex-row items-center gap-2 mb-2">
                  <View className="w-3 h-3 bg-amber-500 rounded-full" />
                  <Text className="text-xs text-muted-foreground">In Use</Text>
                </View>
                <View className="flex flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-zinc-500 rounded-full" />
                  <Text className="text-xs text-muted-foreground">Offline</Text>
                </View>
              </View>
            </View>
          </Card>

          {hasPermission && (
            <Card>
              <View className="mb-3">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Navigation size={20} className="text-violet-500" />
                  <Text className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Location
                  </Text>
                </View>
                <Text className="text-xl font-semibold text-foreground mb-1">Locate Me</Text>
                <Text className="text-sm text-muted-foreground">
                  Show user location with map controls
                </Text>
              </View>

              <View className="h-[350px] rounded-lg overflow-hidden">
                <Map zoom={14} center={[-122.4194, 37.7749]}>
                  <MapControls />
                </Map>
              </View>
            </Card>
          )}
        </View>

        <View className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Want to see the code?
          </Text>
          <Text className="text-muted-foreground mb-4">
            Check out the documentation for implementation details and source code for each
            example.
          </Text>
          <Link href={"/docs" as Href} asChild>
            <Pressable className="bg-primary px-6 py-3 rounded-lg active:opacity-70 self-start">
              <Text className="text-primary-foreground font-medium">View Documentation</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
