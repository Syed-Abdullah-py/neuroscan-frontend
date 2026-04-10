"use client";

import { useState, useTransition } from "react";
import { Shield, Stethoscope, Trash2, UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    inviteMemberAction,
    removeMemberAction,
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
        if (!confirm(`Remove ${userEmail} from this workspace?`)) return;
        startTransition(async () => {
            const res = await removeMemberAction(workspaceId, userId);
            setMsg({ text: res.message, ok: res.success });
        });
    };

    return (
        <div className="space-y-6">
            {/* Invite form — admin/owner only */}
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
                            const canRemove =
                                canManage && !isOwner && (isMe || currentUserRole === "OWNER" ||
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
                                        {canRemove && (
                                            <button
                                                onClick={() =>
                                                    handleRemove(m.user_id, m.user_email)
                                                }
                                                disabled={isPending}
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
    );
}