"use client";

import { useTransition, useState } from "react";
import { Check, X, Clock, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    acceptInvitationAction,
    rejectInvitationAction,
    approveJoinRequestAction,
    rejectJoinRequestAction,
} from "@/features/workspaces/actions/workspace.actions";
import {
    useWorkspaceInvitations,
    useJoinRequests,
    useMyInvitations,
} from "@/features/workspaces/hooks/use-workspaces";
import { useRouter } from "next/navigation";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

interface InvitationsPanelProps {
    sentInvitations: any[];
    myInvitations: any[];
    joinRequests: any[];
    workspaceId: string;
    workspaceRole: WorkspaceRole;
}

export function InvitationsPanel({
    sentInvitations: initialSent,
    myInvitations: initialMine,
    joinRequests: initialJoinReqs,
    workspaceId,
    workspaceRole,
}: InvitationsPanelProps) {
    const { data: sentInvitations = initialSent } =
        useWorkspaceInvitations(workspaceId);
    const { data: myInvitations = initialMine } = useMyInvitations();
    const { data: joinRequests = initialJoinReqs } =
        useJoinRequests(workspaceId);

    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const router = useRouter();

    const act = (fn: () => Promise<{ success: boolean; message: string }>) => {
        startTransition(async () => {
            const res = await fn();
            setMsg({ text: res.message, ok: res.success });
            if (res.success) router.refresh();
        });
    };

    return (
        <div className="space-y-8">
            {msg && (
                <div
                    className={cn(
                        "p-3 rounded-xl text-xs font-medium flex items-center gap-2",
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

            {/* Pending join requests */}
            <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Join Requests ({joinRequests.length})
                </h4>
                <div className="space-y-2">
                    {joinRequests.length === 0 ? (
                        <p className="text-sm text-neutral-400 text-center py-6">
                            No pending requests.
                        </p>
                    ) : (
                        joinRequests.map((req: any) => (
                            <div
                                key={req.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/20"
                            >
                                <div>
                                    <p className="text-sm font-bold text-black dark:text-white">
                                        {req.user_name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-neutral-500">{req.user_email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            act(() =>
                                                rejectJoinRequestAction(req.id, workspaceId)
                                            )
                                        }
                                        disabled={isPending}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            act(() =>
                                                approveJoinRequestAction(req.id, workspaceId)
                                            )
                                        }
                                        disabled={isPending}
                                        className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Sent invitations */}
            <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Sent Invitations ({sentInvitations.length})
                </h4>
                <div className="space-y-2">
                    {sentInvitations.length === 0 ? (
                        <p className="text-sm text-neutral-400 text-center py-6">
                            No pending invitations sent.
                        </p>
                    ) : (
                        sentInvitations.map((inv: any) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/20"
                            >
                                <div>
                                    <p className="text-sm font-bold text-black dark:text-white">
                                        {inv.email}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        Expires{" "}
                                        {new Date(inv.expires_at).toLocaleDateString("en-GB")}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                    Pending
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* My invitations */}
            {myInvitations.length > 0 && (
                <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                        My Invitations ({myInvitations.length})
                    </h4>
                    <div className="space-y-2">
                        {myInvitations.map((inv: any) => (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10"
                            >
                                <div>
                                    <p className="text-sm font-bold text-black dark:text-white">
                                        {inv.workspace_name}
                                    </p>
                                    <p className="text-xs text-neutral-500">{inv.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            act(() => rejectInvitationAction(inv.id))
                                        }
                                        disabled={isPending}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            act(() => acceptInvitationAction(inv.id))
                                        }
                                        disabled={isPending}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors"
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}