"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Building2,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";
import { LogoutButton } from "@/features/auth/components/logout-button";

const adminRoutes = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Workspaces", href: "/workspaces", icon: Building2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const doctorRoutes = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Workspaces", href: "/workspaces", icon: Building2 },
  { name: "Settings", href: "/settings", icon: Settings },
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isGlobalAdmin = user?.globalRole === "ADMIN";
  const routes = isGlobalAdmin ? adminRoutes : doctorRoutes;

  const handleNav = (href: string) => {
    setMobileOpen(false);
    if (href === pathname) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  // Clear pending state once navigation settles
  if (pendingHref && !isPending) {
    setPendingHref(null);
  }

  return (
    <>
      {/* Mobile-only sticky top navbar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-neutral-50 dark:bg-gray-900 border-b border-neutral-200 dark:border-slate-700/50">
        <WorkspaceSwitcher
          items={workspaces}
          userRole={user?.globalRole ?? undefined}
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={cn(
          "flex flex-col w-64 border-r border-neutral-200 dark:border-slate-700/50 bg-neutral-50 dark:bg-gray-900 h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Workspace Switcher */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-slate-700/50">
          <WorkspaceSwitcher
            items={workspaces}
            userRole={user?.globalRole ?? undefined}
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {routes.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" &&
                pathname?.startsWith(route.href + "/"));

            const isLoading = pendingHref === route.href && isPending;

            return (
              <button
                key={route.href}
                onClick={() => handleNav(route.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                  isActive || isLoading
                    ? "bg-neutral-200 dark:bg-slate-700/50 text-black dark:text-white"
                    : "text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-700/30 hover:text-black dark:hover:text-slate-200"
                )}
              >
                {isLoading ? (
                  <Loader2
                    className="w-4 h-4 animate-spin text-neutral-400 dark:text-slate-500"
                    strokeWidth={2}
                  />
                ) : (
                  <route.icon
                    className={cn(
                      "w-4 h-4",
                      isActive
                        ? "text-black dark:text-white"
                        : "text-neutral-400 dark:text-slate-500"
                    )}
                    strokeWidth={2}
                  />
                )}
                {route.name}
              </button>
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
    </>
  );
}