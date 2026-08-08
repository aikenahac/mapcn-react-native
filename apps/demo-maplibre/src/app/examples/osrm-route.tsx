import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { OsrmRouteDemo } from "@/components/examples/osrm-route";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function OSRMRouteExample() {
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
              OSRM Routing
            </Text>
            <Text className="text-lg text-muted-foreground">
              Fetch real driving routes from the OSRM API with turn-by-turn
              navigation
            </Text>
          </View>

          <OsrmRouteDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Real Routing Data
              </Text>
              <Text className="text-sm text-muted-foreground">
                Fetch actual driving routes using the OSRM routing engine
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Distance & Duration
              </Text>
              <Text className="text-sm text-muted-foreground">
                Get accurate distance and estimated travel time for routes
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
