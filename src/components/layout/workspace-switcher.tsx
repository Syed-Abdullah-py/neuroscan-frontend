"use client";

import { Check, ChevronsUpDown, Plus, Building2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition, useRef, useEffect } from "react";
import { switchWorkspace } from "@/actions/auth-actions";
import { useRouter } from "next/navigation";

interface WorkspaceSwitcherProps {
    className?: string;
    items: {
        id: string;
        name: string;
        slug: string;
        role: string;
        active: boolean;
    }[];
}

export default function WorkspaceSwitcher({
    className,
    items = [],
    userRole
}: WorkspaceSwitcherProps & { userRole?: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeWorkspace = items.find((item) => item.active) || items[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onSelectWorkspace = (workspaceId: string) => {
        startTransition(async () => {
            setOpen(false);
            const res = await switchWorkspace(workspaceId);
            if (res.success) {
                window.location.reload();
            }
        });
    };

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between h-14 px-3 border border-neutral-300 dark:border-slate-600/50 bg-white dark:bg-slate-800/50 hover:bg-neutral-50 dark:hover:bg-slate-700/50 rounded-xl transition-all outline-none focus:ring-2 focus:ring-neutral-400/30 dark:focus:ring-slate-500/30"
            >
                <div className="flex items-center gap-3 text-left min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-slate-700 flex items-center justify-center text-black dark:text-white shrink-0">
                        <span className="font-bold text-sm">
                            {activeWorkspace?.name?.charAt(0).toUpperCase() || <Brain className="w-4 h-4" strokeWidth={2} />}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-black dark:text-white truncate">
                            {activeWorkspace?.name || "Explore Workspaces"}
                        </span>
                        <span className="text-[10px] text-neutral-600 dark:text-slate-400 capitalize bg-neutral-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md inline-flex w-fit">
                            {activeWorkspace?.role?.toLowerCase() || "Welcome to NeuroScan"}
                        </span>
                    </div>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-neutral-400 dark:text-slate-400" strokeWidth={2} />
            </button>

            {open && (
                <div className="absolute top-full left-0 w-full mt-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-neutral-300 dark:border-slate-600/50 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-xs font-bold text-neutral-500 dark:text-slate-500 uppercase tracking-wider">
                        Workspaces
                    </div>
                    {items.map((workspace) => (
                        <button
                            key={workspace.id}
                            onClick={() => onSelectWorkspace(workspace.id)}
                            className="w-full flex items-center px-2 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700/50 transition-colors text-left group"
                        >
                            <div className="mr-3 w-6 h-6 rounded-md bg-neutral-100 dark:bg-slate-700/50 border border-neutral-300 dark:border-slate-600/50 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-slate-300">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate text-neutral-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white">
                                {workspace.name}
                            </span>
                            {activeWorkspace?.id === workspace.id && (
                                <Check className="ml-auto h-4 w-4 text-black dark:text-white" strokeWidth={2} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}