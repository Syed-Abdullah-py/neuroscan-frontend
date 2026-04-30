"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Users, Settings, LayoutDashboard,
    Copy, Check, RefreshCw, Plus, LogOut,
    UserPlus, ChevronRight, Loader2, X,
    CheckCircle2, Search, Trash2, Save, AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/providers/workspace-provider";
import {
    useWorkspaces,
    useWorkspaceMembers,
    useWorkspaceInvitations,
    useMyInvitations,
    useJoinRequests,
    useInviteMember,
    useRemoveMember,
    useAcceptInvitation,
    useRejectInvitation,
    useApproveJoinRequest,
    useRejectJoinRequest,
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useDiscoverWorkspaces,
    useRequestJoin,
    useInvitableUsers,
} from "@/features/workspaces/hooks/use-workspaces";
import { leaveWorkspaceAction } from "@/features/workspaces/actions/workspace.actions";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

type Tab = "overview" | "members" | "settings";
type Panel = "list" | "join" | "create";

interface WorkspacesShellProps {
    user: {
        id: string;
        email: string;
        name: string;
        globalRole: string;
        workspaceId?: string;
    };
    memberships: any[];
    workspaceId: string | null;
    workspaceRole: WorkspaceRole | null;
    initialMembers: any[];
    initialJoinRequests: any[];
    initialMyInvitations: any[];
    initialSentInvitations: any[];
}

