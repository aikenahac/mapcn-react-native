import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { MarkersDemo } from "@/components/examples/markers";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function MarkersExample() {
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
              Multiple Markers
            </Text>
            <Text className="text-lg text-muted-foreground">
              Display markers with labels across different locations
            </Text>
          </View>

          <MarkersDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Custom Marker Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Use any React Native component as marker content
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Marker Labels
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display text labels below markers for additional context
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
