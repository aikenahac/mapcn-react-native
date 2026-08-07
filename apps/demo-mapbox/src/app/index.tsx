import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3Icon,
  Layers,
  MapPin,
  Navigation as NavigationIcon,
  Route,
  Settings,
  TrendingUp,
  Zap,
} from "@/lib/icons";
import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

interface Example {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  href: Href;
}

const examples: Array<Example | { isSeparator: boolean }> = [
  {
    id: "basic-map",
    title: "Basic Map",
    description: "Simple map with center and zoom",
    icon: MapPin,
    color: "text-blue-500",
    href: "/examples/basic-map" as Href,
  },
  {
    id: "markers",
    title: "Multiple Markers",
    description: "Markers with labels across the city",
    icon: MapPin,
    color: "text-indigo-500",
    href: "/examples/markers" as Href,
  },
  {
    id: "popup",
    title: "Rich Popups",
    description: "Interactive markers with detailed content",
    icon: Layers,
    color: "text-red-500",
    href: "/examples/popup" as Href,
  },
  {
    id: "map-controls",
    title: "Map Controls",
    description: "Zoom and locate controls with user location",
    icon: Settings,
    color: "text-purple-500",
    href: "/examples/map-controls" as Href,
  },
  {
    id: "route",
    title: "Polyline Route",
    description: "Draw routes between points with custom styling",
    icon: Route,
    color: "text-blue-600",
    href: "/examples/route" as Href,
  },
  {
    id: "osrm-route",
    title: "OSRM Routing",
    description: "Fetch real driving routes from OSRM API",
    icon: NavigationIcon,
    color: "text-violet-500",
    href: "/examples/osrm-route" as Href,
  },
  {
    id: "advanced-usage",
    title: "Advanced Usage",
    description: "Dynamic layer toggling and mixed content",
    icon: Settings,
    color: "text-cyan-500",
    href: "/examples/advanced-usage" as Href,
  },
  {
    id: "custom-layer",
    title: "Custom GeoJSON Layer",
    description: "Render polygons from GeoJSON data",
    icon: Layers,
    color: "text-sky-500",
    href: "/examples/custom-layer" as Href,
  },
  {
    id: "layer-markers",
    title: "GeoJSON Markers",
    description: "Efficient marker rendering with data-driven styling",
    icon: MapPin,
    color: "text-amber-500",
    href: "/examples/layer-markers" as Href,
  },
  {
    isSeparator: true,
  },
  {
    id: "analytics",
    title: "Real-time Activity",
    description: "Visualize active users with animated markers",
    icon: BarChart3Icon,
    color: "text-emerald-500",
    href: "/examples/analytics" as Href,
  },
  {
    id: "delivery",
    title: "Delivery Routes",
    description: "Track delivery routes with custom markers",
    icon: NavigationIcon,
    color: "text-blue-500",
    href: "/examples/delivery" as Href,
  },
  {
    id: "trending",
    title: "Trending Locations",
    description: "Display popular spots with engagement metrics",
    icon: TrendingUp,
    color: "text-orange-500",
    href: "/examples/trending" as Href,
  },
  {
    id: "ev-charging",
    title: "EV Charging Stations",
    description: "Find stations with real-time availability status",
    icon: Zap,
    color: "text-yellow-500",
    href: "/examples/ev-charging" as Href,
  },
  {
    id: "locate-me",
    title: "User Location",
    description: "Display user location with controls and permissions",
    icon: NavigationIcon,
    color: "text-purple-500",
    href: "/examples/locate-me" as Href,
  },
];

export default function HomeScreen() {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <Header />
      <ScrollView className="flex-1">
        <View className="px-6 py-8 w-full gap-8">
          <View className="items-center gap-4">
            <Text className="text-4xl font-bold text-center text-foreground">
              mapcn React Native
            </Text>
            <Text className="text-lg text-center text-muted-foreground max-w-2xl">
              Interactive examples for the mapcn React Native component. Explore
              different use cases and patterns on your device.
            </Text>
            <Text className="text-lg text-center text-muted-foreground max-w-2xl">
              Using mapbox for commercial use
            </Text>
          </View>

          <View className="gap-4">
            <Text className="text-2xl font-bold text-foreground">Examples</Text>
            {examples.map((example) => {
              if ("isSeparator" in example) {
                return <Separator key="separator" />;
              }

              const Icon = example.icon;
              return (
                <Link key={example.id} href={example.href} asChild>
                  <Pressable className="active:opacity-70">
                    <Card className="px-4">
                      <View className="flex-row items-start gap-4">
                        <View
                          className={`w-12 h-12 rounded-lg bg-muted items-center justify-center`}
                        >
                          <Icon size={24} className={example.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-foreground mb-1">
                            {example.title}
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            {example.description}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                </Link>
              );
            })}
          </View>

          <View className="p-6 bg-muted/30 rounded-lg border border-border mt-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Companion App
            </Text>
            <Text className="text-sm text-muted-foreground">
              This app showcases interactive examples for mapbox. Scan the QR
              code from the documentation to run these examples on your device.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
