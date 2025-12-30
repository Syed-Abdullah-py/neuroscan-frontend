"use client";
import { useState } from "react";
import {
    Users,
    FileText,
    Activity,
    AlertCircle,
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
import { CreateCaseWizard } from "@/features/cases/components/create-case-wizard";
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

    const [showCreateWizard, setShowCreateWizard] = useState(false);

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto relative">

            {/* Overlay for Wizard */}
            <AnimatePresence>
                {showCreateWizard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-2xl">
                            <button
                                onClick={() => setShowCreateWizard(false)}
                                className="absolute -top-12 right-0 text-white hover:text-slate-200"
                            >
                                Close
                            </button>
                            <CreateCaseWizard
                                workspaceId={user.workspaceId!}
                                onSuccess={() => setShowCreateWizard(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <button
                            onClick={() => setShowCreateWizard(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                        >
                            <UserPlus size={18} />
                            Register Case
                        </button>
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
                    {/* Stats Grid */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Example Stats - You can plug real data here later */}
                        <StatCard
                            title="Total Members"
                            value="14"
                            icon={Users}
                            color="blue"
                            trend="+2 this month"
                        />
                        <StatCard
                            title="Access Requests"
                            value={joinRequests.length}
                            icon={AlertCircle}
                            color={joinRequests.length > 0 ? "amber" : "green"}
                            trend={joinRequests.length > 0 ? "Action Required" : "All clear"}
                        />
                        <StatCard
                            title="System Health"
                            value="99.9%"
                            icon={Activity}
                            color="green"
                            trend="Operational"
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Access Requests */}
                        <motion.div
                            variants={item}
                            initial="hidden"
                            animate="show"
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                    Access Requests
                                </h2>
                                {joinRequests.length > 0 && (
                                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full">
                                        {joinRequests.length} Pending
                                    </span>
                                )}
                            </div>

                            {joinRequests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Caught Up</h3>
                                    <p className="text-xs text-slate-500 mt-1">No pending access requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="p-2">
                                    <JoinRequestsList requests={joinRequests} currentUserEmail={user.email || ""} />
                                </div>
                            )}
                        </motion.div>

                        {/* Right Column: Placeholder or something else */}
                        <motion.div
                            variants={item}
                            initial="hidden"
                            animate="show"
                        >
                            <PatientManagement workspaceId={user.workspaceId} />
                        </motion.div>
                    </div>
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