"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    Brain, Clock, CheckCircle2, Activity,
    ArrowUpRight, Calendar, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaseStats, useRecentCases } from "@/features/cases/hooks/use-cases";
import type { CaseStats } from "@/lib/types/case.types";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

interface DoctorDashboardProps {
    user: { name: string; email: string };
    workspaceId: string;
    initialStats: CaseStats | null;
    initialRecentCases: any[];
}

export function DoctorDashboard({
    user,
    initialStats,
    initialRecentCases,
}: DoctorDashboardProps) {
    // Seed React Query cache with server data so isLoading is false on first render.
    const { data: stats } = useCaseStats(initialStats);
    const { data: recentCases = [] } = useRecentCases(initialRecentCases);

    const displayStats = stats ?? initialStats;
    const firstName = user.name.split(" ")[0];

    const priorityColors: Record<string, string> = {
        urgent: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30",
        high: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30",
        normal: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30",
        low: "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700",
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Welcome back,{" "}
                        <span className="text-black dark:text-white font-medium">
                            Dr. {firstName}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 bg-white dark:bg-gray-900/50 border border-neutral-200 dark:border-slate-700/50 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    {
                        title: "Assigned Cases",
                        value: displayStats?.total ?? "—",
                        icon: Brain,
                        color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                        trend: "Active",
                    },
                    {
                        title: "Pending Review",
                        value: displayStats?.pending ?? "—",
                        icon: Clock,
                        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
                        trend: "Action needed",
                    },
                    {
                        title: "Reviewed",
                        value: displayStats?.reviewed ?? "—",
                        icon: CheckCircle2,
                        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                        trend: "Complete",
                    },
                ].map((s) => (
                    <motion.div
                        key={s.title}
                        variants={item}
                        className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-neutral-200 dark:border-slate-700/50 hover:border-neutral-300 dark:hover:border-slate-600 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2.5 rounded-xl", s.color)}>
                                <s.icon className="w-5 h-5" strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                {s.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-1">
                                {s.value}
                            </h3>
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                {s.title}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Assigned cases table */}
            <motion.div variants={item} className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neutral-400" />
                        <h2 className="text-lg font-bold text-black dark:text-white">
                            Recent Assignments
                        </h2>
                    </div>
                    <Link
                        href="/cases"
                        className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        View all →
                    </Link>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                                {["Patient", "Priority", "Status", "Updated", ""].map((h) => (
                                    <th
                                        key={h}
                                        className="py-3 px-5 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                            {recentCases.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Brain className="w-8 h-8 text-neutral-400" />
                                            <p className="text-sm font-medium text-neutral-500">
                                                No cases assigned yet
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentCases.map((c: any) => {
                                    const priority = (c.priority || "normal").toLowerCase();
                                    return (
                                        <tr
                                            key={c.id}
                                            className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-neutral-500">
                                                        {c.patient_first_name?.[0]}
                                                        {c.patient_last_name?.[0]}
                                                    </div>
                                                    <p className="text-sm font-bold text-black dark:text-white">
                                                        {c.patient_first_name ?? "—"}{" "}
                                                        {c.patient_last_name ?? ""}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                                        priorityColors[priority] ?? priorityColors.normal
                                                    )}
                                                >
                                                    {priority}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    {c.status === "PENDING" && (
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                                        </span>
                                                    )}
                                                    {c.status === "REVIEWED" && (
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    )}
                                                    {c.status === "PROCESSING" && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                    )}
                                                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-xs text-neutral-500">
                                                {new Date(c.updated_at).toLocaleDateString("en-GB")}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <Link
                                                    href={`/cases/${c.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 text-xs font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
                                                >
                                                    Open
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}