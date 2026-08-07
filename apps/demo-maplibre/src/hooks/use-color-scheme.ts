import { use } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { normalizeColorScheme, ThemeContext } from '@/lib/theme-context';

export function useColorScheme() {
  const themeContext = use(ThemeContext);
  const systemColorScheme = useSystemColorScheme();

  if (themeContext) {
    return themeContext.colorScheme;
  }

  return normalizeColorScheme(systemColorScheme);
}
