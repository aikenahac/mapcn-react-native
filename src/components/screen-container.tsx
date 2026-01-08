import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SafeAreaView edges={["top", "bottom"]} className={className}>
      {children}
    </SafeAreaView>
  );
}
