"use client";

import { Check, X, Building2, UserCircle2 } from "lucide-react";
import { acceptInvitation, rejectInvitation } from "@/actions/auth-actions";
import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Invitation {
    id: string;
    workspaceName: string;
    role: string;
}

interface InvitationsListProps {
    invitations: Invitation[];
}

const ROLE_STYLES: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25",
    ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25",
    DOCTOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25",
};

export function InvitationsList({ invitations }: InvitationsListProps) {
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();
    const [optimisticInvitations, setOptimisticInvitations] = useState(invitations);

    useEffect(() => {
        setOptimisticInvitations(invitations);
    }, [invitations]);

    const handleAction = (id: string, action: "ACCEPT" | "REJECT") => {
        const previousInvitations = optimisticInvitations;
        setProcessingId(id);
        setOptimisticInvitations(prev => prev.filter(inv => inv.id !== id));

        startTransition(async () => {
            let result;
            if (action === "ACCEPT") {
                result = await acceptInvitation(id);
            } else {
                result = await rejectInvitation(id);
            }

            if (!result.success) {
                setOptimisticInvitations(previousInvitations);
                console.error(result.message);
            } else {
                router.refresh();
            }
            setProcessingId(null);
        });
    };

    if (optimisticInvitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <UserCircle2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No pending invitations</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {optimisticInvitations.map((invite) => {
                const roleStyle = ROLE_STYLES[invite.role] ?? ROLE_STYLES["DOCTOR"];
                const isProcessing = processingId === invite.id || isPending;

                return (
                    <div
                        key={invite.id}
                        className={cn(
                            "relative group rounded-2xl border transition-all duration-200 overflow-hidden",
                            "bg-white dark:bg-slate-800/60",
                            "border-slate-200 dark:border-slate-700/60",
                            "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
                            isProcessing && "opacity-60 pointer-events-none"
                        )}
                    >
                        {/* Colored left accent */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-2xl" />

                        <div className="flex items-center gap-4 px-5 py-4 pl-6">
                            {/* Icon Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/25">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                    {invite.workspaceName}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Invited as</span>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md", roleStyle)}>
                                        {invite.role}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => handleAction(invite.id, "REJECT")}
                                    disabled={isProcessing}
                                    className="h-8 px-2.5 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                                    title="Decline"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Decline</span>
                                </button>
                                <button
                                    onClick={() => handleAction(invite.id, "ACCEPT")}
                                    disabled={isProcessing}
                                    className="h-8 px-2.5 flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/25 transition-all"
                                    title="Accept"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Accept</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
