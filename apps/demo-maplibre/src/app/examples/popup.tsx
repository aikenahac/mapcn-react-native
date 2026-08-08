import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { PopupDemo } from "@/components/examples/popup";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PopupExample() {
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
              Rich Popups
            </Text>
            <Text className="text-lg text-muted-foreground">
              Interactive markers with detailed content and information
            </Text>
          </View>

          <PopupDemo onScrollEnabledChange={setScrollEnabled} />

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Interactive Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tap markers to display detailed information popups
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Rich Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display titles, descriptions, ratings, and custom content
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
