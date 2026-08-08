import React, { useCallback, ReactNode } from "react";
import { View, ViewStyle } from "react-native";

interface ScrollViewMapWrapperProps {
  children: ReactNode;
  onScrollEnabledChange: (enabled: boolean) => void;
  style?: ViewStyle;
  className?: string;
}

/**
 * Wrapper component for Map components inside ScrollView.
 * 
 * On Android, ScrollView gestures can conflict with map pan/zoom gestures.
 * This wrapper temporarily disables parent ScrollView scrolling when the
 * user is interacting with the map.
 * 
 * @example
 * ```tsx
 * const [scrollEnabled, setScrollEnabled] = useState(true);
 * 
 * <ScrollView scrollEnabled={scrollEnabled}>
 *   <ScrollViewMapWrapper
 *     onScrollEnabledChange={setScrollEnabled}
 *     className="h-[400px]"
 *   >
 *     <Map center={[0, 0]} zoom={10} />
 *   </ScrollViewMapWrapper>
 * </ScrollView>
 * ```
 */
export function ScrollViewMapWrapper({
  children,
  onScrollEnabledChange,
  style,
  className,
}: ScrollViewMapWrapperProps) {
  const handleTouchStart = useCallback(() => {
    onScrollEnabledChange(false);
  }, [onScrollEnabledChange]);

  const handleTouchEnd = useCallback(() => {
    onScrollEnabledChange(true);
  }, [onScrollEnabledChange]);

  return (
    <View
      style={style}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </View>
  );
}
