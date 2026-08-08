import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { AdvancedUsageDemo } from "@/components/examples/advanced-usage";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AdvancedUsageExample() {
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
              Advanced Usage
            </Text>
            <Text className="text-lg text-muted-foreground">
              Dynamic layer toggling and mixed content with state management
            </Text>
          </View>

          <AdvancedUsageDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Dynamic Layers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Toggle visibility of routes and markers with state management
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Mixed Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Combine routes, markers, and custom icons in a single map
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
