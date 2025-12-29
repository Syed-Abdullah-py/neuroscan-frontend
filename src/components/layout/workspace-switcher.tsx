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
                className="w-full flex items-center justify-between h-14 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <div className="flex items-center gap-3 text-left min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-600/20">
                        <span className="font-bold text-sm">
                            {activeWorkspace?.name?.charAt(0).toUpperCase() || <Brain className="w-4 h-4" />}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {activeWorkspace?.name || "Explore Workspaces"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md inline-flex w-fit">
                            {activeWorkspace?.role?.toLowerCase() || "Welcome to NeuroScan"}
                        </span>
                    </div>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute top-full left-0 w-full mt-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Workspaces
                    </div>
                    {items.map((workspace) => (
                        <button
                            key={workspace.id}
                            onClick={() => onSelectWorkspace(workspace.id)}
                            className="w-full flex items-center px-2 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                        >
                            <div className="mr-3 w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                                {workspace.name}
                            </span>
                            {activeWorkspace?.id === workspace.id && (
                                <Check className="ml-auto h-4 w-4 text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
