import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { EvChargingDemo } from "@/components/examples/ev-charging";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function EVChargingExample() {
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
              EV Charging Stations
            </Text>
            <Text className="text-lg text-muted-foreground">
              Find charging stations with real-time availability status
            </Text>
          </View>

          <EvChargingDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Status Legend
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-green-500 rounded-full" />
                <Text className="text-base text-foreground">Available</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-amber-500 rounded-full" />
                <Text className="text-base text-foreground">In Use</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-red-500 rounded-full" />
                <Text className="text-base text-foreground">Offline</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
