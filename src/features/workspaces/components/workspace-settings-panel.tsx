"use client";

import { useState, useTransition } from "react";
import { Save, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    updateWorkspaceAction,
    deleteWorkspaceAction,
} from "@/features/workspaces/actions/workspace.actions";
import { useRouter } from "next/navigation";

interface WorkspaceSettingsPanelProps {
    workspaceId: string;
    currentName: string;
    isOwner: boolean;
}

export function WorkspaceSettingsPanel({
    workspaceId,
    currentName,
    isOwner,
}: WorkspaceSettingsPanelProps) {
    const [name, setName] = useState(currentName);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleUpdate = () => {
        if (!name.trim() || name === currentName) return;
        startTransition(async () => {
            const res = await updateWorkspaceAction(workspaceId, name);
            setMsg({ text: res.message, ok: res.success });
            if (res.success) router.refresh();
        });
    };

    const handleDelete = () => {
        const confirmed = window.prompt(
            `Type DELETE to permanently remove this workspace and all its data.`
        );
        if (confirmed !== "DELETE") return;

        startTransition(async () => {
            const res = await deleteWorkspaceAction(workspaceId);
            if (res.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setMsg({ text: res.message, ok: false });
            }
        });
    };

    return (
        <div className="space-y-8">
            {msg && (
                <div
                    className={cn(
                        "p-3 rounded-xl text-sm font-medium",
                        msg.ok
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}
                >
                    {msg.text}
                </div>
            )}

            {/* Rename */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/20 space-y-4">
                <h4 className="text-sm font-bold text-black dark:text-white">
                    Workspace Name
                </h4>
                <div className="flex gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                    <button
                        onClick={handleUpdate}
                        disabled={isPending || !name.trim() || name === currentName}
                        className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save
                    </button>
                </div>
            </div>

            {/* Danger zone — owner only */}
            {isOwner && (
                <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 space-y-4">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <h4 className="text-sm font-bold">Danger Zone</h4>
                    </div>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 leading-relaxed">
                        Permanently deletes this workspace, all patients, cases, and
                        member data. This cannot be undone.
                    </p>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Delete Workspace
                    </button>
                </div>
            )}
        </div>
    );
}