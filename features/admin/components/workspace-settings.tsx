"use client";

import { useState, useTransition } from "react";
import { updateWorkspace, deleteWorkspace } from "@/actions/auth-actions";
import { Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function WorkspaceSettings({ workspaceId, currentName }: { workspaceId: string, currentName: string }) {
    const [name, setName] = useState(currentName);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleUpdate = () => {
        startTransition(async () => {
            const res = await updateWorkspace(workspaceId, name);
            if (res.success) {
                setMessage("Workspace name updated.");
                router.refresh();
            } else {
                setMessage(res.message || "Failed to update.");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Are you sure? This cannot be undone and will delete all data.")) return;

        // Final confirmation
        const input = prompt("Type 'DELETE' to confirm:");
        if (input !== 'DELETE') return;

        startTransition(async () => {
            const res = await deleteWorkspace(workspaceId);
            if (res.success) {
                window.location.href = '/onboarding'; // Redirect to onboarding
            } else {
                setMessage(res.message || "Failed to delete.");
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">General Settings</h3>

                <div className="max-w-md space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Workspace Name</label>
                        <div className="flex gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <button
                                onClick={handleUpdate}
                                disabled={isPending || name === currentName}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 p-6">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-6">
                    Deleting the workspace will permanently remove all patients, cases, and data. This action cannot be undone.
                </p>

                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete Workspace
                </button>
            </div>

            {message && (
                <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm shadow-xl animate-in slide-in-from-bottom-4">
                    {message}
                </div>
            )}
        </div>
    );
}
