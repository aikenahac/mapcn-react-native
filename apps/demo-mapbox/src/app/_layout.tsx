import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../../global.css';

import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark bg-background' : 'bg-background'}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="examples/basic-map" />
            <Stack.Screen name="examples/markers" />
            <Stack.Screen name="examples/popup" />
            <Stack.Screen name="examples/map-controls" />
            <Stack.Screen name="examples/route" />
            <Stack.Screen name="examples/osrm-route" />
            <Stack.Screen name="examples/advanced-usage" />
            <Stack.Screen name="examples/custom-layer" />
            <Stack.Screen name="examples/layer-markers" />
            <Stack.Screen name="examples/analytics" />
            <Stack.Screen name="examples/delivery" />
            <Stack.Screen name="examples/trending" />
            <Stack.Screen name="examples/ev-charging" />
            <Stack.Screen name="examples/locate-me" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <PortalHost />
        </View>
      </NavigationThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
