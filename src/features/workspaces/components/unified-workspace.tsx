"use client";

import { useState } from "react";
import { WorkspaceManager } from "./workspace-manager";
import { WorkspaceSettings } from "@/features/admin/components/workspace-settings";
import { TeamManagement } from "@/features/admin/components/team-management";
import { Building2, Settings, Users, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedWorkspaceProps {
    user: {
        id: string;
        email: string;
        role: string; // Global role
        workspaceId?: string; // Current active workspace
        globalRole: string | null;
    };
    workspaces: any[];
    currentWorkspaceName?: string;
    members?: any[];
}

export function UnifiedWorkspace({ user, workspaces, currentWorkspaceName, members = [] }: UnifiedWorkspaceProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "settings">("overview");

    // Resolve permissions for the CURRENT active workspace
    const currentMembership = workspaces.find(w => w.id === user.workspaceId);
    const workspaceRole = currentMembership?.role || "DOCTOR"; // Default to lowest if not found (shouldn't happen if active)

    const isOwner = workspaceRole === "OWNER";
    const isAdmin = workspaceRole === "ADMIN" || isOwner;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar: Workspace List */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            Your Workspaces
                        </h3>
                    </div>
                    <div className="p-2">
                        {/* Reuse existing manager for listing/joining/creating */}
                        <WorkspaceManager
                            currentWorkspaceId={user.workspaceId}
                            workspaces={workspaces}
                            userGlobalRole={user.globalRole || "DOCTOR"}
                        />
                    </div>
                </div>
            </div>

            {/* Right Content: Active Workspace Details */}
            <div className="lg:col-span-8">
                {user.workspaceId ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] flex flex-col">

                        {/* Header Area */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                    {currentWorkspaceName}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                        isOwner ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                            isAdmin ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                        {workspaceRole}
                                    </span>
                                    <span className="text-xs text-slate-400">ID: {user.workspaceId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-6">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={cn(
                                    "py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                    activeTab === "overview"
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <Building2 size={16} />
                                Overview
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => setActiveTab("members")}
                                    className={cn(
                                        "py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                        activeTab === "members"
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    <Users size={16} />
                                    Members
                                </button>
                            )}

                            {isOwner && (
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={cn(
                                        "py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                        activeTab === "settings"
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    <Settings size={16} />
                                    Settings
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 flex-1">
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                                            <p className="text-sm text-slate-500">Total Members</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.length}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        Select "Members" to manage your team or "Settings" to configure this workspace.
                                    </p>
                                </div>
                            )}

                            {activeTab === "members" && isAdmin && (
                                <TeamManagement
                                    initialMembers={members}
                                    currentUserEmail={user.email}
                                    currentUserRole={workspaceRole} // Pass workspace role, not global
                                    workspaceId={user.workspaceId!}
                                    workspaceName={currentWorkspaceName || ""}
                                />
                            )}

                            {activeTab === "settings" && isOwner && (
                                <WorkspaceSettings
                                    workspaceId={user.workspaceId!}
                                    currentName={currentWorkspaceName || ""}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Workspace</h3>
                        <p className="text-slate-500 max-w-sm">
                            Select a workspace from the list on the left, or create a new one to get started.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
