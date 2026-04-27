"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, type Variants } from "framer-motion";
import {
    Sun, Moon, Monitor, User, Shield,
    Bell, Palette, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/features/auth/actions/auth.actions";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

interface SettingsShellProps {
    user: {
        id: string;
        name: string;
        email: string;
        globalRole: string;
        avatar: string;
    };
    workspaceRole: WorkspaceRole | null;
}

type ThemeOption = "light" | "dark" | "system";

export function SettingsShell({ user, workspaceRole }: SettingsShellProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [activeSection, setActiveSection] = useState<"appearance" | "profile" | "notifications">("appearance");

    const sections = [
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
    ] as const;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl">
            {/* Header */}
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-black dark:text-white">Settings</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Manage your account and preferences.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left nav */}
                <motion.div variants={item} className="md:col-span-1">
                    <nav className="space-y-1">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                                    activeSection === s.id
                                        ? "bg-black dark:bg-white text-white dark:text-black"
                                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <s.icon size={16} />
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </motion.div>

                {/* Content */}
                <motion.div variants={item} className="md:col-span-3 space-y-6">
                    {activeSection === "appearance" && (
                        <AppearanceSection theme={theme as ThemeOption} setTheme={setTheme} resolvedTheme={resolvedTheme} />
                    )}
                    {activeSection === "profile" && (
                        <ProfileSection user={user} workspaceRole={workspaceRole} />
                    )}
                    {activeSection === "notifications" && (
                        <NotificationsSection />
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

// ── Appearance ─────────────────────────────────────────────────────────────

function AppearanceSection({
    theme,
    setTheme,
    resolvedTheme,
}: {
    theme: ThemeOption;
    setTheme: (t: string) => void;
    resolvedTheme: string | undefined;
}) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const options: { value: ThemeOption; label: string; icon: React.FC<{ size?: number; className?: string }>; desc: string }[] = [
        {
            value: "light",
            label: "Light",
            icon: Sun,
            desc: "Clean white interface",
        },
        {
            value: "dark",
            label: "Dark",
            icon: Moon,
            desc: "Easy on the eyes",
        },
        {
            value: "system",
            label: "System",
            icon: Monitor,
            desc: "Follows your OS setting",
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-6 space-y-6">
            <div>
                <h2 className="text-base font-bold text-black dark:text-white mb-1">
                    Theme
                </h2>
                <p className="text-sm text-neutral-500">
                    Choose how NeuroScan looks for you.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => {
                    const isActive = mounted && theme === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setTheme(opt.value)}
                            className={cn(
                                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                isActive
                                    ? "border-black dark:border-white bg-neutral-50 dark:bg-slate-800"
                                    : "border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600"
                            )}
                        >
                            {/* Theme preview */}
                            <div className={cn(
                                "w-full h-16 rounded-lg overflow-hidden border",
                                opt.value === "light"
                                    ? "bg-white border-neutral-200"
                                    : opt.value === "dark"
                                        ? "bg-slate-900 border-slate-700"
                                        : "border-neutral-200 dark:border-slate-700"
                            )}>
                                {opt.value === "system" ? (
                                    <div className="flex h-full">
                                        <div className="flex-1 bg-white" />
                                        <div className="flex-1 bg-slate-900" />
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1.5">
                                        <div className={cn(
                                            "h-2 rounded w-2/3",
                                            opt.value === "light" ? "bg-neutral-200" : "bg-slate-700"
                                        )} />
                                        <div className={cn(
                                            "h-2 rounded w-full",
                                            opt.value === "light" ? "bg-neutral-100" : "bg-slate-800"
                                        )} />
                                        <div className={cn(
                                            "h-2 rounded w-1/2",
                                            opt.value === "light" ? "bg-neutral-100" : "bg-slate-800"
                                        )} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <opt.icon size={14} className={isActive ? "text-black dark:text-white" : "text-neutral-400"} />
                                <span className={cn(
                                    "text-xs font-bold",
                                    isActive ? "text-black dark:text-white" : "text-neutral-500"
                                )}>
                                    {opt.label}
                                </span>
                            </div>

                            {isActive && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center">
                                    <Check size={11} className="text-white dark:text-black" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-slate-800">
                <p className="text-xs text-neutral-400">
                    Currently using{" "}
                    <span className="font-bold text-neutral-600 dark:text-neutral-300">
                        {mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "..."} mode
                    </span>
                    {mounted && theme === "system" && " (system preference)"}
                </p>
            </div>
        </div>
    );
}

// ── Profile ────────────────────────────────────────────────────────────────

function ProfileSection({
    user,
    workspaceRole,
}: {
    user: SettingsShellProps["user"];
    workspaceRole: WorkspaceRole | null;
}) {
    return (
        <div className="space-y-4">
            {/* Avatar + identity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-6">
                <h2 className="text-base font-bold text-black dark:text-white mb-5">
                    Account
                </h2>
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-bold text-neutral-600 dark:text-slate-300">
                            {user.avatar}
                        </span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-black dark:text-white">
                            {user.name}
                        </p>
                        <p className="text-sm text-neutral-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                user.globalRole === "ADMIN"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            )}>
                                <Shield size={10} />
                                {user.globalRole}
                            </span>
                            {workspaceRole && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400">
                                    {workspaceRole}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info cards */}
            {[
                { label: "User ID", value: user.id, mono: true },
                { label: "Email", value: user.email, mono: false },
                { label: "Global Role", value: user.globalRole, mono: false },
            ].map((field) => (
                <div
                    key={field.label}
                    className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800"
                >
                    <span className="text-sm text-neutral-500">{field.label}</span>
                    <span className={cn(
                        "text-sm font-medium text-black dark:text-white",
                        field.mono && "font-mono text-xs"
                    )}>
                        {field.value}
                    </span>
                </div>
            ))}

            {/* Sign out */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-5">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                    Sign Out
                </p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4">
                    You will be redirected to the login page.
                </p>
                <button
                    onClick={() => logoutUser()}
                    className="px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
}

// ── Notifications (placeholder) ────────────────────────────────────────────

function NotificationsSection() {
    const [invitePolling, setInvitePolling] = useState(true);
    const [sseEvents, setSseEvents] = useState(true);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-6 space-y-5">
            <div>
                <h2 className="text-base font-bold text-black dark:text-white mb-1">
                    Notifications
                </h2>
                <p className="text-sm text-neutral-500">
                    Control what events update your dashboard.
                </p>
            </div>

            {[
                {
                    label: "Invitation polling",
                    desc: "Check for new workspace invitations every 30 seconds",
                    value: invitePolling,
                    set: setInvitePolling,
                },
                {
                    label: "Real-time workspace events",
                    desc: "Receive live updates via SSE for case and member changes",
                    value: sseEvents,
                    set: setSseEvents,
                },
            ].map((opt) => (
                <div
                    key={opt.label}
                    className="flex items-start justify-between gap-4 py-4 border-t border-neutral-100 dark:border-slate-800 first:border-0 first:pt-0"
                >
                    <div>
                        <p className="text-sm font-bold text-black dark:text-white">
                            {opt.label}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <button
                        onClick={() => opt.set(!opt.value)}
                        className={cn(
                            "relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5",
                            opt.value
                                ? "bg-black dark:bg-white"
                                : "bg-neutral-200 dark:bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-black transition-transform",
                            opt.value && "translate-x-5"
                        )} />
                    </button>
                </div>
            ))}
        </div>
    );
}