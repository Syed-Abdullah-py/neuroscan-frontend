"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import { leaveWorkspace, requestJoinWorkspaceFromForm, createWorkspaceFromForm, getDiscoverableWorkspaces, switchWorkspace } from "@/actions/auth-actions";
import { Loader2, LogOut, Plus, Search, Building2, UserPlus, CheckCircle2, AlertCircle, ArrowLeft, ChevronRight, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WorkspaceManagerProps {
    currentWorkspaceId?: string;
    workspaces: any[]; // User's memberships
    userGlobalRole?: string; // "ADMIN", "OWNER", "DOCTOR", etc.
}

const initialState = {
    message: "",
    success: false
};

type Mode = "LIST" | "JOIN" | "CREATE";

export function WorkspaceManager({ currentWorkspaceId, workspaces, userGlobalRole }: WorkspaceManagerProps) {
    const [mode, setMode] = useState<Mode>("LIST");
    const router = useRouter();
    const [isSwitching, startSwitch] = useTransition();
    const [pendingSwitchId, setPendingSwitchId] = useState<string | null>(null);

    // -- Actions --
    const [joinState, joinAction, isJoinPending] = useActionState(requestJoinWorkspaceFromForm, initialState);
    const [createState, createAction, isCreatePending] = useActionState(createWorkspaceFromForm, initialState);

    // -- State --
    const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);

    // -- Effects --
    useEffect(() => {
        if (mode === "JOIN") {
            getDiscoverableWorkspaces().then(setAvailableWorkspaces);
        }
    }, [mode]);

    // -- Handlers --
    const handleLeave = async (workspaceId: string) => {
        if (!confirm("Are you sure you want to leave this workspace?")) return;
        const result = await leaveWorkspace(workspaceId);
        if (result.success) {
            router.refresh();
        } else {
            alert(result.message || "Failed to leave workspace");
        }
    };

    const handleSwitch = (workspaceId: string) => {
        if (workspaceId === currentWorkspaceId) return;
        setPendingSwitchId(workspaceId);

        startSwitch(async () => {
            const result = await switchWorkspace(workspaceId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.message || "Failed to switch workspace");
            }
            setPendingSwitchId(null);
        });
    };

    // -- Render Helpers --
    const Header = ({ title, showBack = true }: { title: string, showBack?: boolean }) => (
        <div className="flex items-center gap-3 mb-6">
            {showBack && (
                <button
                    onClick={() => setMode("LIST")}
                    className="p-1.5 -ml-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-all"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {title}
            </h3>
        </div>
    );

    // --- MODE: JOIN ---
    if (mode === "JOIN") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-10"
            >
                <Header title="Join Workspace" />

                <form action={joinAction} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                            Workspace ID / Slug
                        </label>
                        <div className="relative group">
                            <input
                                name="workspaceSlug"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 pl-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600"
                                placeholder="e.g. city-general"
                                required
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>

                    {joinState?.message && (
                        <div className={cn(
                            "p-3 border rounded-xl text-xs font-medium flex items-center gap-2",
                            joinState.success
                                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400"
                        )}>
                            {joinState.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {joinState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isJoinPending || joinState?.success}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-black/20"
                    >
                        {isJoinPending ? <Loader2 className="animate-spin" size={16} /> : "Send Request"}
                    </button>
                </form>

                {availableWorkspaces.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Available to Join</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {availableWorkspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => {
                                        const input = document.querySelector('input[name="workspaceSlug"]') as HTMLInputElement;
                                        if (input) input.value = ws.slug;
                                    }}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ws.name}</p>
                                        <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">{ws._count?.members || 0} members</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
                                        <Plus size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }

    // --- MODE: CREATE ---
    if (mode === "CREATE") {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 relative z-10"
            >
                <Header title="Create Workspace" />

                <form action={createAction} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                            Workspace Name
                        </label>
                        <input
                            name="workspaceName"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                            placeholder="e.g. City General Radiology"
                            required
                            minLength={3}
                        />
                    </div>

                    {createState?.message && (
                        <div className={cn(
                            "p-3 border rounded-xl text-xs font-medium flex items-center gap-2",
                            createState.success
                                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400"
                                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-800 dark:text-red-400"
                        )}>
                            {createState.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {createState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isCreatePending || createState?.success}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-black/20"
                    >
                        {isCreatePending ? <Loader2 className="animate-spin" size={16} /> : "Create Workspace"}
                    </button>
                </form>
            </motion.div>
        );
    }

    // --- MODE: LIST (Default) ---
    // Allow Admins, Owners, and Doctors to create workspaces
    const canCreate = ["ADMIN", "OWNER", "DOCTOR"].includes(userGlobalRole || "");

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 mb-4">
                {/* Join Button */}
                <button
                    onClick={() => setMode("JOIN")}
                    className="group w-full flex items-center justify-center gap-2 px-4 py-3
               bg-blue-50 dark:bg-blue-900/30
               border border-blue-200 dark:border-blue-700
               hover:border-blue-400 dark:hover:border-blue-500
               rounded-xl text-sm font-bold
               text-blue-700 dark:text-blue-300
               transition-all shadow-sm hover:shadow-md
               hover:text-blue-800 dark:hover:text-blue-200"
                >
                    <UserPlus
                        size={16}
                        className="text-blue-400 group-hover:text-blue-600 transition-colors"
                    />
                    <span>Join Workspace</span>
                </button>


                {/* Create Button */}
                {canCreate && (
                    <button
                        onClick={() => setMode("CREATE")}
                        className="group w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-emerald-50 dark:bg-emerald-900/30 
                   border border-emerald-200 dark:border-emerald-700 
                   hover:border-emerald-400 dark:hover:border-emerald-500 
                   rounded-xl text-sm font-bold 
                   text-emerald-700 dark:text-emerald-300 
                   transition-all shadow-sm hover:shadow-md 
                   hover:text-emerald-800 dark:hover:text-emerald-200"
                    >
                        <Plus
                            size={16}
                            className="text-emerald-400 group-hover:text-emerald-600 transition-colors"
                        />
                        <span>Create New Workspace</span>
                    </button>
                )}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {workspaces.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium">No memberships yet.</p>
                    </div>
                ) : (
                    workspaces.map((ws) => {
                        const isActive = ws.id === currentWorkspaceId;
                        const isSwitchingToThis = pendingSwitchId === ws.id;

                        return (
                            <button
                                key={ws.id}
                                disabled={isSwitchingToThis} // Allow clicking active to see details or potential leave
                                onClick={() => !isActive && handleSwitch(ws.id)}
                                className={cn(
                                    "w-full text-left relative p-4 rounded-2xl border transition-all duration-200 group overflow-hidden shrink-0", // shrink-0 important for scroll
                                    isActive
                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm cursor-default"
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer active:scale-98"
                                )}
                            >
                                {isSwitchingToThis && (
                                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 className="text-blue-600 animate-spin" />
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors",
                                            isActive
                                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                                        )}>
                                            {ws.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className={cn("text-sm font-bold transition-colors", isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white")}>
                                                {ws.name}
                                            </h4>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                                                {ws.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="absolute top-4 right-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                )}

                                {/* Allow leaving ANY workspace, including active */}
                                {ws.role !== "OWNER" && (
                                    <div
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleLeave(ws.id);
                                        }}
                                        className="absolute top-1/2 right-1 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-100 transition-all z-10 cursor-pointer"

                                    >
                                        <LogOut size={14} />
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
