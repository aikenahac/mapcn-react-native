import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function DocsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="mb-8">
      <Text className="text-4xl font-bold text-foreground mb-3">{title}</Text>
      <Text className="text-lg text-muted-foreground">{description}</Text>
    </View>
  );
}

export function DocsSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("mb-8", className)}>
      {title && (
        <Text className="text-2xl font-semibold text-foreground mb-4">{title}</Text>
      )}
      {children}
    </View>
  );
}

export function DocsNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("bg-muted/40 border border-border rounded-lg p-4 my-4", className)}>
      <Text className="text-sm text-foreground leading-relaxed">{children}</Text>
    </View>
  );
}

export function DocsParagraph({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={cn("text-base text-muted-foreground leading-relaxed mb-4", className)}>
      {children}
    </Text>
  );
}

export function DocsCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text
      className={cn(
        "font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-foreground",
        className
      )}
    >
      {children}
    </Text>
  );
}
