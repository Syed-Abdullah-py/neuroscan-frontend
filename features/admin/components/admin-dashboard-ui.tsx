"use client";

import { Users, FileText, Activity, AlertCircle, UserPlus, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { JoinRequestsList } from "@/features/admin/components/join-requests-list";

interface AdminDashboardUIProps {
    user: {
        name: string | null;
        email: string | null;
        role: string;
    };
    joinRequests: any[];
}

export function AdminDashboardUI({ user, joinRequests }: AdminDashboardUIProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Overview for {user.name}'s Workspace
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                        <UserPlus size={18} />
                        Invite Member
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* KPI Cards */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <KpiCard title="Total Patients" value="1,284" change="+12%" icon={Users} color="blue" />
                        <KpiCard title="Pending Cases" value="42" change="+5" icon={AlertCircle} color="amber" alert />
                        <KpiCard title="Active Doctors" value="24" change="0%" icon={FileText} color="green" />
                    </motion.div>

                    {/* Recent Activity / Charts Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400"
                    >
                        <div className="text-center">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Activity Analytics Coming Soon</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-6">
                    {/* Join Requests Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-blue-500" />
                                Join Requests
                            </h3>
                            {joinRequests.length > 0 && (
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {joinRequests.length}
                                </span>
                            )}
                        </div>
                        <JoinRequestsList requests={joinRequests} currentUserEmail={user.email!} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, change, icon: Icon, alert, color }: any) {
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
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", colors[color] || colors.blue)}>
                    <Icon size={20} />
                </div>
                <span className={`text-xs font-medium ${alert ? "text-amber-500" : "text-slate-400"}`}>
                    {alert ? "Action Needed" : "This Week"}
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <div className="flex items-center gap-1 mt-2">
                    <span className={`text-xs font-bold ${change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>
                        {change}
                    </span>
                    <span className="text-xs text-slate-400">vs last week</span>
                </div>

            </div>
        </motion.div>
    );
}
