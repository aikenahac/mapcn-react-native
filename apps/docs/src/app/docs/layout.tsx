import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { DocsSidebar, MobileSidebarTrigger } from "./_components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header
          className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
          leftContent={<MobileSidebarTrigger />}
        />
        <div className="flex flex-1">
          <DocsSidebar />
          <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
