import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { ChoroplethDemo } from "@/components/examples/choropleth";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ChoroplethExample() {
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
              Choropleth + Legend
            </Text>
            <Text className="text-lg text-muted-foreground">
              Color regions by numeric values with a synced dynamic legend
            </Text>
          </View>

          <ChoroplethDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Flexible Scale Types
              </Text>
              <Text className="text-sm text-muted-foreground">
                Choose quantize, quantile, threshold, or linear scales to match
                your data distribution
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Synced Legend
              </Text>
              <Text className="text-sm text-muted-foreground">
                onLegendChange wires legend data automatically; position it
                anywhere on the map
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Native Expression Evaluation
              </Text>
              <Text className="text-sm text-muted-foreground">
                Per-feature numeric styling is compiled to native MapLibre
                expressions for performance
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
