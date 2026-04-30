"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
    Users, FileText, Activity, UserPlus,
    Clock, CheckCircle2,
    Search, ArrowUpRight,
    Loader2,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaseStats, useRecentCases } from "@/features/cases/hooks/use-cases";
import { usePatients } from "@/features/patients/hooks/use-patients";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceRole } from "@/lib/types/workspace.types";
import type { CaseStats } from "@/lib/types/case.types";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

interface AdminDashboardProps {
    user: {
        name: string;
        email: string;
        globalRole: string;
        workspaceId?: string;
    };
    workspaceId: string;
    workspaceRole: WorkspaceRole;
    initialStats: CaseStats | null;
    initialRecentCases: any[];
    initialMembers: any[];
    initialPatients: any[];
}

function StatCard({
    title, value, icon: Icon, color, trend,
}: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: "blue" | "green" | "amber" | "red";
    trend?: string;
}) {
    const colors = {
        blue: "text-blue-600  dark:text-blue-400  bg-blue-50  dark:bg-blue-900/20",
        green: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
        red: "text-red-600   dark:text-red-400   bg-red-50   dark:bg-red-900/20",
    };
    return (
        <motion.div
            variants={item}
            className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-neutral-200 dark:border-slate-700/50 hover:border-neutral-300 dark:hover:border-slate-600 transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl", colors[color])}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-1">
                    {value}
                </h3>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {title}
                </p>
            </div>
        </motion.div>
    );
}

export function AdminDashboard({
    user,
    workspaceId,
    initialStats,
    initialRecentCases,
    initialMembers,
    initialPatients,
}: AdminDashboardProps) {
    const [search, setSearch] = useState("");

    // Seed React Query cache with server data so isLoading is false on first render.
    const { data: stats } = useCaseStats(initialStats);
    const { data: recentCases = [] } = useRecentCases(initialRecentCases);
    const { data: patients = [], isLoading: patientsLoading } = usePatients(initialPatients);

    const displayStats = stats ?? initialStats;
    const memberCount = initialMembers.length;

    const filteredPatients = patients.filter((p: any) => {
        const q = search.toLowerCase();
        return (
            p.first_name?.toLowerCase().includes(q) ||
            p.last_name?.toLowerCase().includes(q) ||
            p.mrn?.toLowerCase().includes(q) ||
            p.phone_number?.includes(q)
        );
    });

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
                        Admin Portal
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Welcome back,{" "}
                        <span className="text-black dark:text-white font-medium">
                            {user.name}
                        </span>
                        . System status is{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Operational
                        </span>
                        .
                    </p>
                </div>
                <div className="text-xs font-semibold text-neutral-500 bg-white dark:bg-gray-900/50 border border-neutral-200 dark:border-slate-700/50 px-3 py-1.5 rounded-lg">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
                variants={container}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
                <StatCard
                    title="Team Members"
                    value={memberCount}
                    icon={Users}
                    color="blue"
                    trend="Workspace"
                />
                <StatCard
                    title="Total Cases"
                    value={displayStats?.total ?? "-"}
                    icon={FileText}
                    color="green"
                    trend="All time"
                />
                <StatCard
                    title="Pending Review"
                    value={displayStats?.pending ?? "-"}
                    icon={Clock}
                    color="amber"
                    trend="Action needed"
                />
                <StatCard
                    title="Reviewed"
                    value={displayStats?.reviewed ?? "-"}
                    icon={CheckCircle2}
                    color="green"
                    trend="Complete"
                />
            </motion.div>

            {/* Patient table */}
            <motion.div variants={item} className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black dark:bg-white rounded-lg">
                            <Users className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <h2 className="text-lg font-bold text-black dark:text-white">
                            Patient Records
                        </h2>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search patients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                            />
                        </div>
                        <Link
                            href="/patients/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-all"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Add Patient
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                                {["Patient", "Phone", "Gender", "City", "Action"].map((h) => (
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
                            {patientsLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-lg" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5"><Skeleton className="h-4 w-24" /></td>
                                        <td className="py-3.5 px-5"><Skeleton className="h-4 w-16" /></td>
                                        <td className="py-3.5 px-5"><Skeleton className="h-4 w-20" /></td>
                                        <td className="py-3.5 px-5"><Skeleton className="h-6 w-14 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <Users className="w-8 h-8 text-neutral-400" />
                                            <p className="text-sm font-medium text-neutral-500">
                                                No patients yet
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-sm text-neutral-400">
                                        No results for &quot;{search}&quot;
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.slice(0, 10).map((p: any) => (
                                    <tr
                                        key={p.id}
                                        className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                                                    {p.first_name?.[0]}
                                                    {p.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-black dark:text-white">
                                                        {p.first_name} {p.last_name}
                                                    </p>
                                                    {p.mrn && (
                                                        <p className="text-[10px] text-neutral-400 font-mono">
                                                            {p.mrn}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-neutral-600 dark:text-neutral-400">
                                            {p.phone_number}
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-neutral-600 dark:text-neutral-400">
                                            {p.gender}
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-neutral-600 dark:text-neutral-400">
                                            {p.city || "-"}
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <Link
                                                href={`/patients`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 text-xs font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
                                            >
                                                View
                                                <ArrowUpRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {filteredPatients.length > 10 && (
                        <div className="px-5 py-3 border-t border-neutral-100 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/30">
                            <Link
                                href="/patients"
                                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                            >
                                View all {filteredPatients.length} patients →
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Recent cases */}
            <motion.div variants={item} className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neutral-400" />
                        <h2 className="text-lg font-bold text-black dark:text-white">
                            Recent Cases
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
                                {["Patient", "Priority", "Status", "Created", ""].map((h) => (
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
                                            <FileText className="w-8 h-8 text-neutral-400" />
                                            <p className="text-sm font-medium text-neutral-500">
                                                No cases yet
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentCases.map((c: any) => (
                                    <CaseRow key={c.id} caseItem={c} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

function CaseRow({ caseItem: c }: { caseItem: any }) {
    const router = useRouter();
    const [isOpening, setIsOpening] = useState(false);
    const priorityColors: Record<string, string> = {
        urgent: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30",
        high: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30",
        normal: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30",
        low: "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700",
    };
    const statusColors: Record<string, string> = {
        PENDING: "text-amber-600 dark:text-amber-400",
        PROCESSING: "text-blue-600 dark:text-blue-400",
        REVIEWED: "text-emerald-600 dark:text-emerald-400",
    };
    const priority = (c.priority || "normal").toLowerCase();
    const status = c.status || "PENDING";

    return (
        <tr className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="py-3.5 px-5">
                <p className="text-sm font-bold text-black dark:text-white">
                    {c.patient_first_name ?? "-"} {c.patient_last_name ?? ""}
                </p>
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
                <span className={cn("text-xs font-bold", statusColors[status] ?? statusColors.PENDING)}>
                    {status}
                </span>
            </td>
            <td className="py-3.5 px-5 text-xs text-neutral-500">
                {new Date(c.created_at).toLocaleDateString("en-GB")}
            </td>
            <td className="py-3.5 px-5 text-right">
                <button
                    onClick={() => {
                        setIsOpening(true);
                        router.push(`/cases/${c.id}`);
                    }}
                    disabled={isOpening}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 text-xs font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
                >
                    {isOpening ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <ArrowUpRight className="w-3 h-3" />
                    )}
                    Open
                </button>
            </td>
        </tr>
    );
}