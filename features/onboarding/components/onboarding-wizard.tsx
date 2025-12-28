"use client";

import { useActionState, useState, useEffect } from "react";
import { createWorkspace, requestJoinWorkspace } from "@/actions/auth-actions";
import { Loader2, Plus, Search, Building2, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ActionState {
    message?: string;
    success?: boolean;
}

const initialState: ActionState = {
    message: "",
};

export function OnboardingWizard() {
    const [mode, setMode] = useState<"SELECT" | "CREATE" | "JOIN">("SELECT");
    const router = useRouter();

    // Create Workspace State
    const [createState, createAction, isCreatePending] = useActionState(createWorkspace, initialState);

    // Join Workspace State
    const [joinState, joinAction, isJoinPending] = useActionState(requestJoinWorkspace, initialState);

    // Handle Create Success Redirect
    useEffect(() => {
        if (createState?.success) {
            router.push('/admin');
            // Or force reload to update session? The cookie is set server side, so push should work if middleware respects it.
            // Usually hard reload is safer for auth state changes if client cache is stale.
            // router.refresh();
            window.location.href = '/admin';
        }
    }, [createState, router]);

    if (mode === "SELECT") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Welcome to NeuroScan</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        You're almost there! To get started, you need to be part of a workspace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setMode("CREATE")}
                        className="group relative p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-blue-500/10"
                    >
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <Building2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create a Workspace</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Start a new organization. You will be the Owner and can invite your team members.
                        </p>
                    </button>

                    <button
                        onClick={() => setMode("JOIN")}
                        className="group relative p-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-purple-500/10"
                    >
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <UserPlus size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join a Workspace</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Find your team's existing workspace and request access to join them.
                        </p>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === "CREATE") {
        return (
            <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={() => setMode("SELECT")}
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 flex items-center gap-1"
                >
                    &larr; Back
                </button>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Workspace</h2>
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
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {createState.message}
                        </div>
                    )}

                    {/* Success handled by redirect in action? No, we might want to show success here if action only returns JSON. 
                        The action in auth-actions redirects on success usually, but let's check.
                        The createWorkspace checks cookie and returns JSON success: true.
                        Wait, createWorkspace action I wrote DOES NOT redirect. It sets cookie and returns {success: true}.
                        So we need to handle redirect here or reload.
                    */}
                    {createState?.success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Workspace created! Redirecting...
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isCreatePending || createState?.success}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                    >
                        {isCreatePending ? <Loader2 className="animate-spin" /> : "Create Workspace"}
                    </button>
                </form>
            </div>
        );
    }

    if (mode === "JOIN") {
        return (
            <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={() => setMode("SELECT")}
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 flex items-center gap-1"
                >
                    &larr; Back
                </button>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Join Workspace</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Enter the slug or name of the workspace you wish to join.
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
                        <div className={cn(
                            "p-3 border rounded-lg text-sm flex items-center gap-2",
                            joinState.success
                                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                        )}>
                            {joinState.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {joinState.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isJoinPending || joinState?.success}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 rounded-xl font-semibold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2"
                    >
                        {isJoinPending ? <Loader2 className="animate-spin" /> : "Send Join Request"}
                    </button>
                </form>
            </div>
        );
    }

    return null;
}
