"use client";

import { useState, useActionState, useEffect } from "react";
import { leaveWorkspace, requestJoinWorkspace, createWorkspace, getDiscoverableWorkspaces } from "@/actions/auth-actions";
import { Loader2, LogOut, Plus, Search, Building2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WorkspaceManagerProps {
    currentWorkspaceId?: string;
    workspaces: any[]; // User's memberships
    userGlobalRole?: string; // "ADMIN", "OWNER", "DOCTOR", etc.
}

const initialState = {
    message: "",
    success: false
};

type Mode = "LIST" | "JOIN" | "CREATE";

export function WorkspaceManager({ currentWorkspaceId, workspaces, userGlobalRole }: WorkspaceManagerProps) {
    const [mode, setMode] = useState<Mode>("LIST");
    const router = useRouter();

    // -- Actions --
    const [joinState, joinAction, isJoinPending] = useActionState(requestJoinWorkspace, initialState);
    const [createState, createAction, isCreatePending] = useActionState(createWorkspace, initialState);

    // -- State --
    const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);

    // -- Effects --
    useEffect(() => {
        if (mode === "JOIN") {
            getDiscoverableWorkspaces().then(setAvailableWorkspaces);
        }
    }, [mode]);

    // -- Handlers --
    const handleLeave = async (workspaceId: string) => {
        if (!confirm("Are you sure you want to leave this workspace?")) return;
        const result = await leaveWorkspace(workspaceId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.message || "Failed to leave workspace");
        }
    };

    // -- Render Helpers --
    const Header = ({ title, showBack = true }: { title: string, showBack?: boolean }) => (
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                {title}
            </h3>
            {showBack && (
                <button
                    onClick={() => setMode("LIST")}
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                    Cancel
                </button>
            )}
        </div>
    );

    // --- MODE: JOIN ---
    if (mode === "JOIN") {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <Header title="Join a Workspace" />

                <form action={joinAction} className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block">
                            Workspace Identifier / Slug
                        </label>
                        <div className="relative">
                            <input
                                name="workspaceSlug"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 pl-11 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                placeholder="e.g. city-general-radiology"
                                required
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>

                    {joinState?.message && (
                        <div className={cn(
                            "p-3 border rounded-lg text-sm flex items-center gap-2",
                            joinState.success
                                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                        )}>
                            {joinState.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {joinState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isJoinPending || joinState?.success}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {isJoinPending ? <Loader2 className="animate-spin" /> : "Send Request"}
                    </button>
                </form>

                {availableWorkspaces.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Available to Join</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {availableWorkspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{ws.name}</p>
                                        <p className="text-xs text-slate-500">{ws._count?.members || 0} members</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const input = document.querySelector('input[name="workspaceSlug"]') as HTMLInputElement;
                                            if (input) input.value = ws.slug;
                                        }}
                                        className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 hover:border-blue-200"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- MODE: CREATE ---
    if (mode === "CREATE") {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <Header title="Create Workspace" />

                <form action={createAction} className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block">
                            Workspace Name
                        </label>
                        <input
                            name="workspaceName"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            placeholder="e.g. City General Radiology"
                            required
                            minLength={3}
                        />
                    </div>

                    {createState?.message && (
                        <div className={cn(
                            "p-3 border rounded-lg text-sm flex items-center gap-2",
                            createState.success
                                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                        )}>
                            {createState.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {createState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isCreatePending || createState?.success}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {isCreatePending ? <Loader2 className="animate-spin" /> : "Create Workspace"}
                    </button>
                </form>
            </div>
        );
    }

    // --- MODE: LIST (Default) ---
    // Allow Admins, Owners, and Doctors to create workspaces
    const canCreate = ["ADMIN", "OWNER", "DOCTOR"].includes(userGlobalRole || "");

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        My Workspaces
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage your memberships
                    </p>
                </div>
                <div className="flex gap-2">
                    {canCreate && (
                        <button
                            onClick={() => setMode("CREATE")}
                            className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                        >
                            + Create
                        </button>
                    )}
                    <button
                        onClick={() => setMode("JOIN")}
                        className="text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        + Join New
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {workspaces.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-sm">No active memberships.</p>
                    </div>
                ) : (
                    workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                ws.id === currentWorkspaceId
                                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 ring-1 ring-blue-500/20"
                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {ws.name}
                                    {ws.id === currentWorkspaceId && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                                            Active
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mt-1">
                                    {ws.role}
                                </p>
                            </div>

                            <button
                                onClick={() => handleLeave(ws.id)}
                                disabled={ws.role === "OWNER"}
                                title={ws.role === "OWNER" ? "Owners cannot leave workspace" : "Leave Workspace"}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
