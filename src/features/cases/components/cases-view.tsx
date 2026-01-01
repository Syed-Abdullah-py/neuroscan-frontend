"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export function CasesView({ workspaceId }: { workspaceId: string }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Case Management</h1>
                    <p className="text-slate-500 mt-1">Manage diagnostic cases and assignments.</p>
                </div>
                <Link
                    href="/admin/cases/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} />
                    Register New Case
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">All Cases</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    A comprehensive list of all cases across the workspace will be displayed here.
                    (Feature currently in development: Admin Case List)
                </p>
            </div>
        </div>
    );
}
