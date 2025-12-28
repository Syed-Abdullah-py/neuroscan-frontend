"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Activity,
  LogOut
} from "lucide-react";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";

// ... existing imports ...

import { LogoutButton } from "@/features/auth/components/logout-button";

const adminRoutes = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Cases", href: "/admin/cases", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Management", href: "/admin/management", icon: Users }, // Added Management
];

const doctorRoutes = [
  { name: "Overview", href: "/doctor", icon: LayoutDashboard },
  { name: "My Cases", href: "/doctor/cases", icon: FileText },
];

type UserSummary = {
  name: string | null;
  email: string;
  avatar: string;
  role?: string;
};

// Add workspaces prop
export function Sidebar({ role = "admin", user, workspaces = [] }: { role?: "admin" | "doctor", user?: UserSummary | null, workspaces?: any[] }) {
  const pathname = usePathname();
  const effectiveRole = user?.role === "radiologist" || user?.role === "doctor" ? "doctor" : "admin";
  const routes = effectiveRole === "doctor" ? doctorRoutes : adminRoutes;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-screen fixed left-0 top-0 z-40">
      {/* Header with Workspace Switcher */}
      <div className="h-20 flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
        <WorkspaceSwitcher items={workspaces} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname?.startsWith(route.href + "/");
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <route.icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">

        {/* The Logout Button */}
        <LogoutButton />

        {/* User Profile Info */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{user?.avatar || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || "User"}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                {user?.role || "USER"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}