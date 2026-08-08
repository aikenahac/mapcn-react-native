import { useState } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { StyleSwitcherDemo } from "@/components/examples/style-switcher";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function StyleSwitcherExample() {
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
              Style Switcher
            </Text>
            <Text className="text-lg text-muted-foreground">
              Cycle through the provider named map styles
            </Text>
          </View>

          <StyleSwitcherDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Provider-Aware
              </Text>
              <Text className="text-sm text-muted-foreground">
                Automatically reads styles from the configured provider (carto,
                maptiler, custom) — no manual wiring needed
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Layout Options
              </Text>
              <Text className="text-sm text-muted-foreground">
                Choose layout menu (collapsed), inline, or grid to match your UI
                needs
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Standalone or Nested
              </Text>
              <Text className="text-sm text-muted-foreground">
                Works as its own overlay or nested in MapControls with position
                none — fully composable
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
