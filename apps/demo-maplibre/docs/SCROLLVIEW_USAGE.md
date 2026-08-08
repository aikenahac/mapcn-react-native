# Using Map Components in ScrollView

When embedding map components inside a `ScrollView`, you may experience gesture conflicts on Android. This occurs because Android's touch system prioritizes the parent `ScrollView` scroll gestures over the map's pan and zoom gestures, causing the map to "flicker" or jump when users try to interact with it.

This guide explains how to resolve these conflicts without modifying the map components.

## The Problem

When a user tries to:
- **Pinch to zoom** on the map
- **Pan/drag** to move around the map

Android may interpret these gestures as scroll attempts, causing:
- The ScrollView to scroll vertically
- The map to stutter or "flicker"
- Inconsistent gesture recognition

## Solution: ScrollView Gesture Wrapper

Create a wrapper component that temporarily disables ScrollView scrolling when the user is interacting with the map.

### Basic Implementation

```tsx
import React, { useRef, useState, useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { Map } from "@/components/ui/map";

export function MapInScrollView() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleMapTouchStart = useCallback(() => {
    setScrollEnabled(false);
  }, []);

  const handleMapTouchEnd = useCallback(() => {
    setScrollEnabled(true);
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollEnabled={scrollEnabled}
      style={styles.scrollView}
    >
      {/* Other content above the map */}
      <View style={styles.content}>
        <Text>Content above map</Text>
      </View>

      {/* Map with touch handlers */}
      <View
        style={styles.mapContainer}
        onTouchStart={handleMapTouchStart}
        onTouchEnd={handleMapTouchEnd}
        onTouchCancel={handleMapTouchEnd}
      >
        <Map
          center={[-74.006, 40.7128]}
          zoom={12}
          style={styles.map}
        />
      </View>

      {/* Other content below the map */}
      <View style={styles.content}>
        <Text>Content below map</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mapContainer: {
    height: 300,
    marginVertical: 16,
  },
  map: {
    flex: 1,
  },
});
```

### How It Works

1. The wrapper `View` around the map captures touch events
2. When a touch **starts** on the map area, ScrollView scrolling is disabled
3. When the touch **ends** or is **cancelled**, scrolling is re-enabled
4. This allows map gestures to take priority while maintaining scroll functionality outside the map

## Advanced: Reusable Wrapper Component

For cleaner code, create a reusable wrapper component:

```tsx
import React, { useState, useCallback, ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface ScrollViewMapWrapperProps {
  children: ReactNode;
  onScrollEnabledChange: (enabled: boolean) => void;
  style?: ViewStyle;
}

export function ScrollViewMapWrapper({
  children,
  onScrollEnabledChange,
  style,
}: ScrollViewMapWrapperProps) {
  const handleTouchStart = useCallback(() => {
    onScrollEnabledChange(false);
  }, [onScrollEnabledChange]);

  const handleTouchEnd = useCallback(() => {
    onScrollEnabledChange(true);
  }, [onScrollEnabledChange]);

  return (
    <View
      style={[styles.container, style]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
```

### Using the Wrapper

```tsx
import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { Map } from "@/components/ui/map";
import { ScrollViewMapWrapper } from "@/components/ScrollViewMapWrapper";

export function MyScreen() {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <ScrollView scrollEnabled={scrollEnabled}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, marginBottom: 16 }}>
          Explore the Map
        </Text>
      </View>

      <ScrollViewMapWrapper
        onScrollEnabledChange={setScrollEnabled}
        style={{ height: 400 }}
      >
        <Map
          center={[14.5058, 46.0569]} // Ljubljana
          zoom={13}
          style={{ flex: 1 }}
        />
      </ScrollViewMapWrapper>

      <View style={{ padding: 16 }}>
        <Text>
          Scroll continues normally outside the map area.
          Pan and zoom work smoothly inside the map.
        </Text>
      </View>
    </ScrollView>
  );
}
```

## With React Native Gesture Handler

For more sophisticated gesture handling, use `react-native-gesture-handler`:

```tsx
import React, { useState, useCallback } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Map } from "@/components/ui/map";

export function MapWithGestureHandler() {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const gesture = Gesture.Pan()
    .onStart(() => {
      setScrollEnabled(false);
    })
    .onEnd(() => {
      setScrollEnabled(true);
    })
    .onFinalize(() => {
      setScrollEnabled(true);
    });

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView scrollEnabled={scrollEnabled}>
        <View style={styles.content}>
          <Text>Content above</Text>
        </View>

        <GestureDetector gesture={gesture}>
          <View style={styles.mapContainer}>
            <Map
              center={[-74.006, 40.7128]}
              zoom={12}
              style={styles.map}
            />
          </View>
        </GestureDetector>

        <View style={styles.content}>
          <Text>Content below</Text>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mapContainer: {
    height: 300,
  },
  map: {
    flex: 1,
  },
});
```

## Best Practices

1. **Set a fixed height** for the map container when inside a ScrollView
2. **Use `onTouchCancel`** in addition to `onTouchEnd` to handle interrupted gestures
3. **Wrap at the closest parent** — put the touch handlers on the immediate map container
4. **Consider UX** — add visual feedback (subtle border/shadow) when the map is "active"
5. **Test on physical devices** — emulators may not accurately reproduce touch behavior

## Platform Notes

| Platform | Behavior |
|----------|----------|
| **Android** | Requires the wrapper pattern described above |
| **iOS** | Generally handles nested gestures better, but the wrapper ensures consistent behavior |

## Troubleshooting

### Map still flickers
- Ensure the wrapper View completely covers the map
- Check that `scrollEnabled` state is being updated correctly
- Verify touch events are not being intercepted by child components

### ScrollView doesn't scroll after map interaction
- Make sure `onTouchEnd` and `onTouchCancel` both reset `scrollEnabled` to `true`
- Check for any async operations that might delay the state update

### Gestures feel laggy
- Use `useCallback` to memoize touch handlers
- Consider using `react-native-gesture-handler` for better performance
