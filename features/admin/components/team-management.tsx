"use client";

import { useState, useTransition, useEffect } from "react";
import { addTeamMember, removeTeamMember, searchUsers, inviteUser } from "@/actions/auth-actions";
import { Loader2, Trash2, Shield, Stethoscope, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming we might need this, or implement inline

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
}

export function TeamManagement({ initialMembers, currentUserEmail }: TeamManagementProps) {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Search State
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, startSearch] = useTransition();

    // Debounce search
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

    const handleInvite = async (userId: string) => {
        setMessage("");
        setIsError(false);

        startTransition(async () => {
            const result = await inviteUser(userId);
            if (result.success) {
                setMessage(result.message || "Member added.");
                // Clear search
                setQuery("");
                setSearchResults([]);
                // Reload for MVP
                location.reload();
            } else {
                setIsError(true);
                setMessage(result.message || "Failed to add member.");
            }
        });
    };

    const handleRemove = (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        startTransition(async () => {
            const result = await removeTeamMember(userId);
            if (result.success) {
                setMembers(prev => prev.filter(m => m.userId !== userId));
                setMessage("Member removed.");
                setIsError(false);
            } else {
                setMessage(result.message || "Failed to remove member.");
                setIsError(true);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Add Team Member
                </h2>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>

                {/* Search Results Dropdown/List */}
                {searchResults.length > 0 && (
                    <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-state-900 shadow-lg">
                        {searchResults.map((user) => (
                            <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">
                                        {user.role || "Doctor"}
                                    </span>
                                    <button
                                        onClick={() => handleInvite(user.id)}
                                        disabled={isPending}
                                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {query.length > 2 && searchResults.length === 0 && !isSearching && (
                    <div className="mt-2 text-sm text-slate-500 italic p-2">
                        No matching users found.
                    </div>
                )}

                {message && (
                    <div className={cn("mt-4 p-3 rounded-lg text-sm", isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                        {message}
                    </div>
                )}
            </div>

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

                                {member.email !== currentUserEmail && member.role !== "OWNER" && (
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

                    {members.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">No members found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
