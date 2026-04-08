"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function NoWorkspaceState({
    globalRole,
}: {
    globalRole: "ADMIN" | "RADIOLOGIST";
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                <Building2 className="w-10 h-10 text-neutral-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
                No Active Workspace
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-8 leading-relaxed">
                {globalRole === "ADMIN"
                    ? "Create a workspace to start managing patients, cases, and your team."
                    : "Join or request access to a workspace to start reviewing cases."}
            </p>
            <Link
                href="/dashboard/workspaces"
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
                {globalRole === "ADMIN" ? "Create Workspace" : "Browse Workspaces"}
            </Link>
        </motion.div>
    );
}