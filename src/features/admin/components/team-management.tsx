"use client";

import { useState, useTransition, useEffect } from "react";
import { addWorkspaceMember as addTeamMember, removeWorkspaceMember, searchUsers, inviteUser } from "@/actions/auth-actions";
import { Loader2, Trash2, Shield, Stethoscope, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSettings } from "@/features/admin/components/workspace-settings";

type Member = {
    userId: string;
    role: "OWNER" | "ADMIN" | "DOCTOR";
    name: string | null;
    email: string;
    licenseId: string | null;
};

interface TeamManagementProps {
    initialMembers: Member[];
    currentUserEmail: string;
    currentUserRole?: string;
    workspaceName?: string;
    workspaceId?: string;
}

export function TeamManagement({ initialMembers, currentUserEmail, currentUserRole, workspaceName = "", workspaceId = "" }: TeamManagementProps) {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<"MEMBERS" | "SETTINGS">("MEMBERS");

    // Search State
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, startSearch] = useTransition();

    // Invite Role State
    const [inviteRole, setInviteRole] = useState<"DOCTOR" | "ADMIN">("DOCTOR");

    // Debounce search (inline implementation instead of hook for simplicity if hook missing)
    useEffect(() => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            startSearch(async () => {
                const results = await searchUsers(query);
                setSearchResults(results);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // ... invite handler (same) ...
    const handleInvite = async (userId: string) => {
        // ... same implementation ...
        setMessage("");
        setIsError(false);

        startTransition(async () => {
            const result = await inviteUser(userId, inviteRole, workspaceId); // Pass workspaceId if needed by inviteUser
            if (result.success) {
                setMessage(result.message || "Invitation sent.");
                setQuery("");
                setSearchResults([]);
                // location.reload(); no reload, just message
            } else {
                setIsError(true);
                setMessage(result.message || "Failed to invite.");
            }
        });
    };

    // ... remove handler (same) ...
    const handleRemove = (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        startTransition(async () => {
            const result = await removeWorkspaceMember(workspaceId, userId);
            if (result.success) {
                setMembers(prev => prev.filter(m => m.userId !== userId));
                setMessage("Member removed.");
                setIsError(false);
            } else {
                setMessage(result.message || "Failed.");
                setIsError(true);
            }
        });
    };

    return (
        <div className="space-y-6">
            <>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Team Members</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {members.map((member) => (
                            <div key={member.userId} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                        member.role === "OWNER" ? "bg-slate-900" :
                                            member.role === "ADMIN" ? "bg-purple-600" : "bg-blue-600"
                                    )}>
                                        {member.name ? member.name[0].toUpperCase() : "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name || "Unknown"}</p>
                                        <p className="text-xs text-slate-500">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        {member.role === "OWNER" && <Shield className="w-4 h-4 text-slate-500" />}
                                        {member.role === "ADMIN" && <Shield className="w-4 h-4 text-purple-500" />}
                                        {member.role === "DOCTOR" && <Stethoscope className="w-4 h-4 text-blue-500" />}
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{member.role}</span>
                                    </div>

                                    {/* Only OWNER and ADMIN can remove members */}
                                    {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") &&
                                        member.email !== currentUserEmail &&
                                        member.role !== "OWNER" && (
                                            <button
                                                onClick={() => handleRemove(member.userId)}
                                                disabled={isPending}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Only show Add Team Member for OWNER and ADMIN */}
                {/* Only show Add Team Member for OWNER and ADMIN */}
                {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            Invite Team Member
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="email"
                                        value={query} // Reusing query state for email input
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Enter email address..."
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                    />
                                </div>

                                <button
                                    onClick={() => handleInvite(query)}
                                    disabled={isPending || !query.includes("@")}
                                    className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <span>Invite</span>}
                                </button>
                            </div>

                            {/* Invite Role Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Role:</span>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setInviteRole("DOCTOR")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                                            inviteRole === "DOCTOR"
                                                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        <Stethoscope size={14} />
                                        Doctor
                                    </button>
                                    <button
                                        onClick={() => setInviteRole("ADMIN")}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2",
                                            inviteRole === "ADMIN"
                                                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        <Shield size={14} />
                                        Admin
                                    </button>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={cn("mt-4 p-3 rounded-lg text-sm", isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                {message}
                            </div>
                        )}
                    </div>
                )}

            </>
        </div>
    );
}
