"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { MembersPanel } from "./members-panel";
import { InvitationsPanel } from "./invitations-panel";
import { WorkspaceSettingsPanel } from "./workspace-settings-panel";
import { WorkspaceListPanel } from "./workspace-list-panel";
import type { WorkspaceRole, WorkspaceMembership } from "@/lib/types/workspace.types";

type Tab = "overview" | "members" | "invitations" | "settings";

interface WorkspacesShellProps {
    user: {
        id: string;
        email: string;
        name: string;
        globalRole: "ADMIN" | "RADIOLOGIST";
        workspaceId?: string;
    };
    workspaceRole: WorkspaceRole | null;
    activeWorkspaceName: string | null;
    memberships: WorkspaceMembership[];
    members: any[];
    sentInvitations: any[];
    myInvitations: any[];
    joinRequests: any[];
    discoverableWorkspaces: any[];
}

export function WorkspacesShell({
    user,
    workspaceRole,
    activeWorkspaceName,
    memberships,
    members,
    sentInvitations,
    myInvitations,
    joinRequests,
    discoverableWorkspaces,
}: WorkspacesShellProps) {
    const [tab, setTab] = useState<Tab>("overview");

    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";
    const isOwner = workspaceRole === "OWNER";

    const tabs: { id: Tab; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "members", label: "Members", icon: Users },
        { id: "invitations", label: "Invitations", icon: Building2, adminOnly: true },
        { id: "settings", label: "Settings", icon: Settings, adminOnly: true },
    ];

    const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    Workspaces
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                    Manage your organizations, team members, and invitations.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left: workspace list */}
                <div className="xl:col-span-4">
                    <WorkspaceListPanel
                        memberships={memberships}
                        activeWorkspaceId={user.workspaceId}
                        discoverableWorkspaces={discoverableWorkspaces}
                        globalRole={user.globalRole}
                    />
                </div>

                {/* Right: active workspace detail */}
                <div className="xl:col-span-8 space-y-0">
                    {!user.workspaceId ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/40 text-center p-12"
                        >
                            <Building2 className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
                            <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                                No workspace selected
                            </h3>
                            <p className="text-sm text-neutral-500 max-w-xs">
                                Select a workspace from the left or join one to get started.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="rounded-3xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/40 overflow-hidden">
                            {/* Workspace header */}
                            <div className="p-8 border-b border-neutral-100 dark:border-slate-700/50">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-black dark:text-white">
                                            {activeWorkspaceName}
                                        </h2>
                                        <span
                                            className={cn(
                                                "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                isOwner
                                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                                    : isAdmin
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                        : "bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400"
                                            )}
                                        >
                                            {workspaceRole}
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono text-neutral-400 bg-neutral-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                        {user.workspaceId?.slice(0, 8)}…
                                    </span>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 overflow-x-auto">
                                    {visibleTabs.map((t) => {
                                        const Icon = t.icon as React.FC<{ className?: string }>;
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => setTab(t.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                                                    tab === t.id
                                                        ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                                                        : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tab content */}
                            <div className="p-8">
                                {tab === "overview" && (
                                    <OverviewTab
                                        members={members}
                                        joinRequests={joinRequests}
                                        isAdmin={isAdmin}
                                        workspaceId={user.workspaceId!}
                                        workspaceName={activeWorkspaceName ?? ""}
                                    />
                                )}
                                {tab === "members" && (
                                    <MembersPanel
                                        members={members}
                                        currentUserEmail={user.email}
                                        currentUserRole={workspaceRole}
                                        workspaceId={user.workspaceId!}
                                    />
                                )}
                                {tab === "invitations" && isAdmin && (
                                    <InvitationsPanel
                                        sentInvitations={sentInvitations}
                                        myInvitations={myInvitations}
                                        joinRequests={joinRequests}
                                        workspaceId={user.workspaceId!}
                                        workspaceRole={workspaceRole!}
                                    />
                                )}
                                {tab === "settings" && isAdmin && (
                                    <WorkspaceSettingsPanel
                                        workspaceId={user.workspaceId!}
                                        currentName={activeWorkspaceName ?? ""}
                                        isOwner={isOwner}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function OverviewTab({
    members,
    joinRequests,
    isAdmin,
    workspaceId,
    workspaceName,
}: {
    members: any[];
    joinRequests: any[];
    isAdmin: boolean;
    workspaceId: string;
    workspaceName: string;
}) {
    const admins = members.filter(
        (m) => m.role === "OWNER" || m.role === "ADMIN"
    ).length;
    const doctors = members.filter((m) => m.role === "DOCTOR").length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Members", value: members.length, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
                    { label: "Admins", value: admins, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
                    { label: "Doctors", value: doctors, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="p-5 rounded-2xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/20"
                    >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.color)}>
                            <Users className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold text-black dark:text-white">{s.value}</p>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mt-1">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            {isAdmin && joinRequests.length > 0 && (
                <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
                        {joinRequests.length} pending join{" "}
                        {joinRequests.length === 1 ? "request" : "requests"}
                    </p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                        Review them in the Invitations tab.
                    </p>
                </div>
            )}
        </div>
    );
}