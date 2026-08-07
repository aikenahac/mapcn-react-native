import { createContext, use, useState, type ReactNode } from "react";
import { useColorScheme as useSystemColorScheme, type ColorSchemeName } from "react-native";

export type ColorScheme = "light" | "dark" | "system";

interface ThemeContextType {
  colorScheme: "light" | "dark";
  themeMode: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function normalizeColorScheme(
  colorScheme: ColorSchemeName | null | undefined,
): "light" | "dark" {
  return colorScheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ColorScheme>("system");

  const activeColorScheme =
    themeMode === "system" ? normalizeColorScheme(systemColorScheme) : themeMode;

  const setColorScheme = (scheme: ColorScheme) => {
    setThemeMode(scheme);
  };

  const toggleColorScheme = () => {
    setThemeMode((prev) => {
      if (prev === "system") return "dark";
      return prev === "dark" ? "light" : "dark";
    });
  };

  return (
    <ThemeContext value={{ colorScheme: activeColorScheme, themeMode, setColorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
