import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

type ColorScheme = "light" | "dark";

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme: setNativeWindColorScheme } = useNativeWindColorScheme();

  const setColorScheme = (scheme: ColorScheme) => {
    setNativeWindColorScheme(scheme);
  };

  const toggleColorScheme = () => {
    setNativeWindColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ colorScheme: colorScheme ?? "light", setColorScheme, toggleColorScheme }}>
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
