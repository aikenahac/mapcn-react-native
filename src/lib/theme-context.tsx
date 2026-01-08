import { createContext, useContext, useState, type ReactNode } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ColorScheme = "light" | "dark" | "system";

interface ThemeContextType {
  colorScheme: "light" | "dark";
  themeMode: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ColorScheme>("system");

  const activeColorScheme = themeMode === "system" ? (systemColorScheme ?? "light") : themeMode;

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
    <ThemeContext.Provider value={{ colorScheme: activeColorScheme, themeMode, setColorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
