"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Users,
    FileText,
    Activity,
    UserPlus,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Search,
    ArrowUpRight,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

// --- PROJECT IMPORTS ---
import { JoinRequestsList } from "@/features/admin/components/join-requests-list";
import { PatientManagement } from "@/features/admin/components/patient-management";

// --- TYPES ---
interface AdminDashboardUIProps {
    user: {
        name: string | null;
        email: string | null;
        role: string;
        globalRole: string | null;
        workspaceId?: string;
    } | null;
    joinRequests: any[];
    workspaces: any[];
    members?: any[];
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
        green: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
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

const EmptyState = () => (
    <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-gray-900/30 border border-neutral-200 dark:border-slate-700/50 text-center min-h-[400px]"
    >
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-neutral-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-black dark:text-white">No Active Workspace</h2>
        <p className="text-neutral-500 max-w-sm mb-8 text-sm leading-relaxed">
            Select a workspace to manage patients, staff, and system configurations.
        </p>
        <Link
            href="/admin/workspaces"
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
            Manage Workspaces
        </Link>
    </motion.div>
);

// --- MAIN DASHBOARD ---

export function AdminDashboardUI({ user, joinRequests, workspaces, members = [] }: AdminDashboardUIProps) {
    const [searchQuery, setSearchQuery] = useState("");

    if (!user) return null;

    // Calculate members count with safe fallback
    const memberCount = members?.length?.toString() ||
        workspaces.find(w => w.id === user.workspaceId)?.members?.length?.toString() || "0";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-transparent text-black dark:text-white"
        >
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                {/* 1. HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
                            Admin Portal
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
                            Welcome back, <span className="text-black dark:text-white font-medium">{user.name}</span>.
                            System status is <span className="text-emerald-600 dark:text-emerald-400 font-bold">Operational</span>.
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/50 text-xs font-semibold text-neutral-600 dark:text-neutral-300 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </motion.div>
                </div>

                {!user.workspaceId ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* 2. STATS & ALERTS GRID */}
                        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Stat: Active Members */}
                            <StatCard
                                title="Active Members"
                                value={memberCount}
                                icon={Users}
                                color="blue"
                                trend="Workspace Staff"
                            />

                            {/* Stat: System Health */}
                            <StatCard
                                title="System Health"
                                value="99.9%"
                                icon={Activity}
                                color="green"
                                trend="Stable"
                            />

                            {/* Card: Join Requests */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col bg-white dark:bg-gray-900/40 rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden hover:border-neutral-300 dark:hover:border-slate-600 transition-all duration-200"
                            >
                                <div className="p-5 border-b border-neutral-100 dark:border-slate-700/50 flex justify-between items-center bg-neutral-50/50 dark:bg-gray-800/20">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Access Requests</span>
                                    </div>
                                    {joinRequests.length > 0 && (
                                        <span className="flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                            {joinRequests.length}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 p-0 overflow-y-auto max-h-[140px] scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                                    {joinRequests.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-60">
                                            <CheckCircle2 className="w-6 h-6 text-neutral-400 mb-2" />
                                            <p className="text-xs font-medium text-neutral-500">All caught up</p>
                                        </div>
                                    ) : (
                                        <div className="p-3">
                                            <JoinRequestsList requests={joinRequests} currentUserEmail={user.email || ""} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* 3. PATIENT MANAGEMENT SECTION */}
                        <motion.div variants={itemVariants} className="space-y-4 pt-2">

                            {/* Custom Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-black dark:bg-white rounded-lg">
                                        <Users className="w-4 h-4 text-white dark:text-black" />
                                    </div>
                                    <h2 className="text-lg font-bold">Patient Records</h2>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    {/* Search Bar */}
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or MRN..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-neutral-400"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Link
                                            href="/admin/patients/new"
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-slate-800 text-xs font-bold text-black dark:text-white transition-all h-10"
                                        >
                                            <UserPlus className="w-3.5 h-3.5 sm:mr-2" />
                                            <span className="hidden sm:inline">Add Patient</span>
                                        </Link>

                                        <Link
                                            href="/admin/cases/new"
                                            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-bold transition-all h-10 shadow-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5 sm:mr-2" />
                                            <span className="hidden sm:inline">New Case</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Table Wrapper */}
                            <div className="rounded-3xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20 shadow-sm">
                                <PatientManagement
                                    workspaceId={user.workspaceId}
                                    searchQuery={searchQuery}
                                    headerActions={<></>}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
}