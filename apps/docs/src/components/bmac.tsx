import { Coffee } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function BuyMeACoffee() {
  return (
    <a
      href="https://buymeacoffee.com/aiken.si"
      target="_blank"
      className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "group")}
    >
      <Coffee className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:-translate-y-0.5" />
    </a>
  )
}