import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center rounded-lg transition-opacity active:opacity-70",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-medium text-center", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      link: "text-foreground underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  label?: string;
  children?: React.ReactNode;
}

export function Button({
  label,
  children,
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children || (label && (
        <Text className={cn(buttonTextVariants({ variant, size }))}>
          {label}
        </Text>
      ))}
    </Pressable>
  );
}
