import { Pressable } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { SunIcon, MoonIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { colorScheme, toggleColorScheme } = useTheme();

  return (
    <Pressable
      onPress={toggleColorScheme}
      className={cn("flex items-center justify-center w-9 h-9 rounded-md active:opacity-70", className)}
    >
      {colorScheme === "dark" ? (
        <MoonIcon size={16} className="text-foreground" />
      ) : (
        <SunIcon size={16} className="text-foreground" />
      )}
    </Pressable>
  );
}
