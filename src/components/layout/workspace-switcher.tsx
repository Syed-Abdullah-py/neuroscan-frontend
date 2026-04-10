"use client";

import { Check, ChevronsUpDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/providers/workspace-provider";

interface WorkspaceItem {
    id: string;
    name: string;
    slug: string;
    role: string;
    active: boolean;
}

interface WorkspaceSwitcherProps {
    className?: string;
    items?: WorkspaceItem[];
    userRole?: string;
}

export default function WorkspaceSwitcher({
    className,
    items = [],
    userRole,
}: WorkspaceSwitcherProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { switchWorkspace, isSwitching, activeWorkspaceId } = useWorkspace();

    const activeWorkspace =
        items.find((item) => item.id === activeWorkspaceId) ??
        items.find((item) => item.active) ??
        items[0];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between h-14 px-3 border border-neutral-300 dark:border-slate-600/50 bg-white dark:bg-slate-800/50 hover:bg-neutral-50 dark:hover:bg-slate-700/50 rounded-xl transition-all outline-none focus:ring-2 focus:ring-neutral-400/30"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm text-black dark:text-white">
                            {activeWorkspace?.name?.charAt(0).toUpperCase() ?? (
                                <Brain className="w-4 h-4" strokeWidth={2} />
                            )}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                        <span className="text-sm font-bold text-black dark:text-white truncate">
                            {activeWorkspace?.name ?? "Select workspace"}
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-slate-400 capitalize bg-neutral-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md w-fit">
                            {activeWorkspace?.role?.toLowerCase() ?? "no workspace"}
                        </span>
                    </div>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-neutral-400" />
            </button>

            {open && (
                <div className="absolute top-full left-0 w-full mt-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600/50 shadow-xl z-50">
                    <div className="px-2 py-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Workspaces
                    </div>
                    {items.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-neutral-400">
                            No workspaces
                        </div>
                    ) : (
                        items.map((workspace) => (
                            <button
                                key={workspace.id}
                                onClick={() => {
                                    switchWorkspace(workspace.id);
                                    setOpen(false);
                                }}
                                disabled={isSwitching}
                                className="w-full flex items-center px-2 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700/50 transition-colors text-left group"
                            >
                                <div className="mr-3 w-6 h-6 rounded-md bg-neutral-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-slate-300">
                                    {workspace.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="flex-1 truncate text-neutral-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white">
                                    {workspace.name}
                                </span>
                                {(workspace.id === activeWorkspaceId ||
                                    (workspace.active && !activeWorkspaceId)) && (
                                        <Check className="ml-auto h-4 w-4 text-black dark:text-white" />
                                    )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}