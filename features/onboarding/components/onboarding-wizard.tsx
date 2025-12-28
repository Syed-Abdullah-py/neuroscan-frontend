"use client";

import { useActionState, useState, useEffect } from "react";
import { createWorkspace, requestJoinWorkspace, getDiscoverableWorkspaces } from "@/actions/auth-actions";
import { Loader2, Plus, Search, Building2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { InvitationsList } from "@/features/onboarding/components/invitations-list";

// ... props type
interface ActionState {
    message?: string;
    success?: boolean;
}

const initialState: ActionState = {
    message: "",
};

interface OnboardingWizardProps {
    userRole?: string;
    invitations?: any[];
}

import { useSearchParams } from "next/navigation";

// ... props
export function OnboardingWizard({ userRole, invitations = [] }: OnboardingWizardProps) {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get("mode") === "create" ? "CREATE" :
        searchParams.get("mode") === "join" ? "JOIN" : "SELECT";

    // Only allow CREATE if admin
    const safeMode = (initialMode === "CREATE" && userRole !== "ADMIN" && userRole !== "OWNER") ? "SELECT" : initialMode;

    const [mode, setMode] = useState<"SELECT" | "CREATE" | "JOIN">(safeMode);
    // Create Workspace State
    const [createState, createAction, isCreatePending] = useActionState(createWorkspace, initialState);

    // Join Workspace State
    const [joinState, joinAction, isJoinPending] = useActionState(requestJoinWorkspace, initialState);

    if (mode === "SELECT") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-3">
                        Welcome to NeuroScan
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        You're almost there! To get started, you need to be part of a workspace.
                    </p>
                </motion.div>

                {/* Show Invitations if any */}
                {invitations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <InvitationsList invitations={invitations} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userRole === "ADMIN" && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setMode("CREATE")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-blue-500/10"
                        >
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <Building2 size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create a Workspace</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Start a new organization. You will be the Owner and can invite your team members.
                            </p>
                        </motion.button>
                    )}

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => setMode("JOIN")}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-purple-500/10"
                    >
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <UserPlus size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join a Workspace</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Find your team's existing workspace and request access to join them.
                        </p>
                    </motion.button>
                </div>
            </div>
        );
    }

    if (mode === "CREATE") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto py-12 px-4"
            >
                <button
                    onClick={() => setMode("SELECT")}
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 flex items-center gap-1 transition-colors"
                >
                    &larr; Back
                </button>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Workspace</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Give your new workspace a name.
                </p>

                <form action={createAction} className="space-y-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block">
                            Workspace Name
                        </label>
                        <input
                            name="workspaceName"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            placeholder="e.g. City General Radiology"
                            required
                            minLength={3}
                        />
                    </div>

                    {createState?.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm"
                        >
                            {createState.message}
                        </motion.div>
                    )}

                    {createState?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} />
                            Workspace created! Redirecting...
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isCreatePending || createState?.success}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                    >
                        {isCreatePending ? <Loader2 className="animate-spin" /> : "Create Workspace"}
                    </motion.button>
                </form>
            </motion.div>
        );
    }

    // Workspaces State
    const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);

    useEffect(() => {
        if (mode === "JOIN") {
            getDiscoverableWorkspaces().then(setAvailableWorkspaces);
        }
    }, [mode]);

    if (mode === "JOIN") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto py-12 px-4"
            >
                <button
                    onClick={() => setMode("SELECT")}
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 flex items-center gap-1 transition-colors"
                >
                    &larr; Back
                </button>

                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Join Workspace</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Select a workspace to join or enter an identifier manually.
                </p>

                <form action={joinAction} className="space-y-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block">
                            Workspace Identifier
                        </label>
                        <div className="relative">
                            <input
                                name="workspaceSlug"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 pl-11 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                placeholder="city-general-radiology"
                                required
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>

                    {joinState?.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-3 border rounded-lg text-sm flex items-center gap-2",
                                joinState.success
                                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                            )}>
                            {joinState.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {joinState.message}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isJoinPending || joinState?.success}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 rounded-xl font-semibold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2"
                    >
                        {isJoinPending ? <Loader2 className="animate-spin" /> : "Send Join Request"}
                    </motion.button>
                </form>

                {availableWorkspaces.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800"
                    >
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Available Workspaces</h3>
                        <div className="space-y-3">
                            {availableWorkspaces.map((ws) => (
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    key={ws.id}
                                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all group shadow-sm hover:shadow"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">{ws.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{ws._count.members} members</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const input = document.querySelector('input[name="workspaceSlug"]') as HTMLInputElement;
                                                if (input) input.value = ws.slug;
                                            }}
                                            className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Select
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        );
    }

    return null;
}
