import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { BasicMapDemo } from "@/components/examples/basic-map";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function BasicMapExample() {
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
              Basic Map
            </Text>
            <Text className="text-lg text-muted-foreground">
              Simple map with center and zoom configuration
            </Text>
          </View>

          <BasicMapDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Simple Setup
              </Text>
              <Text className="text-sm text-muted-foreground">
                Initialize a map with just center coordinates and zoom level
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Theme-aware
              </Text>
              <Text className="text-sm text-muted-foreground">
                Automatically switches between light and dark map styles
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
