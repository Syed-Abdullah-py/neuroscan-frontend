"use client";

import { useState } from "react";
import { WorkspaceManager } from "./workspace-manager";
import { WorkspaceSettings } from "@/features/admin/components/workspace-settings";
import { TeamManagement } from "@/features/admin/components/team-management";
import { Building2, Settings, Users, Copy, Check, LayoutDashboard, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { JoinRequestsList } from "@/features/admin/components/join-requests-list";
import { InvitationsList } from "./invitations-list";
import { useRouter } from "next/navigation";

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
    joinRequests?: any[]; // Received requests (Admin view)
    invitations?: any[]; // Sent TO the user
    sentInvitations?: any[]; // Sent BY this workspace
}

export function UnifiedWorkspace({ user, workspaces, currentWorkspaceName, members = [], joinRequests = [], invitations = [], sentInvitations = [] }: UnifiedWorkspaceProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "settings">("overview");
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    // Resolve permissions for the CURRENT active workspace
    const currentMembership = workspaces.find(w => w.id === user.workspaceId);
    const workspaceRole = currentMembership?.role || "DOCTOR"; // Default to lowest if not found (shouldn't happen if active)

    const isOwner = workspaceRole === "OWNER";
    const isAdmin = workspaceRole === "ADMIN" || isOwner;

    const handleCopyId = () => {
        if (user.workspaceId) {
            navigator.clipboard.writeText(user.workspaceId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Workspace List */}
            <div className="xl:col-span-3 space-y-6 sticky top-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                    <div className="p-6 pb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Workspaces</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your organizations</p>
                    </div>
                    <div className="p-4 pt-2">
                        <WorkspaceManager
                            currentWorkspaceId={user.workspaceId}
                            workspaces={workspaces}
                            userGlobalRole={user.globalRole || "DOCTOR"}
                        />
                    </div>
                </div>
            </div>

            {/* Center Content: Active Workspace Details */}
            <div className="xl:col-span-6 order-last xl:order-0">
                <AnimatePresence mode="wait">
                    {user.workspaceId ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 min-h-[600px] flex flex-col overflow-hidden"
                        >
                            {/* Hero Header Area */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-to-r from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div>
                                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                                            {currentWorkspaceName}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
                                                isOwner ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20" :
                                                    isAdmin ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20" :
                                                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                            )}>
                                                {workspaceRole}
                                            </span>
                                            <button
                                                onClick={handleCopyId}
                                                className="group flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all"
                                            >
                                                <span className="font-mono">ID: {user.workspaceId.slice(0, 8)}...</span>
                                                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="group-hover:text-slate-800 dark:group-hover:text-white" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Tabs - Modern Pills */}
                                <div className="flex gap-2 mt-8 overflow-x-auto pb-1 no-scrollbar">
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={cn(
                                            "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                                            activeTab === "overview"
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <LayoutDashboard size={16} />
                                        Overview
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("members")}
                                        className={cn(
                                            "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                                            activeTab === "members"
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <Users size={16} />
                                        Members
                                    </button>

                                    {isOwner && (
                                        <button
                                            onClick={() => setActiveTab("settings")}
                                            className={cn(
                                                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                                                activeTab === "settings"
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8 flex-1 bg-white dark:bg-slate-900">
                                {activeTab === "overview" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-100/50 dark:shadow-black/20 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                        <Users size={24} />
                                                    </div>
                                                    <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                                        Active
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Members</p>
                                                <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">{members.length}</p>
                                            </div>

                                            {/* Placeholder for future stats */}
                                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-70">
                                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                                                    <LayoutDashboard size={24} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-500">More stats coming soon</p>
                                            </div>
                                        </div>

                                        <div className="hidden"></div>
                                    </motion.div>
                                )}


                                {activeTab === "members" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TeamManagement
                                            initialMembers={members}
                                            currentUserEmail={user.email}
                                            currentUserRole={workspaceRole}
                                            workspaceId={user.workspaceId!}
                                            workspaceName={currentWorkspaceName || ""}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === "settings" && isOwner && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <WorkspaceSettings
                                            workspaceId={user.workspaceId!}
                                            currentName={currentWorkspaceName || ""}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-12 text-center h-[500px] flex flex-col items-center justify-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-to-b from-blue-50/50 to-transparent dark:from-blue-900/5 pointer-events-none" />
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
                                <Building2 className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">No Active Workspace</h3>
                            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Select a workspace from the list on the left to view details, or create a new one to get started.
                            </p>
                            <button
                                onClick={() => router.push("?action=join")}
                                className="mt-6 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                            >
                                Join a Workspace
                            </button>
                        </motion.div>
                    )
                    }
                </AnimatePresence >
            </div >

            {/* Right Sidebar: Requests & Invitations */}
            <div className="xl:col-span-3 space-y-6 sticky top-6">
                {/* Requests first for Admin */}
                {isAdmin && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden p-6">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                            Received Requests
                            <button
                                onClick={() => router.refresh()}
                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Refresh"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </h4>
                        <JoinRequestsList requests={joinRequests} currentUserEmail={user.email} />

                        {isAdmin && sentInvitations.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Pending Sent Invitations
                                </h5>
                                <div className="space-y-2">
                                    {sentInvitations.map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                                                {inv.email}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                                                {inv.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Workspace Invitations */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Workspace Invitations
                        </h4>
                        <button
                            onClick={() => router.refresh()}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Refresh"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <InvitationsList invitations={invitations} />
                </div>
            </div>
        </div >
    );
}
