"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  BookOpen,
  Code,
  Braces,
  MapPin,
  MessageSquare,
  Route,
  Wrench,
  Settings,
  Layers,
  Smartphone,
  DollarSign,
  FileCode2,
  Terminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Basics",
    items: [
      { title: "Getting Started", href: "/docs", icon: BookOpen },
      { title: "Installation", href: "/docs/installation", icon: Code },
      { title: "CLI", href: "/docs/cli", icon: Terminal },
      { title: "Commercial use", href: "/docs/commercial-use", icon: DollarSign },
      {
        title: "API Reference",
        href: "/docs/api-reference",
        icon: Braces,
      },
      {
        title: "Companion App",
        href: "/docs/companion",
        icon: Smartphone,
      },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Basic Map", href: "/docs/basic-map", icon: Map },
      { title: "Map Controls", href: "/docs/controls", icon: Settings },
      { title: "Markers", href: "/docs/markers", icon: MapPin },
      { title: "Popups", href: "/docs/popups", icon: MessageSquare },
      { title: "Routes", href: "/docs/routes", icon: Route },
      { title: "Clusters", href: "/docs/clusters", icon: Layers },
      { title: "Advanced Usage", href: "/docs/advanced-usage", icon: Wrench },
      { title: "Gotchas", href: "/docs/gotchas", icon: Wrench },
    ],
  },
  {
    title: "Direct Source",
    items: [
      { title: "Default Map", href: "/docs/source-default", icon: FileCode2 },
      { title: "MapTiler Map", href: "/docs/source-maptiler", icon: FileCode2 },
      { title: "Mapbox Map", href: "/docs/source-mapbox", icon: FileCode2 },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="top-14 border-r bg-transparent **:data-[sidebar=sidebar]:bg-transparent">
      <SidebarContent className="pt-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="text-muted-foreground hover:text-foreground data-[active=true]:text-foreground data-[active=true]:font-medium"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function MobileSidebarTrigger() {
  return (
    <div className="md:hidden">
      <SidebarTrigger />
    </div>
  );
}
