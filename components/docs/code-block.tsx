import { View, Text, ScrollView, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import * as Clipboard from "expo-clipboard";
import { CheckIcon, CopyIcon } from "@/lib/icons";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <View className="flex flex-row items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <Text className="text-xs font-mono text-muted-foreground">{language}</Text>
        <Pressable
          onPress={handleCopy}
          className="p-1.5 rounded active:bg-muted transition-colors"
        >
          {copied ? (
            <CheckIcon size={14} className="text-emerald-500" />
          ) : (
            <CopyIcon size={14} className="text-muted-foreground" />
          )}
        </Pressable>
      </View>
      <ScrollView horizontal className="bg-muted/30">
        <Text className="text-sm font-mono p-4 text-foreground">
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}
