import { useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ThemeContext } from '@/lib/theme-context';

export function useColorScheme() {
  const themeContext = useContext(ThemeContext);
  const systemColorScheme = useSystemColorScheme();

  if (themeContext) {
    return themeContext.colorScheme;
  }

  return systemColorScheme;
}
