import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CodeBlock } from "./code-block";

interface ComponentPreviewProps {
  children: React.ReactNode;
  code: string;
  className?: string;
}

export function ComponentPreview({
  children,
  code,
  className,
}: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <View className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <View className="flex flex-row border-b border-border bg-muted/30">
        <Pressable
          onPress={() => setActiveTab("preview")}
          className={cn(
            "px-4 py-2 flex-1",
            activeTab === "preview" && "bg-background border-b-2 border-foreground"
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium text-center",
              activeTab === "preview" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Preview
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("code")}
          className={cn(
            "px-4 py-2 flex-1",
            activeTab === "code" && "bg-background border-b-2 border-foreground"
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium text-center",
              activeTab === "code" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Code
          </Text>
        </Pressable>
      </View>

      {activeTab === "preview" ? (
        <View className="p-6 bg-background min-h-[400px]">
          {children}
        </View>
      ) : (
        <View className="p-4 bg-muted/30">
          <CodeBlock code={code} />
        </View>
      )}
    </View>
  );
}
