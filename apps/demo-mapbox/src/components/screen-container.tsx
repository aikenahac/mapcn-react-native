import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export function ScreenContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <StyledSafeAreaView edges={["top", "bottom"]} className={className}>
      {children}
    </StyledSafeAreaView>
  );
}
