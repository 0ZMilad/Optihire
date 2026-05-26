"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  ClipboardCheck,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { authService } from "@/middle-service/supabase";

// Navigation items
const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Resumes", url: "/dashboard/resumes", icon: FileText },
  { title: "ATS Audit", url: "/dashboard/audit", icon: ClipboardCheck },
  { title: "Job Matches", url: "/dashboard/jobs", icon: FolderOpen },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

// Check if route is active
function checkIsActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

// User Navigation
function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignout = async () => {
    await authService.signOut();
    router.push("/");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </span>
                <span className="truncate text-xs">
                  {user?.email || "No email"}
                </span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <BadgeCheck />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignout}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Main App Sidebar
export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center gap-2 px-2 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
            <Image
              src="/Omega.png"
              alt="Optihire"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Optihire</span>
            <span className="truncate text-xs">Resume Optimiser</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={checkIsActive(pathname, item.url)}
                  tooltip={item.title}
                >
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
