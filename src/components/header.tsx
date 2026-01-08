import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { MapPin } from "@/lib/icons";
import { ThemeToggle } from "./theme-toggle";
import { Separator } from "./ui/separator";
import type { ReactNode } from "react";

interface HeaderProps {
  leftContent?: ReactNode;
}

export function Header({ leftContent }: HeaderProps) {
  return (
    <View className="w-full px-6 py-4 border-b border-border bg-background">
      <View style={{ flexDirection: "row" }} className="flex items-center justify-between">
        <View style={{ flexDirection: "row" }} className="flex items-center gap-4">
          {leftContent}
          <Link href="/" asChild>
            <Pressable style={{ flexDirection: "row" }} className="flex items-center gap-2 active:opacity-70">
              <MapPin size={16} className="text-foreground" />
              <Text className="text-base font-semibold tracking-tight text-foreground">
                MapLibre RN
              </Text>
            </Pressable>
          </Link>
        </View>
        <View style={{ flexDirection: "row" }} className="flex items-center gap-1.5">
          <Separator orientation="vertical" className="h-4" />
          <ThemeToggle />
        </View>
      </View>
    </View>
  );
}
