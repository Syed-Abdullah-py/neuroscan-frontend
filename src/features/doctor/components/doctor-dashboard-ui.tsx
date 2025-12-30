"use client";

import { Activity, Clock, FileText, CheckCircle2, Upload, Calendar, Building2, LogOut, Stethoscope, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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

import { WorkspaceManager } from "@/features/workspaces/components/workspace-manager";

export function DoctorDashboardUI({ stats, recentCases, user, workspaces }: DoctorDashboardUIProps) {
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

    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [verdict, setVerdict] = useState("");
    const [updating, setUpdating] = useState(false);

    const handleUpdateVerdict = async (caseId: string) => {
        if (!verdict) return;
        setUpdating(true);
        try {
            const { updateCaseVerdict } = await import("@/features/cases/actions/case-actions");
            await updateCaseVerdict(caseId, verdict);
            setSelectedCase(null);
            setVerdict("");
            // Ideally trigger a refresh or optimistically update
        } catch (e) {
            console.error(e);
            alert("Failed to update verdict");
        } finally {
            setUpdating(false);
        }
    };

    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterPriority, setFilterPriority] = useState("ALL");

    const filteredCases = recentCases.filter(c => {
        if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
        // Assuming priority is a field on case, defaulting to normal if missing. 
        // Need to check if 'priority' exists on the case object passed in recentCases.
        // Based on previous code, Case model has priority. 
        if (filterPriority !== "ALL" && (c.priority || 'normal') !== filterPriority) return false;
        return true;
    });

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
            {/* Verdict Modal (Same as before) */}
            <AnimatePresence>
                {selectedCase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Update Diagnostic Verdict</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Please provide your professional assessment for Case #{selectedCase.id.slice(-4)}.
                            </p>
                            <textarea
                                value={verdict}
                                onChange={e => setVerdict(e.target.value)}
                                className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-4 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter your detailed findings here..."
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setSelectedCase(null)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateVerdict(selectedCase.id)}
                                    disabled={updating || !verdict}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50"
                                >
                                    {updating ? "Submitting..." : "Submit Verdict"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Doctor Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Welcome back, Dr. {user.name}.
                    </p>
                </div>
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
            </div>

            {!user.workspaceId ? (
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
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl 
                    transition-all duration-500 peer-hover:bg-blue-500/30" />

                        {/* Inner Icon Container */}
                        <div
                            className="peer relative w-28 h-28 bg-white dark:bg-slate-800 
                   rounded-3xl shadow-lg border border-slate-100 
                   dark:border-slate-700 flex items-center justify-center 
                   transform -rotate-3 hover:rotate-3 
                   transition-transform duration-500 ease-out"
                        >
                            <Stethoscope
                                className="w-16 h-16 text-blue-600 dark:text-blue-400 drop-shadow-md"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>


                    {/* Text Content */}
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight max-w-lg">
                        No Active Workspace Found
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base leading-relaxed mb-10">
                        You are currently not assigned to any medical facility. Please join a workspace to start viewing patient assignments and analyzing scans.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 transition-all">
                            <Building2 size={18} />
                            Browse Workspaces
                        </button>
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
                        <StatCard
                            title="Assigned Cases"
                            value={stats?.totalCases || 0}
                            icon={FileText}
                            color="blue"
                            trend="+2 this week"
                        />
                        <StatCard
                            title="Pending Review"
                            value={stats?.pendingCases || 0}
                            icon={Clock}
                            color="amber"
                            trend="Requires attention"
                        />
                        <StatCard
                            title="Completed"
                            value={stats?.completedCases || 0}
                            icon={CheckCircle2}
                            color="green"
                            trend="Great job!"
                        />
                    </motion.div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            {["ALL", "PENDING", "COMPLETED"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                                        filterStatus === status
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {status === "ALL" ? "All Status" : status}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            {["ALL", "urgent", "normal"].map((prio) => (
                                <button
                                    key={prio}
                                    onClick={() => setFilterPriority(prio)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize",
                                        filterPriority === prio
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {prio === "ALL" ? "All Priority" : prio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Cases Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Brain className="w-5 h-5 text-blue-500" />
                                Assigned Cases
                            </h2>
                            {/* <Link href="/cases" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                View All
                            </Link> */}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-950/50">
                                    <tr>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Patient</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Scan Type</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Priority</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Status</th>
                                        <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Date</th>
                                        <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-4 px-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredCases.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                                                No cases match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCases.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {c.patient.firstName} {c.patient.lastName}
                                                        </span>
                                                        <span className="text-xs text-slate-500">MRN: {c.patient.mrn || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {c.bodyPart}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={cn("text-xs font-bold uppercase", c.priority === 'urgent' ? 'text-red-500' : 'text-slate-500')}>
                                                        {c.priority || 'Normal'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <StatusBadge status={c.status} />
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-500">
                                                    {new Date(c.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="View Scans"
                                                        >
                                                            <Upload size={16} /> {/* Should be Eye or Activity but using Upload as placeholder icon */}
                                                        </button>
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                            title="Generate Report"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                        {c.status !== 'COMPLETED' ? (
                                                            <button
                                                                onClick={() => setSelectedCase(c)}
                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"
                                                            >
                                                                Verdict
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                                <CheckCircle2 size={14} /> Done
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                {/* <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                    {trend}
                </span> */}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-xs text-slate-400 mt-2">{trend}</p>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "PENDING") {
        return <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md">Pending</span>;
    }
    if (status === "COMPLETED") {
        return <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md">Completed</span>;
    }
    return <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-md">{status}</span>;
}
