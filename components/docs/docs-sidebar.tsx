import { Link, usePathname, type Href } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { BookOpen, Code, Map as MapIcon, MapPin, Layers, Route, Grid3x3, Sparkles, FileText } from "@/lib/icons";

interface NavItem {
  title: string;
  href: Href;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: { title: string; items: NavItem[] }[] = [
  {
    title: "Basics",
    items: [
      { title: "Getting Started", href: "/docs", icon: BookOpen },
      { title: "Installation", href: "/docs/installation", icon: Code },
      { title: "API Reference", href: "/docs/api-reference", icon: FileText },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Basic Map", href: "/docs/basic-map", icon: MapIcon },
      { title: "Map Controls", href: "/docs/controls", icon: Layers },
      { title: "Markers", href: "/docs/markers", icon: MapPin },
      { title: "Routes", href: "/docs/routes", icon: Route },
      { title: "Clusters", href: "/docs/clusters", icon: Grid3x3 },
      { title: "Advanced Usage", href: "/docs/advanced-usage", icon: Sparkles },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <ScrollView className="flex-1 w-64 border-r border-border bg-card">
      <View className="p-6 gap-6">
        {navItems.map((group) => (
          <View key={group.title} className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </Text>
            <View className="gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.title} href={item.href} asChild>
                    <Pressable
                      className={cn(
                        "flex flex-row items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground active:bg-muted/50"
                      )}
                    >
                      <Icon size={16} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                      <Text
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
