import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
        className
      )}
      {...props}
    />
  );
}
