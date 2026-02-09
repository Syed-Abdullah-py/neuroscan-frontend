"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Building2
} from "lucide-react";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";

// ... existing imports ...

import { LogoutButton } from "@/features/auth/components/logout-button";

const adminRoutes = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Cases", href: "/admin/cases", icon: FileText },
  { name: "Workspaces", href: "/admin/workspaces", icon: Building2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  // Management moved to Workspaces
];

const doctorRoutes = [
  { name: "Overview", href: "/doctor", icon: LayoutDashboard },
  { name: "Workspaces", href: "/doctor/workspaces", icon: Building2 },
  { name: "Settings", href: "/doctor/settings", icon: Settings },
];

type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  avatar: string;
  role?: string;
  globalRole?: string | null;
  workspaceId?: string;
};

// Add workspaces prop
export function Sidebar({ role = "admin", user, workspaces = [] }: { role?: "admin" | "doctor", user?: UserSummary | null, workspaces?: any[] }) {
  const pathname = usePathname();
  const isWorkspaceAdmin = user?.role === "owner" || user?.role === "admin" || user?.role === "ADMIN";
  const isGlobalAdmin = user?.globalRole === "ADMIN";

  // We need to fix the logic:
  // If user.workspaceId is missing, rely entirely on globalRole.
  const effectiveRole = user?.workspaceId
    ? (isWorkspaceAdmin ? "admin" : "doctor")
    : (isGlobalAdmin ? "admin" : "doctor");

  const routes = effectiveRole === "doctor" ? doctorRoutes : adminRoutes;

  return (
    <aside className="hidden md:flex flex-col w-75 border-r border-neutral-200 dark:border-slate-700/50 bg-neutral-50 dark:bg-gray-900 h-screen fixed left-0 top-0 z-40">
      {/* Header with Workspace Switcher */}
      <div className="h-20 flex items-center px-4 border-b border-neutral-200 dark:border-slate-700/50">
        <WorkspaceSwitcher items={workspaces} userRole={user?.globalRole ?? undefined} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {routes.map((route) => {
          // FIXED: Exact match for overview pages, prefix match for others
          const isActive =
            pathname === route.href ||
            (pathname?.startsWith(route.href + "/") && route.href !== "/admin" && route.href !== "/doctor");

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-neutral-200 dark:bg-slate-700/50 text-black dark:text-white"
                  : "text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-700/30 hover:text-black dark:hover:text-slate-200"
              )}
            >
              <route.icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-black dark:text-white" : "text-neutral-400 dark:text-slate-500"
                )}
                strokeWidth={2}
              />
              {route.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-neutral-200 dark:border-slate-700/50 space-y-4">

        {/* The Logout Button */}
        <LogoutButton />

        {/* User Profile Info */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-600 dark:text-slate-300">
              {user?.avatar || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {user?.name || "User"}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-600 dark:text-slate-400 bg-neutral-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                {user?.globalRole || user?.role || "USER"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}