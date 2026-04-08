"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Building2,
} from "lucide-react";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";
import { LogoutButton } from "@/features/auth/components/logout-button";

const adminRoutes = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Cases", href: "/dashboard/cases", icon: FileText },
  { name: "Workspaces", href: "/dashboard/workspaces", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const doctorRoutes = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/dashboard/cases", icon: FileText },
  { name: "Workspaces", href: "/dashboard/workspaces", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

type UserSummary = {
  id: string;
  name: string | null;
  email: string;
  avatar: string;
  globalRole?: string | null;
  workspaceId?: string;
};

export function Sidebar({
  user,
  workspaces = [],
}: {
  user?: UserSummary | null;
  workspaces?: any[];
}) {
  const pathname = usePathname();

  // Derive effective role from globalRole
  // ADMIN global role → admin routes; RADIOLOGIST → doctor routes
  const isGlobalAdmin = user?.globalRole === "ADMIN";
  const routes = isGlobalAdmin ? adminRoutes : doctorRoutes;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-slate-700/50 bg-neutral-50 dark:bg-gray-900 h-screen fixed left-0 top-0 z-40">
      {/* Workspace Switcher */}
      <div className="h-20 flex items-center px-4 border-b border-neutral-200 dark:border-slate-700/50">
        <WorkspaceSwitcher
          items={workspaces}
          userRole={user?.globalRole ?? undefined}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {routes.map((route) => {
          const isActive =
            pathname === route.href ||
            (route.href !== "/dashboard" &&
              pathname?.startsWith(route.href + "/"));

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
                  isActive
                    ? "text-black dark:text-white"
                    : "text-neutral-400 dark:text-slate-500"
                )}
                strokeWidth={2}
              />
              {route.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-slate-700/50 space-y-4">
        <LogoutButton />

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
            <span className="text-[10px] uppercase font-bold text-neutral-600 dark:text-slate-400 bg-neutral-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
              {user?.globalRole || "USER"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}