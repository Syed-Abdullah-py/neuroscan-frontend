"use client";
import { useState } from "react";
import {
    Users,
    FileText,
    Activity,
    UserPlus,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Clock,
    ChevronRight,
    Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { JoinRequestsList } from "@/features/admin/components/join-requests-list";
import { PatientManagement } from "@/features/admin/components/patient-management";
import Link from "next/link";

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
}

export function AdminDashboardUI({ user, joinRequests, workspaces }: AdminDashboardUIProps) {
    if (!user) return null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {`Welcome back, Mr. ${user.name}.`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm">
                        <Clock size={18} className="text-blue-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    {user.workspaceId && (
                        <div className="hidden md:flex">
                            {/* Buttons moved to Patient Directory */}
                        </div>
                    )}
                </div>
            </div>

            {!user.workspaceId ? (
                // ==========================================
                // EMPTY STATE (Matches Doctor Dashboard)
                // ==========================================
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 min-h-[500px] flex flex-col items-center justify-center text-center p-8 md:p-16 group"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 bg-[radial(circle_at_top,var(--tw-gradient-stops))] from-blue-50/80 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-50" />

                    {/* Icon Animation */}
                    <div className="relative mb-8 cursor-default">
                        {/* Glow reacts to inner hover */}
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl transition-all duration-500 peer-hover:bg-blue-500/30" />

                        {/* Inner Icon Container */}
                        <div className="peer relative w-28 h-28 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center transform -rotate-3 hover:rotate-3 transition-transform duration-500 ease-out">
                            <Building2 className="w-16 h-16 text-blue-600 dark:text-blue-400 drop-shadow-md" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight max-w-lg">
                        No Active Workspace
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base leading-relaxed mb-10">
                        Select a workspace from the sidebar to manage your team, view analytics, and handle access requests.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/admin/workspaces">
                            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25">
                                <Building2 size={18} />
                                Manage Workspaces
                            </button>
                        </Link>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Stats & Access Requests Grid */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Stat: Total Members */}
                        <StatCard
                            title="Total Members"
                            value="14"
                            icon={Users}
                            color="blue"
                            trend="+2 this month"
                        />

                        {/* Stat: System Health */}
                        <StatCard
                            title="System Health"
                            value="99.9%"
                            icon={Activity}
                            color="green"
                            trend="Operational"
                        />

                        {/* Access Requests Card - Now in the top row */}
                        <motion.div
                            variants={item}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    Access Requests
                                </h2>
                                {joinRequests.length > 0 && (
                                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full">
                                        {joinRequests.length}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-auto max-h-[200px] md:max-h-[160px]">
                                {joinRequests.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Caught Up</h3>
                                        <p className="text-[10px] text-slate-500">No pending requests.</p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <JoinRequestsList requests={joinRequests} currentUserEmail={user.email || ""} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Patient Management - Full Width Below */}
                    <motion.div
                        variants={item}
                        initial="hidden"
                        animate="show"
                    >
                        <PatientManagement
                            workspaceId={user.workspaceId}
                            headerActions={
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">

                                    {/* Left: Title + Search */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {/* Search */}
                                        <input
                                            type="text"
                                            placeholder="Search patients..."
                                            className="w-full md:w-72 px-4 py-2 rounded-xl
                               border border-slate-200 dark:border-slate-700
                               bg-white dark:bg-slate-800
                               text-sm text-slate-700 dark:text-slate-200
                               placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Right: Action Buttons */}
                                    <div className="flex gap-2 w-full md:w-auto md:ml-auto">
                                        <Link
                                            href="/admin/patients/new"
                                            className="bg-white dark:bg-slate-800 
                               text-slate-700 dark:text-slate-200 
                               border border-slate-200 dark:border-slate-700 
                               hover:bg-slate-50 dark:hover:bg-slate-700 
                               px-3 py-2 md:px-4 md:py-2 
                               rounded-xl font-bold text-xs md:text-sm 
                               flex items-center gap-2 transition-all 
                               justify-center flex-1 md:flex-none ml-80"
                                        >
                                            <UserPlus size={16} />
                                            <span className="hidden sm:inline">Add Patient</span>
                                            <span className="sm:hidden">Add</span>
                                        </Link>

                                        <Link
                                            href="/admin/cases/new"
                                            className="bg-blue-600 hover:bg-blue-500 
                               text-white px-3 py-2 md:px-4 md:py-2 
                               rounded-xl font-bold text-xs md:text-sm 
                               flex items-center gap-2 shadow-lg 
                               shadow-blue-600/25 transition-all 
                               justify-center flex-1 md:flex-none"
                                        >
                                            <FileText size={16} />
                                            <span className="hidden sm:inline">Register Case</span>
                                            <span className="sm:hidden">New Case</span>
                                        </Link>
                                    </div>
                                </div>
                            }
                        />
                    </motion.div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", colors[color])}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-xs text-slate-400 mt-2">{trend}</p>
            </div>
        </motion.div>
    );
}