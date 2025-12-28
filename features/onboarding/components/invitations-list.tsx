"use client";

import { useState, useTransition } from "react";
import { acceptInvitation, rejectInvitation } from "@/actions/auth-actions";
import { Mail, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Invitation = {
    id: string;
    workspaceName: string;
    role: string;
    sentAt: Date;
};

export function InvitationsList({ invitations }: { invitations: Invitation[] }) {
    const [pendingId, setPendingId] = useState<string | null>(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    if (invitations.length === 0) return null;

    const handleAccept = (id: string) => {
        setPendingId(id);
        startTransition(async () => {
            const res = await acceptInvitation(id);
            if (res.success) {
                window.location.reload(); // Hard reload to update session
            } else {
                alert(res.message);
                setPendingId(null);
            }
        });
    };

    const handleReject = (id: string) => {
        setPendingId(id);
        startTransition(async () => {
            const res = await rejectInvitation(id);
            if (res.success) {
                router.refresh();
                setPendingId(null);
            } else {
                alert(res.message);
                setPendingId(null);
            }
        });
    };

    return (
        <div className="max-w-md mx-auto mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Pending Invitations
                </h3>

                <div className="space-y-3">
                    {invitations.map((invite) => (
                        <div key={invite.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{invite.workspaceName}</p>
                                <p className="text-xs text-slate-500 capitalize">Role: {invite.role.toLowerCase()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleReject(invite.id)}
                                    disabled={!!pendingId}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Reject"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleAccept(invite.id)}
                                    disabled={!!pendingId}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center min-w-[36px]"
                                    title="Accept"
                                >
                                    {pendingId === invite.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
