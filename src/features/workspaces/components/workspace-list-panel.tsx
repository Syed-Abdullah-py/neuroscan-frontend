"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Plus, Search, LogOut,
    CheckCircle2, Loader2, AlertCircle, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/providers/workspace-provider";
import {
    createWorkspaceAction,
    requestJoinAction,
    leaveWorkspaceAction,
} from "@/features/workspaces/actions/workspace.actions";
import type { WorkspaceMembership } from "@/lib/types/workspace.types";
import { useRouter } from "next/navigation";

interface WorkspaceListPanelProps {
    memberships: WorkspaceMembership[];
    activeWorkspaceId?: string;
    discoverableWorkspaces: any[];
    globalRole: "ADMIN" | "RADIOLOGIST";
}

type Mode = "list" | "create" | "join";

export function WorkspaceListPanel({
    memberships,
    activeWorkspaceId,
    discoverableWorkspaces,
    globalRole,
}: WorkspaceListPanelProps) {
    const [mode, setMode] = useState<Mode>("list");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [leaveWsId, setLeaveWsId] = useState<string | null>(null);
    const { switchWorkspace, isSwitching } = useWorkspace();
    const router = useRouter();

    const handleCreate = () => {
        if (!name.trim()) return;
        startTransition(async () => {
            const res = await createWorkspaceAction(name);
            setMsg({ text: res.message, ok: res.success });
            if (res.success) {
                setName("");
                setMode("list");
                router.refresh();
            }
        });
    };

    const handleJoin = (wsId: string) => {
        startTransition(async () => {
            const res = await requestJoinAction(wsId);
            setMsg({ text: res.message, ok: res.success });
        });
    };

    const handleLeave = (wsId: string) => {
        setLeaveWsId(wsId);
    };

    const confirmLeave = () => {
        if (!leaveWsId) return;
        const wsId = leaveWsId;
        setLeaveWsId(null);
        startTransition(async () => {
            const res = await leaveWorkspaceAction(wsId);
            if (res.success) {
                router.refresh();
            } else {
                setMsg({ text: res.message, ok: false });
            }
        });
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
                        <button
                            onClick={() => setLeaveWsId(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmLeave}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        <div className="rounded-3xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/40 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-slate-700/50">
                <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                    Your Workspaces
                </h3>
                <p className="text-xs text-neutral-500">
                    {memberships.length} membership{memberships.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-b border-neutral-100 dark:border-slate-700/50 flex gap-2">
                <button
                    onClick={() => setMode(mode === "join" ? "list" : "join")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                        mode === "join"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    )}
                >
                    <Search className="w-3.5 h-3.5" />
                    Join Workspace
                </button>
                {globalRole === "ADMIN" && (
                    <button
                        onClick={() => setMode(mode === "create" ? "list" : "create")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                            mode === "create"
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-slate-700"
                        )}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create
                    </button>
                )}
            </div>

            {/* Create form */}
            <AnimatePresence>
                {mode === "create" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-b border-neutral-100 dark:border-slate-700/50 space-y-3">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Workspace name"
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={isPending || !name.trim()}
                                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create Workspace
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Join form */}
            <AnimatePresence>
                {mode === "join" && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 border-b border-neutral-100 dark:border-slate-700/50 space-y-3">
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                Available to join
                            </p>
                            {discoverableWorkspaces.length === 0 ? (
                                <p className="text-sm text-neutral-400 text-center py-4">
                                    No workspaces available.
                                </p>
                            ) : (
                                discoverableWorkspaces.map((ws: any) => (
                                    <div
                                        key={ws.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-black dark:text-white">
                                                {ws.name}
                                            </p>
                                            <p className="text-xs text-neutral-400">{ws.slug}</p>
                                        </div>
                                        <button
                                            onClick={() => handleJoin(ws.id)}
                                            disabled={isPending}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors"
                                        >
                                            Request
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback message */}
            {msg && (
                <div
                    className={cn(
                        "mx-4 mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2",
                        msg.ok
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}
                >
                    {msg.ok ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    {msg.text}
                </div>
            )}

            {/* Memberships list */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {memberships.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <Building2 className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                        <p className="text-xs font-medium text-neutral-500">
                            No memberships yet
                        </p>
                    </div>
                ) : (
                    memberships.map((m) => {
                        const isActive = m.workspace_id === activeWorkspaceId;
                        const canLeave = m.role !== "OWNER";
                        return (
                            <div
                                key={m.workspace_id}
                                className={cn(
                                    "w-full text-left p-3.5 rounded-2xl border transition-all relative group flex items-center gap-3",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                                        : "bg-white dark:bg-gray-900/20 border-neutral-200 dark:border-slate-700/50 hover:border-neutral-300 dark:hover:border-slate-600 hover:shadow-sm"
                                )}
                            >
                                {/* Clickable area to switch workspace */}
                                <button
                                    onClick={() => !isActive && switchWorkspace(m.workspace_id)}
                                    disabled={isActive || isSwitching}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    {isSwitching && !isActive && (
                                        <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 rounded-2xl flex items-center justify-center z-10">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                                            isActive
                                                ? "bg-blue-500 text-white"
                                                : "bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400"
                                        )}
                                    >
                                        {m.workspace_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "text-sm font-bold truncate",
                                            isActive ? "text-blue-700 dark:text-blue-300" : "text-black dark:text-white"
                                        )}>
                                            {m.workspace_name}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                            {m.role}
                                        </p>
                                    </div>
                                </button>

                                {/* Right side: active dot or leave button */}
                                {isActive ? (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)] shrink-0" />
                                ) : canLeave ? (
                                    <button
                                        onClick={() => handleLeave(m.workspace_id)}
                                        disabled={isPending}
                                        title="Leave workspace"
                                        className="shrink-0 p-1.5 rounded-lg text-neutral-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </button>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
        </>
    );
}