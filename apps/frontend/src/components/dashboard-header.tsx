"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger variant="outline" />
        <Separator orientation="vertical" className="h-6" />
        {children}
      </div>
    </header>
  );
}
