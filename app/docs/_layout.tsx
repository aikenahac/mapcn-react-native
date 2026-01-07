import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DocsLayout() {
  return (
    <View className="flex-1 bg-background" style={{ flexDirection: 'row' }}>
      <View className="w-1/4">
        <DocsSidebar />
      </View>

      <View className="flex-1">
        <View className="border-b border-border bg-card px-6 py-4">
          <View className="flex flex-row items-center gap-3">
            <Link href="/" asChild>
              <Pressable className="p-2 rounded active:bg-muted">
                <ArrowLeftIcon size={20} className="text-muted-foreground" />
              </Pressable>
            </Link>
            <Text className="text-lg font-semibold text-foreground">
              MapLibre React Native
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="max-w-3xl px-6 py-12" style={{ width: '100%' }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
