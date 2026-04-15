import { Check, X, UserRound } from "lucide-react";
import { resolveJoinRequest } from "@/actions/auth-actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type JoinRequest = {
    id: string;
    user: {
        name: string | null;
        email: string;
    };
    createdAt: Date;
};

interface JoinRequestsListProps {
    requests: JoinRequest[];
    currentUserEmail: string;
}

function getInitials(name: string | null, email: string): string {
    if (name) {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-rose-500 to-pink-600",
];

function getGradient(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function JoinRequestsList({ requests, currentUserEmail }: JoinRequestsListProps) {
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    const handleResolve = (id: string, action: "approve" | "reject") => {
        setProcessingId(id);
        startTransition(async () => {
            await resolveJoinRequest(id, action);
            router.refresh();
            setProcessingId(null);
        });
    };

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <UserRound className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No pending requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((req) => {
                const initials = getInitials(req.user.name, req.user.email);
                const gradient = getGradient(req.user.email);
                const isProcessing = processingId === req.id || isPending;

                return (
                    <div
                        key={req.id}
                        className={cn(
                            "relative group rounded-2xl border transition-all duration-200 overflow-hidden",
                            "bg-white dark:bg-slate-800/60",
                            "border-slate-200 dark:border-slate-700/60",
                            "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
                            isProcessing && "opacity-60 pointer-events-none"
                        )}
                    >
                        {/* Colored left accent */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-400 to-violet-600 rounded-l-2xl" />

                        <div className="flex items-center gap-4 px-5 py-4 pl-6">
                            {/* Avatar with initials */}
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                "bg-gradient-to-br shadow-md text-white text-sm font-bold",
                                gradient
                            )}>
                                {initials}
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                    {req.user.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {req.user.email}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => handleResolve(req.id, "reject")}
                                    disabled={isProcessing}
                                    className="h-8 px-2.5 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                                    title="Reject"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Reject</span>
                                </button>
                                <button
                                    onClick={() => handleResolve(req.id, "approve")}
                                    disabled={isProcessing}
                                    className="h-8 px-2.5 flex items-center gap-1 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-md shadow-violet-500/25 transition-all"
                                    title="Approve"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Approve</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
