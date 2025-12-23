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
import { LogoutButton } from "@/features/auth/components/logout-button";

const adminRoutes = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Cases", href: "/admin/cases", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ role = "admin" }: { role?: "admin" | "doctor" }) {
  const pathname = usePathname();
  const routes = role === "admin" ? adminRoutes : adminRoutes; // Add doctor routes later

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-screen fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            NeuroScan
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href;
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
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}