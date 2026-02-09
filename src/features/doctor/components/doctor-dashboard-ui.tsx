"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Activity, Clock, CheckCircle2, Building2,
    Brain, ChevronDown,
    ArrowUpRight, Calendar, Filter, AlertCircle, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// --- TYPES ---
interface DoctorDashboardUIProps {
    stats: {
        totalCases: number;
        pendingCases: number;
        completedCases: number;
    } | null;
    recentCases: any[];
    user: {
        name: string;
        email: string;
        role: string;
        globalRole: string | null;
        workspaceId?: string;
    };
    workspaces: any[];
}

// --- ANIMATION ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 20 }
    }
};

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
    const colorStyles: Record<string, string> = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
    };

    return (
        <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-neutral-200 dark:border-slate-700/50 hover:border-neutral-300 dark:hover:border-slate-600 transition-all duration-200"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl", colorStyles[color])}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-1">{value}</h3>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{title}</p>
            </div>
        </motion.div>
    );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const p = (priority || 'normal').toLowerCase();
    const styles: Record<string, string> = {
        critical: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30",
        urgent: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/30",
        high: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30",
        normal: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30",
        low: "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-gray-800 border-neutral-200 dark:border-gray-700",
    };

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", styles[p] || styles.normal)}>
            {p === 'critical' && <AlertCircle className="w-3 h-3" />}
            {p}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === "PENDING") {
        return (
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">In Review</span>
            </div>
        )
    }
    if (status === "COMPLETED") {
        return (
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Finalized</span>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 capitalize">{status.toLowerCase()}</span>
        </div>
    )
};

// --- MAIN PAGE ---

export function DoctorDashboardUI({ stats, recentCases, user, workspaces }: DoctorDashboardUIProps) {
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterPriority, setFilterPriority] = useState("ALL");

    const filteredCases = recentCases.filter(c => {
        if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
        if (filterPriority !== "ALL" && (c.priority || 'normal') !== filterPriority) return false;
        return true;
    }).sort((a, b) => {
        const priorityOrder: Record<string, number> = { 'critical': 4, 'urgent': 3, 'high': 3, 'normal': 2, 'low': 1 };
        return (priorityOrder[(b.priority || 'normal').toLowerCase()] || 0) - (priorityOrder[(a.priority || 'normal').toLowerCase()] || 0);
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-transparent text-black dark:text-white"
        >
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
                            Dashboard
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
                            Welcome back, <span className="text-black dark:text-white font-medium">Dr. {user.name.split(' ')[0]}</span>
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/50 text-xs font-semibold text-neutral-600 dark:text-neutral-300 shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </motion.div>
                </div>

                {!user.workspaceId ? (
                    // Empty State
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-gray-900/30 border border-neutral-200 dark:border-slate-700/50 text-center min-h-[400px]"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                            <Building2 className="w-8 h-8 text-neutral-400" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No Active Workspace</h2>
                        <p className="text-neutral-500 max-w-sm mb-8 text-sm leading-relaxed">
                            You aren't assigned to any medical facility yet. Join a workspace to start your diagnostics.
                        </p>
                        <Link href="/doctor/workspaces" className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                            Browse Workspaces
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* 2. Stats Grid */}
                        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Assigned Cases"
                                value={stats?.totalCases || 0}
                                icon={Brain}
                                color="blue"
                                trend="Active"
                            />
                            <StatCard
                                title="Pending Review"
                                value={stats?.pendingCases || 0}
                                icon={Clock}
                                color="amber"
                                trend="Action Required"
                            />
                            <StatCard
                                title="Completed"
                                value={stats?.completedCases || 0}
                                icon={CheckCircle2}
                                color="emerald"
                                trend="This Week"
                            />
                        </motion.div>

                        {/* 3. Main Data Table Section */}
                        <motion.div variants={itemVariants} className="space-y-4 pt-2">

                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-neutral-400" />
                                    <h2 className="text-lg font-bold">Recent Assignments</h2>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {/* Tab Filter */}
                                    <div className="flex p-1 rounded-lg bg-neutral-100 dark:bg-gray-900 border border-neutral-200 dark:border-slate-700/50">
                                        {["ALL", "PENDING", "COMPLETED"].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setFilterStatus(status)}
                                                className={cn(
                                                    "px-3 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-wide",
                                                    filterStatus === status
                                                        ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm"
                                                        : "text-neutral-500 hover:text-black dark:hover:text-white"
                                                )}
                                            >
                                                {status === "ALL" ? "All" : status}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Priority Select */}
                                    <div className="relative">
                                        <select
                                            value={filterPriority}
                                            onChange={(e) => setFilterPriority(e.target.value)}
                                            className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-slate-700/50 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors cursor-pointer"
                                        >
                                            <option value="ALL">Priority: All</option>
                                            <option value="critical">Critical</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="normal">Normal</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Table Card */}
                            <div className="rounded-xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                                                <th className="py-4 px-6 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Patient Details</th>
                                                <th className="py-4 px-6 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Priority</th>
                                                <th className="py-4 px-6 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                                                <th className="py-4 px-6 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Last Updated</th>
                                                <th className="py-4 px-6 text-right text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                                            {filteredCases.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                                            <div className="p-3 rounded-full bg-neutral-100 dark:bg-gray-800">
                                                                <Search className="w-5 h-5 text-neutral-400" />
                                                            </div>
                                                            <p className="text-sm font-medium text-neutral-500">No cases match your filters.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCases.map((c) => (
                                                    <tr key={c.id} className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-slate-700/50">
                                                                    {c.patient.firstName[0]}{c.patient.lastName[0]}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-black dark:text-white">
                                                                        {c.patient.firstName} {c.patient.lastName}
                                                                    </span>
                                                                    <span className="text-[10px] text-neutral-500 font-mono tracking-wide">
                                                                        MRN: {c.patient.mrn || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <PriorityBadge priority={c.priority} />
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <StatusBadge status={c.status} />
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                                {new Date(c.updatedAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <Link
                                                                href={`/cases/${c.id}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white text-xs font-bold text-black dark:text-white transition-all duration-200"
                                                            >
                                                                Open
                                                                <ArrowUpRight className="w-3 h-3" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
}