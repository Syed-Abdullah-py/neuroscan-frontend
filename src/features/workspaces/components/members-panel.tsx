"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Shield, Stethoscope, Trash2, UserPlus, Loader2, CheckCircle2, AlertCircle, LogOut, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    inviteMemberAction,
    removeMemberAction,
    leaveWorkspaceAction,
} from "@/features/workspaces/actions/workspace.actions";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspaces";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

interface MembersPanelProps {
    members: any[];
    currentUserEmail: string;
    currentUserRole: WorkspaceRole | null;
    workspaceId: string;
}

export function MembersPanel({
    members: initialMembers,
    currentUserEmail,
    currentUserRole,
    workspaceId,
}: MembersPanelProps) {
    const { data: members = initialMembers } = useWorkspaceMembers(workspaceId);
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [confirmModal, setConfirmModal] = useState<
        | { type: "leave" }
        | { type: "remove"; userId: string; userEmail: string }
        | null
    >(null);

    const canManage =
        currentUserRole === "OWNER" || currentUserRole === "ADMIN";

    const handleInvite = () => {
        if (!email.includes("@")) return;
        startTransition(async () => {
            const res = await inviteMemberAction(workspaceId, email.trim());
            setMsg({ text: res.message, ok: res.success });
            if (res.success) setEmail("");
        });
    };

    const handleRemove = (userId: string, userEmail: string) => {
        setConfirmModal({ type: "remove", userId, userEmail });
    };

    const handleLeave = () => {
        setConfirmModal({ type: "leave" });
    };

    const executeConfirm = () => {
        if (!confirmModal) return;
        if (confirmModal.type === "leave") {
            startTransition(async () => {
                const res = await leaveWorkspaceAction(workspaceId);
                setMsg({ text: res.message, ok: res.success });
            });
        } else {
            const { userId } = confirmModal;
            startTransition(async () => {
                const res = await removeMemberAction(workspaceId, userId);
                setMsg({ text: res.message, ok: res.success });
            });
        }
        setConfirmModal(null);
    };

    const confirmTitle = confirmModal?.type === "leave" ? "Leave Workspace" : "Remove Member";
    const confirmBody = confirmModal?.type === "leave"
        ? "You will lose access to this workspace immediately."
        : `${confirmModal?.userEmail} will be removed from this workspace.`;
    const confirmLabel = confirmModal?.type === "leave" ? "Leave" : "Remove";

    return (
        <>
        {confirmModal && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-700 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-black dark:text-white">{confirmTitle}</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="bg-neutral-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-neutral-100 dark:border-slate-700">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{confirmBody}</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => setConfirmModal(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeConfirm}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}
        <div className="space-y-6">
            {/* Invite form - admin/owner only */}
            {canManage && (
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-slate-700/50 bg-neutral-50 dark:bg-slate-900/30">
                    <h4 className="text-sm font-bold text-black dark:text-white mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Invite by Email
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            placeholder="doctor@hospital.org"
                            className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                        <button
                            onClick={handleInvite}
                            disabled={isPending || !email.includes("@")}
                            className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Invite"
                            )}
                        </button>
                    </div>
                    {msg && (
                        <div
                            className={cn(
                                "mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2",
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
                </div>
            )}

            {/* Member list */}
            <div className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden">
                <div className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                    {members.length === 0 ? (
                        <div className="py-12 text-center text-sm text-neutral-400">
                            No members yet.
                        </div>
                    ) : (
                        members.map((m: any) => {
                            const isMe = m.user_email === currentUserEmail;
                            const isOwner = m.role === "OWNER";
                            const canLeave = isMe && !isOwner;
                            const canRemove =
                                !isMe && canManage && !isOwner && (currentUserRole === "OWNER" ||
                                    (currentUserRole === "ADMIN" && m.role === "DOCTOR"));

                            return (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                            {m.user_name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                                                {m.user_name || "Unknown"}
                                                {isMe && (
                                                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-neutral-500">{m.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {m.role === "OWNER" && (
                                                <Shield className="w-3.5 h-3.5 text-purple-500" />
                                            )}
                                            {m.role === "ADMIN" && (
                                                <Shield className="w-3.5 h-3.5 text-blue-500" />
                                            )}
                                            {m.role === "DOCTOR" && (
                                                <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                                            )}
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                                                {m.role}
                                            </span>
                                        </div>
                                        {canLeave && (
                                            <button
                                                onClick={handleLeave}
                                                disabled={isPending}
                                                title="Leave workspace"
                                                className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {canRemove && (
                                            <button
                                                onClick={() =>
                                                    handleRemove(m.user_id, m.user_email)
                                                }
                                                disabled={isPending}
                                                title="Remove member"
                                                className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
        </>
    );
}