export function WorkspacesShell({
    user,
    memberships,
    workspaceId,
    workspaceRole,
    initialMembers,
    initialJoinRequests,
    initialMyInvitations,
    initialSentInvitations,
}: WorkspacesShellProps) {
    const { switchWorkspace, isSwitching } = useWorkspace();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [panel, setPanel] = useState<Panel>("list");
    const [copied, setCopied] = useState(false);

    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";

    // Live data via React Query (seeded from server props)
    const { data: workspaceList = memberships } = useWorkspaces();
    const { data: members = initialMembers } = useWorkspaceMembers(workspaceId ?? undefined);
    // Gate admin-only endpoints to avoid 403s for DOCTOR members
    const { data: joinRequests = initialJoinRequests } = useJoinRequests(isAdmin ? workspaceId ?? undefined : undefined);
    const { data: myInvitations = initialMyInvitations } = useMyInvitations();
    const { data: sentInvitations = initialSentInvitations } = useWorkspaceInvitations(isAdmin ? workspaceId ?? undefined : undefined);
    const isOwner = workspaceRole === "OWNER";

    const currentWorkspace = workspaceList.find(
        (w: any) => w.workspace_id === workspaceId || w.id === workspaceId
    );
    const workspaceName =
        currentWorkspace?.workspace_name || currentWorkspace?.name || "";

    const handleCopy = () => {
        if (workspaceId) {
            navigator.clipboard.writeText(workspaceId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    Workspaces
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Manage your organisations, team, and invitations.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left column: workspace list */}
                <div className="xl:col-span-3 space-y-4 min-w-0">
                    <WorkspaceListPanel
                        workspaces={workspaceList}
                        activeWorkspaceId={workspaceId}
                        panel={panel}
                        setPanel={setPanel}
                        onSwitch={switchWorkspace}
                        isSwitching={isSwitching}
                        globalRole={user.globalRole}
                        userId={user.id}
                    />
                </div>

                {/* Center: active workspace details */}
                <div className="xl:col-span-5 min-w-0">
                    {workspaceId ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible">
                            {/* Workspace header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                                    {workspaceName}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                            isOwner
                                                ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                                : isAdmin
                                                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                        )}
                                    >
                                        {workspaceRole}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="group flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all"
                                    >
                                        <span className="font-mono">
                                            {workspaceId.slice(0, 8)}...
                                        </span>
                                        {copied ? (
                                            <Check size={12} className="text-green-500" />
                                        ) : (
                                            <Copy size={12} />
                                        )}
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mt-6 overflow-x-auto">
                                    {(
                                        [
                                            { id: "overview", icon: LayoutDashboard, label: "Overview" },
                                            { id: "members", icon: Users, label: "Members" },
                                            ...(isOwner
                                                ? [{ id: "settings", icon: Settings, label: "Settings" }]
                                                : []),
                                        ] as { id: Tab; icon: any; label: string }[]
                                    ).map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
                                                activeTab === tab.id
                                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <tab.icon size={15} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab content */}
                            <div className="p-8">
                                <AnimatePresence mode="wait">
                                    {activeTab === "overview" && (
                                        <OverviewTab
                                            key="overview"
                                            members={members}
                                            admins={members.filter(
                                                (m: any) =>
                                                    m.role === "OWNER" || m.role === "ADMIN"
                                            )}
                                            doctors={members.filter(
                                                (m: any) => m.role === "DOCTOR"
                                            )}
                                        />
                                    )}
                                    {activeTab === "members" && (
                                        <MembersTab
                                            key="members"
                                            members={members}
                                            workspaceId={workspaceId}
                                            currentUserEmail={user.email}
                                            workspaceRole={workspaceRole}
                                            isAdmin={isAdmin}
                                        />
                                    )}
                                    {activeTab === "settings" && isOwner && (
                                        <SettingsTab
                                            key="settings"
                                            workspaceId={workspaceId}
                                            currentName={workspaceName}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <NoWorkspaceCard />
                    )}
                </div>

                {/* Right column: requests & invitations */}
                <div className="xl:col-span-4 space-y-4 min-w-0">
                    {isAdmin && (
                        <RequestsCard
                            joinRequests={joinRequests}
                            workspaceId={workspaceId!}
                        />
                    )}
                    <InvitationsCard
                        myInvitations={myInvitations}
                        sentInvitations={isAdmin ? sentInvitations : []}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function WorkspaceListPanel({
    workspaces,
    activeWorkspaceId,
    panel,
    setPanel,
    onSwitch,
    isSwitching,
    globalRole,
    userId,
}: any) {
    const createWs = useCreateWorkspace();
    const requestJoin = useRequestJoin();
    const { data: discoverable = [] } = useDiscoverWorkspaces();

    const [newName, setNewName] = useState("");
    const [joinSlug, setJoinSlug] = useState("");
    const [msg, setMsg] = useState("");
    const [isLeavePending, startLeave] = useTransition();

    const [leaveWsId, setLeaveWsId] = useState<string | null>(null);

    const handleLeave = (wsId: string) => {
        setLeaveWsId(wsId);
    };

    const confirmLeave = () => {
        if (!leaveWsId) return;
        const wsId = leaveWsId;
        setLeaveWsId(null);
        startLeave(async () => {
            const res = await leaveWorkspaceAction(wsId);
            if (!res.success) setMsg(res.message || "Failed to leave workspace.");
        });
    };

    const canCreate = globalRole === "ADMIN";

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            await createWs.mutateAsync(newName.trim());
            setNewName("");
            setPanel("list");
            setMsg("");
        } catch (err: any) {
            setMsg(err.message || "Failed to create workspace");
        }
    };

    const handleJoin = async (wsId: string) => {
        try {
            await requestJoin.mutateAsync(wsId);
            setMsg("Join request sent!");
            setTimeout(() => setMsg(""), 3000);
        } catch (err: any) {
            setMsg(err.message || "Failed to send request");
        }
    };

    return (
        <>
        {leaveWsId && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLeaveWsId(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-700 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-black dark:text-white">Leave Workspace</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-neutral-100 dark:border-slate-700">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">You will lose access to this workspace immediately.</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button onClick={() => setLeaveWsId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={confirmLeave} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors">
                            Leave
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Your Workspaces
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPanel(panel === "join" ? "list" : "join")}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        title="Join workspace"
                    >
                        <Search size={16} />
                    </button>
                    {canCreate && (
                        <button
                            onClick={() => setPanel(panel === "create" ? "list" : "create")}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            title="Create workspace"
                        >
                            <Plus size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Create panel */}
            <AnimatePresence>
                {panel === "create" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                New Workspace
                            </p>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                placeholder="City General Radiology"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                                autoFocus
                            />
                            <button
                                onClick={handleCreate}
                                disabled={createWs.isPending || !newName.trim()}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                                {createWs.isPending && (
                                    <Loader2 size={14} className="animate-spin" />
                                )}
                                Create
                            </button>
                        </div>
                    </motion.div>
                )}

                {panel === "join" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Join Workspace
                            </p>
                            {discoverable.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-3">
                                    No workspaces available to join.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {discoverable.map((ws: any) => (
                                        <div
                                            key={ws.id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {ws.name}
                                                </p>
                                                <p className="text-xs text-slate-400">{ws.slug}</p>
                                            </div>
                                            <button
                                                onClick={() => handleJoin(ws.id)}
                                                disabled={requestJoin.isPending}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {msg && (
                <p
                    className={cn(
                        "text-xs font-medium mb-3 px-3 py-2 rounded-lg",
                        msg.includes("sent") || msg.includes("!")
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}
                >
                    {msg}
                </p>
            )}

            {/* Workspace list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {workspaces.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-medium">No memberships yet.</p>
                    </div>
                ) : (
                    workspaces.map((ws: any) => {
                        const wsId = ws.workspace_id || ws.id;
                        const wsName = ws.workspace_name || ws.name;
                        const isActive = wsId === activeWorkspaceId;

                        const canLeave = ws.role !== "OWNER";
                        return (
                            <div
                                key={wsId}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl border transition-all relative group flex items-center gap-3",
                                    isActive
                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                )}
                            >
                                <button
                                    onClick={() => !isActive && onSwitch(wsId)}
                                    disabled={isSwitching || isActive}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                                            isActive
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        )}
                                    >
                                        {wsName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className={cn(
                                                "text-sm font-bold truncate",
                                                isActive
                                                    ? "text-blue-700 dark:text-blue-300"
                                                    : "text-slate-900 dark:text-white"
                                            )}
                                        >
                                            {wsName}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {ws.role}
                                        </p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {isActive && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                    {canLeave && (
                                        <button
                                            onClick={() => handleLeave(wsId)}
                                            disabled={isLeavePending}
                                            title="Leave workspace"
                                            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
        </>
    );
}

function OverviewTab({
    members,
    admins,
    doctors,
}: {
    members: any[];
    admins: any[];
    doctors: any[];
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-2 gap-4"
        >
            {[
                {
                    label: "Total Members",
                    value: members.length,
                    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                    icon: Users,
                    span: "col-span-2",
                },
                {
                    label: "Admins",
                    value: admins.length,
                    color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
                    icon: Settings,
                    span: "",
                },
                {
                    label: "Doctors",
                    value: doctors.length,
                    color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
                    icon: Users,
                    span: "",
                },
            ].map((stat) => (
                <div
                    key={stat.label}
                    className={cn(
                        "p-5 rounded-2xl border border-slate-200 dark:border-slate-800",
                        stat.span
                    )}
                >
                    <div className={cn("p-2.5 w-fit rounded-xl mb-3", stat.color)}>
                        <stat.icon size={18} />
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {stat.value}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        {stat.label}
                    </p>
                </div>
            ))}
        </motion.div>
    );
}

function MembersTab({
    members,
    workspaceId,
    currentUserEmail,
    workspaceRole,
    isAdmin,
}: any) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<{ email: string; name: string | null } | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [inviteMsg, setInviteMsg] = useState("");
    const invite = useInviteMember();
    const remove = useRemoveMember();
    const [removeTarget, setRemoveTarget] = useState<{ userId: string; name: string } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: invitableUsers = [], isFetching: searchingUsers } = useInvitableUsers(
        isAdmin ? workspaceId : undefined,
        query
    );

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleInvite = async () => {
        if (!selected) return;
        try {
            await invite.mutateAsync(selected.email);
            setSelected(null);
            setQuery("");
            setInviteMsg("Invitation sent!");
            setTimeout(() => setInviteMsg(""), 3000);
        } catch (err: any) {
            setInviteMsg(err.message || "Failed to send invite");
        }
    };

    return (
        <>
        {removeTarget && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-700 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-black dark:text-white">Remove Member</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-neutral-100 dark:border-slate-700">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="font-semibold text-black dark:text-white">{removeTarget.name}</span> will be removed from this workspace.
                        </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => setRemoveTarget(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { remove.mutate({ userId: removeTarget.userId }); setRemoveTarget(null); }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
        >
            {/* Invite form */}
            {isAdmin && (
                <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Invite Member
                    </p>
                    <div className="flex gap-2">
                        {/* User picker */}
                        <div ref={wrapperRef} className="relative flex-1">
                            {selected ? (
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                    <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300 shrink-0">
                                        {(selected.name || selected.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                                            {selected.name || selected.email}
                                        </p>
                                        {selected.name && (
                                            <p className="text-[11px] text-slate-500 truncate">{selected.email}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setSelected(null); setQuery(""); }}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
                                        onFocus={() => setDropdownOpen(true)}
                                        placeholder="Search by name or email…"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        name="invite-search-field"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                                    />
                                    {searchingUsers && (
                                        <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                                    )}
                                </div>
                            )}

                            {/* Dropdown */}
                            <AnimatePresence>
                                {dropdownOpen && !selected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                                    >
                                        {searchingUsers ? (
                                            <div className="px-4 py-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                                                <Loader2 size={13} className="animate-spin" />
                                                Searching…
                                            </div>
                                        ) : invitableUsers.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
                                                {query ? "No users found matching your search" : "No users available to invite"}
                                            </div>
                                        ) : (
                                            <div className="max-h-52 overflow-y-auto py-1.5">
                                                {invitableUsers.map((u) => (
                                                    <button
                                                        key={u.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setSelected({ email: u.email, name: u.name });
                                                            setDropdownOpen(false);
                                                            setQuery("");
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                                    >
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                            getAvatarColor(u.id).bg, getAvatarColor(u.id).text
                                                        )}>
                                                            {(u.name || u.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                                {u.name || u.email}
                                                            </p>
                                                            {u.name && (
                                                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                                            )}
                                                        </div>
                                                        {u.global_role && (
                                                            <span className="ml-auto text-[10px] font-semibold uppercase text-slate-400 shrink-0">
                                                                {u.global_role}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleInvite}
                            disabled={invite.isPending || !selected}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0"
                        >
                            {invite.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <UserPlus size={14} />
                            )}
                            Invite
                        </button>
                    </div>
                    {inviteMsg && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "text-xs font-medium",
                                inviteMsg.includes("sent")
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {inviteMsg}
                        </motion.p>
                    )}
                </div>
            )}

            {/* Members list */}
            <div className="space-y-2">
                {members.map((m: any) => {
                    const name = m.user_name || m.name || "Unknown";
                    const email = m.user_email || m.email || "";
                    const role = m.role || "DOCTOR";
                    const userId = m.user_id || m.userId;
                    const isSelf = email === currentUserEmail;
                    const canRemove =
                        isAdmin && !isSelf && role !== "OWNER";

                    return (
                        <div
                            key={m.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {name}
                                        {isSelf && (
                                            <span className="ml-2 text-[10px] text-slate-400">
                                                (you)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500">{email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        "text-[10px] font-bold uppercase px-2 py-1 rounded-md",
                                        role === "OWNER"
                                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                            : role === "ADMIN"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    )}
                                >
                                    {role}
                                </span>
                                {canRemove && (
                                    <button
                                        onClick={() => setRemoveTarget({ userId, name })}
                                        disabled={remove.isPending}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
        </>
    );
}

function SettingsTab({
    workspaceId,
    currentName,
}: {
    workspaceId: string;
    currentName: string;
}) {
    const [name, setName] = useState(currentName);
    const [msg, setMsg] = useState("");
    const updateWs = useUpdateWorkspace();
    const deleteWs = useDeleteWorkspace();

    const handleUpdate = async () => {
        try {
            await updateWs.mutateAsync({ workspaceId, name });
            setMsg("Name updated.");
            setTimeout(() => setMsg(""), 3000);
        } catch (err: any) {
            setMsg(err.message || "Failed to update");
        }
    };

    const handleDelete = () => {
        if (!confirm("Delete this workspace? This cannot be undone.")) return;
        const typed = prompt("Type DELETE to confirm:");
        if (typed !== "DELETE") return;
        deleteWs.mutate(workspaceId, {
            onSuccess: () => {
                window.location.href = "/workspaces";
            },
            onError: (err: any) => {
                setMsg(err.message || "Failed to delete");
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
        >
            {/* Rename */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Workspace Name
                </p>
                <div className="flex gap-2">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    />
                    <button
                        onClick={handleUpdate}
                        disabled={updateWs.isPending || name === currentName}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {updateWs.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        Save
                    </button>
                </div>
                {msg && (
                    <p
                        className={cn(
                            "text-xs font-medium",
                            msg.includes("updated")
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                        )}
                    >
                        {msg}
                    </p>
                )}
            </div>

            {/* Danger zone */}
            <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">
                    Danger Zone
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70 mb-4">
                    Permanently deletes all patients, cases, and workspace data.
                </p>
                <button
                    onClick={handleDelete}
                    disabled={deleteWs.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                >
                    {deleteWs.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Trash2 size={14} />
                    )}
                    Delete Workspace
                </button>
            </div>
        </motion.div>
    );
}

const AVATAR_COLORS = [
    { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300" },
    { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
    { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300" },
];

function getAvatarColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function RequestsCard({
    joinRequests,
    workspaceId,
}: {
    joinRequests: any[];
    workspaceId: string;
}) {
    const approve = useApproveJoinRequest();
    const reject = useRejectJoinRequest();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try { await approve.mutateAsync(id); } finally { setProcessingId(null); }
    };
    const handleReject = async (id: string) => {
        setProcessingId(id);
        try { await reject.mutateAsync(id); } finally { setProcessingId(null); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <UserPlus size={15} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Join Requests</h4>
                </div>
                <AnimatePresence>
                    {joinRequests.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="min-w-[22px] h-[22px] px-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center"
                        >
                            {joinRequests.length}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2">
                <AnimatePresence initial={false}>
                    {joinRequests.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-10 gap-2"
                        >
                            <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                            <p className="text-xs text-slate-400 font-medium">No pending requests</p>
                        </motion.div>
                    ) : (
                        joinRequests.map((req: any, index: number) => {
                            const isProcessing = processingId === req.id;
                            const name = req.user_name || req.user_email?.split("@")[0] || "Unknown";
                            const initials = name.slice(0, 2).toUpperCase();
                            const color = getAvatarColor(req.user_id || req.user_email || req.id);

                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.25, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01 }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors",
                                        "bg-slate-50/80 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/60",
                                        "hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm",
                                        isProcessing && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                                        color.bg, color.text
                                    )}>
                                        {initials}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                                            {name}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                            {req.user_email}
                                            {req.created_at && (
                                                <span className="text-slate-400 dark:text-slate-500"> · {timeAgo(req.created_at)}</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Actions — inline horizontal */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            disabled={!!processingId}
                                            className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all disabled:opacity-50"
                                            title="Decline"
                                        >
                                            {isProcessing && reject.isPending
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : <X size={12} />}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            disabled={!!processingId}
                                            className="h-7 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {isProcessing && approve.isPending
                                                ? <Loader2 size={12} className="animate-spin" />
                                                : <Check size={12} />}
                                            Approve
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function expiryLabel(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "Expires tomorrow";
    return `Expires in ${days} days`;
}

function InvitationsCard({
    myInvitations,
    sentInvitations,
    isAdmin,
}: {
    myInvitations: any[];
    sentInvitations: any[];
    isAdmin: boolean;
}) {
    const accept = useAcceptInvitation();
    const reject = useRejectInvitation();
    const { switchWorkspace } = useWorkspace();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAccept = async (inv: any) => {
        setProcessingId(inv.id);
        try {
            await accept.mutateAsync(inv.id);
            switchWorkspace(inv.workspace_id);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try { await reject.mutateAsync(id); } finally { setProcessingId(null); }
    };

    const hasContent = myInvitations.length > 0 || (isAdmin && sentInvitations.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Invitations
                </h4>
                <AnimatePresence>
                    {myInvitations.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="min-w-[20px] h-5 px-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                        >
                            {myInvitations.length}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-4 py-3 space-y-4">
                <AnimatePresence initial={false}>
                    {!hasContent && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-8 gap-2 opacity-40"
                        >
                            <Building2 className="w-6 h-6 text-slate-400" />
                            <p className="text-xs text-slate-500 font-medium">No invitations</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Received invitations */}
                {myInvitations.length > 0 && (
                    <div className="space-y-2">
                        {isAdmin && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                Received
                            </p>
                        )}
                        <AnimatePresence initial={false}>
                            {myInvitations.map((inv: any, index: number) => {
                                const isProcessing = processingId === inv.id;
                                const isUrgent = new Date(inv.expires_at).getTime() - Date.now() < 86400000 * 2;
                                return (
                                    <motion.div
                                        key={inv.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-opacity",
                                            "border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10",
                                            isProcessing && "opacity-50 pointer-events-none"
                                        )}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                            <Building2 size={17} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                                {inv.workspace_name || "Workspace"}
                                            </p>
                                            <p className={cn(
                                                "text-[11px] font-medium",
                                                isUrgent ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                                            )}>
                                                {expiryLabel(inv.expires_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => handleReject(inv.id)}
                                                disabled={!!processingId}
                                                className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-red-200 transition-all"
                                                title="Decline"
                                            >
                                                {isProcessing && reject.isPending
                                                    ? <Loader2 size={12} className="animate-spin" />
                                                    : <X size={12} />}
                                            </button>
                                            <button
                                                onClick={() => handleAccept(inv)}
                                                disabled={!!processingId}
                                                className="h-7 px-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-500/20"
                                            >
                                                {isProcessing && accept.isPending
                                                    ? <Loader2 size={12} className="animate-spin" />
                                                    : <Check size={12} />}
                                                Accept
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Sent invitations (admin only) */}
                {isAdmin && sentInvitations.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                            Sent
                        </p>
                        <AnimatePresence initial={false}>
                            {sentInvitations.map((inv: any, index: number) => {
                                const isExpired = new Date(inv.expires_at).getTime() <= Date.now();
                                const isUrgent = !isExpired && new Date(inv.expires_at).getTime() - Date.now() < 86400000 * 2;
                                return (
                                    <motion.div
                                        key={inv.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 transition-colors hover:shadow-sm"
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shrink-0",
                                            isExpired ? "bg-slate-300 dark:bg-slate-600" : isUrgent ? "bg-red-400" : "bg-amber-400"
                                        )} />
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate flex-1">
                                            {inv.email}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] font-semibold px-2 py-0.5 rounded-lg shrink-0",
                                            isExpired
                                                ? "text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400"
                                                : isUrgent
                                                    ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                                    : "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                                        )}>
                                            {expiryLabel(inv.expires_at)}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function NoWorkspaceCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                No Workspace Selected
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Select a workspace from the list or create a new one to get started.
            </p>
        </div>
    );
}