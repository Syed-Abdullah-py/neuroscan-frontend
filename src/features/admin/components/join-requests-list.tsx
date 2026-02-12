import { Check, X, User, RefreshCw, ChevronDown } from "lucide-react";
import { resolveJoinRequest } from "@/actions/auth-actions";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define strict types for the props
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

export function JoinRequestsList({ requests, currentUserEmail }: JoinRequestsListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

    const handleResolve = (id: string, action: "approve" | "reject") => {
        const role = selectedRoles[id] || "DOCTOR"; // Default to DOCTOR

        startTransition(async () => {
            await resolveJoinRequest(id, action, role);
            router.refresh();
        });
    };

    const setRole = (id: string, role: string) => {
        setSelectedRoles(prev => ({ ...prev, [id]: role }));
    };

    if (requests.length === 0) {
        return (
            <div className="space-y-3">
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    No pending requests.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {req.user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {req.user.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="h-8 px-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        disabled={isPending}
                                    >
                                        {(selectedRoles[req.id] === "ADMIN" ? "Admin" : "Doctor")}
                                        <ChevronDown size={12} className="opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setRole(req.id, "DOCTOR")}>
                                        Doctor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setRole(req.id, "ADMIN")}>
                                        Admin
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <button
                            onClick={() => handleResolve(req.id, "reject")}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Reject"
                        >
                            <X size={16} />
                        </button>
                        <button
                            onClick={() => handleResolve(req.id, "approve")}
                            disabled={isPending}
                            className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors"
                            title="Accept"
                        >
                            <Check size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
