"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Users, Settings, LayoutDashboard,
    Copy, Check, RefreshCw, Plus, LogOut,
    UserPlus, ChevronRight, Loader2, X,
    CheckCircle2, Search, Trash2, Save,
} from "lucide-react";
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
} from "@/features/workspaces/hooks/use-workspaces";
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
                <div className="xl:col-span-4 space-y-4">
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
                <div className="xl:col-span-5">
                    {workspaceId ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                <div className="xl:col-span-3 space-y-4">
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

                        return (
                            <button
                                key={wsId}
                                onClick={() => !isActive && onSwitch(wsId)}
                                disabled={isSwitching}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl border transition-all relative group",
                                    isActive
                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 cursor-default"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold",
                                            isActive
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                        )}
                                    >
                                        {wsName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p
                                            className={cn(
                                                "text-sm font-bold",
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
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
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
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteMsg, setInviteMsg] = useState("");
    const invite = useInviteMember();
    const remove = useRemoveMember();

    const handleInvite = async () => {
        if (!inviteEmail.includes("@")) return;
        try {
            await invite.mutateAsync(inviteEmail);
            setInviteEmail("");
            setInviteMsg("Invitation sent!");
            setTimeout(() => setInviteMsg(""), 3000);
        } catch (err: any) {
            setInviteMsg(err.message || "Failed to send invite");
        }
    };

    return (
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
                        Invite by Email
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            placeholder="doctor@hospital.org"
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                        />
                        <button
                            onClick={handleInvite}
                            disabled={invite.isPending || !inviteEmail.includes("@")}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
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
                        <p
                            className={cn(
                                "text-xs font-medium",
                                inviteMsg.includes("sent")
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {inviteMsg}
                        </p>
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
                                        onClick={() => remove.mutate({ userId })}
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Users size={13} />
                    Join Requests
                </h4>
                {joinRequests.length > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {joinRequests.length}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                {joinRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                        <CheckCircle2 className="w-6 h-6 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">All clear</p>
                    </div>
                ) : (
                    joinRequests.map((req: any) => {
                        const isProcessing = processingId === req.id;
                        return (
                            <div
                                key={req.id}
                                className={cn(
                                    "flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-opacity",
                                    isProcessing && "opacity-50 pointer-events-none"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0 mr-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                        {(req.user_name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                            {req.user_name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{req.user_email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        disabled={!!processingId}
                                        title="Decline"
                                        className="h-7 px-2 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                                    >
                                        {isProcessing && reject.isPending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                        <span>Decline</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprove(req.id)}
                                        disabled={!!processingId}
                                        title="Approve"
                                        className="h-7 px-2 flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-500/20"
                                    >
                                        {isProcessing && approve.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                        <span>Approve</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Invitations
                </h4>
                {myInvitations.length > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {myInvitations.length}
                    </span>
                )}
            </div>

            {!hasContent && (
                <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                    <Building2 className="w-6 h-6 text-slate-400" />
                    <p className="text-xs text-slate-500 font-medium">No invitations</p>
                </div>
            )}

            {/* Received invitations */}
            {myInvitations.length > 0 && (
                <div className={cn(isAdmin && sentInvitations.length > 0 ? "mb-5" : "")}>
                    {isAdmin && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Received
                        </p>
                    )}
                    <div className="space-y-2">
                        {myInvitations.map((inv: any) => {
                            const isProcessing = processingId === inv.id;
                            return (
                                <div
                                    key={inv.id}
                                    className={cn(
                                        "rounded-xl border overflow-hidden transition-opacity",
                                        "border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10",
                                        isProcessing && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <div className="flex items-center gap-3 px-3 pt-3 pb-2">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                                            <Building2 size={16} className="text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                                {inv.workspace_name || "Workspace"}
                                            </p>
                                            <p className={cn(
                                                "text-[11px] font-medium mt-0.5",
                                                new Date(inv.expires_at).getTime() - Date.now() < 86400000 * 2
                                                    ? "text-amber-600 dark:text-amber-400"
                                                    : "text-slate-500"
                                            )}>
                                                {expiryLabel(inv.expires_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 px-3 pb-3">
                                        <button
                                            onClick={() => handleReject(inv.id)}
                                            disabled={!!processingId}
                                            className="flex-1 h-7 flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                                        >
                                            {isProcessing && reject.isPending ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <X size={12} />
                                            )}
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleAccept(inv)}
                                            disabled={!!processingId}
                                            className="flex-1 h-7 flex items-center justify-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-sm shadow-blue-500/20"
                                        >
                                            {isProcessing && accept.isPending ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <Check size={12} />
                                            )}
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sent invitations (admin only) */}
            {isAdmin && sentInvitations.length > 0 && (
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Sent
                    </p>
                    <div className="space-y-1.5">
                        {sentInvitations.map((inv: any) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                                        {inv.email}
                                    </p>
                                </div>
                                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                                    {expiryLabel(inv.expires_at)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
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