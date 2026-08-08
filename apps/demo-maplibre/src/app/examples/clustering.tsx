import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { ClusteringDemo } from "@/components/examples/clustering";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ClusteringExample() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

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
              Point Clustering
            </Text>
            <Text className="text-lg text-muted-foreground">
              Cluster thousands of points with native performance and
              interactivity
            </Text>
          </View>

          <ClusteringDemo
            onScrollEnabledChange={setScrollEnabled}
            onPointSelect={setSelectedPointId}
          />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                High-Performance Clustering
              </Text>
              <Text className="text-sm text-muted-foreground">
                Render 5,000+ points efficiently using native MapLibre
                clustering
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom-to-Expand
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tap a cluster to zoom in and expand it, with smooth animation
                via expandOnPress
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Individual Point Selection
              </Text>
              <Text className="text-sm text-muted-foreground">
                Selected point:{" "}
                {selectedPointId ?? "none — tap an unclustered point"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
