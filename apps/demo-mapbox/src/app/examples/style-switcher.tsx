import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapStyleSwitcher } from "@/components/ui/mapcn";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function StyleSwitcherExample() {
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
      <ScrollView className="flex-1">
        <View className="px-6 py-8 w-full gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Style Switcher
            </Text>
            <Text className="text-lg text-muted-foreground">
              Cycle through the provider named map styles
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
              <MapStyleSwitcher />
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Provider Styles
              </Text>
              <Text className="text-sm text-muted-foreground">
                Reads all named styles from configured mapbox provider
                automatically
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Layout Options
              </Text>
              <Text className="text-sm text-muted-foreground">
                layout menu, inline, or grid for different presentations
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
