"use client";

import Link from "next/link";
import { FileText, Plus, User, Stethoscope, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { getAllCasesForWorkspace } from "@/features/cases/actions/case-actions";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";

type Case = {
    id: string;
    status: string;
    priority: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    verdict: string | null;
    patient: {
        id: string;
        first_name: string;
        last_name: string;
        phone_number: string;
    } | null;
    assigned_to_member_id: string | null;
};

// --- Animation Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

export function CasesView({ workspaceId }: { workspaceId: string }) {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCases() {
            try {
                const data = await getAllCasesForWorkspace(workspaceId);
                setCases(data as Case[]);
            } catch (error) {
                console.error("Failed to fetch cases:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, [workspaceId]);

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
            COMPLETED: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30",
            CANCELLED: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700"
        };
        const icons = {
            PENDING: <Clock size={14} />,
            COMPLETED: <CheckCircle2 size={14} />,
            CANCELLED: <AlertCircle size={14} />
        };
        return (
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", styles[status as keyof typeof styles] || styles.PENDING)}>
                {icons[status as keyof typeof icons]}
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            low: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
            normal: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400",
            high: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
            critical: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
        };
        return (
            <span className={cn("px-2 py-0.5 rounded-md text-xs font-bold uppercase", styles[priority as keyof typeof styles] || styles.normal)}>
                {priority}
            </span>
        );
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
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
            </motion.div>

            {loading ? (
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Loading cases...</p>
                </motion.div>
            ) : cases.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Cases Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Get started by registering your first case. Click the button above to begin.
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {cases.map((caseItem) => (
                                    <tr key={caseItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <User size={18} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        {caseItem.patient?.first_name ?? "Unknown"} {caseItem.patient?.last_name ?? ""}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{caseItem.patient?.phone_number ?? "N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPriorityBadge(caseItem.priority)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(caseItem.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {caseItem.assigned_to_member_id ? (
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope size={14} className="text-slate-400" />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        Assigned
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Calendar size={14} />
                                                {new Date(caseItem.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/cases/${caseItem.id}`}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors inline-block"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
