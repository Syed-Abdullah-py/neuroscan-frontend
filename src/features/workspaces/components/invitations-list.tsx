"use client";

import { Check, X, Building2 } from "lucide-react";
import { acceptInvitation, rejectInvitation } from "@/actions/auth-actions";
import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Invitation {
    id: string;
    workspaceName: string;
    role: string;
}

interface InvitationsListProps {
    invitations: Invitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    // Using local state to manage the list for optimistic updates
    const [optimisticInvitations, setOptimisticInvitations] = useState(invitations);

    // Sync with props if they change (e.g., after router refresh)
    useEffect(() => {
        setOptimisticInvitations(invitations);
    }, [invitations]);

    const handleAction = (id: string, action: "ACCEPT" | "REJECT") => {
        // Optimistically remove from list
        const previousInvitations = optimisticInvitations;
        setOptimisticInvitations(prev => prev.filter(inv => inv.id !== id));

        startTransition(async () => {
            let result;
            if (action === "ACCEPT") {
                result = await acceptInvitation(id);
            } else {
                result = await rejectInvitation(id);
            }

            if (!result.success) {
                // Revert if failed
                setOptimisticInvitations(previousInvitations);
                // Optionally show error toast here
                console.error(result.message);
            } else {
                router.refresh();
            }
        });
    };

    if (optimisticInvitations.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm italic">
                No pending invitations.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {optimisticInvitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {invite.workspaceName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Invited as <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">{invite.role}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAction(invite.id, "REJECT")}
                            disabled={isPending}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Reject"
                        >
                            <X size={18} />
                        </button>
                        <button
                            onClick={() => handleAction(invite.id, "ACCEPT")}
                            disabled={isPending}
                            className="p-2 text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                            title="Accept"
                        >
                            <Check size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
