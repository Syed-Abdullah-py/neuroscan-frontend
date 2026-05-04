"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "framer-motion";
import {
    FileText, Plus, User, Calendar,
    Search, ArrowUpRight, Trash2, Loader2,
    ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCases, useDeleteCase } from "@/features/cases/hooks/use-cases";
import { useWorkspaceMembers } from "@/features/workspaces/hooks/use-workspaces";
import { useWorkspace } from "@/providers/workspace-provider";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkspaceRole, WorkspaceMember } from "@/lib/types/workspace.types";
import type { Case, CaseStats } from "@/lib/types/case.types";
import { useRouter } from "next/navigation";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

const PRIORITY_STYLES: Record<string, string> = {
    urgent: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30",
    high: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30",
    normal: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30",
    low: "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-slate-800 border-neutral-200 dark:border-slate-700",
};

const STATUS_STYLES: Record<string, string> = {
    PENDING: "text-amber-600 dark:text-amber-400",
    PROCESSING: "text-blue-600 dark:text-blue-400",
    REVIEWED: "text-emerald-600 dark:text-emerald-400",
};

interface CasesShellProps {
    workspaceId: string | null;
    workspaceRole: WorkspaceRole | null;
    initialCases: Case[];
    initialStats: CaseStats | null;
}

export function CasesShell({
    workspaceId,
    workspaceRole,
    initialCases,
    initialStats,
}: CasesShellProps) {
    const { activeWorkspaceId } = useWorkspace();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [dateSort, setDateSort] = useState<"none" | "asc" | "desc">("none");

    const { data: cases = [], isLoading } = useCases(initialCases);
    const { data: members = [] } = useWorkspaceMembers(activeWorkspaceId ?? undefined);
    const deleteCase = useDeleteCase();

    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";

    const filtered = cases
        .filter((c) => {
            // Hide cases whose AI pipeline is still running
            if (c.status === "PROCESSING" && statusFilter !== "PROCESSING") return false;

            const q = search.toLowerCase();
            const fullName = `${c.patient_first_name ?? ""} ${c.patient_last_name ?? ""}`.trim().toLowerCase();
            const matchSearch =
                !q ||
                fullName.includes(q) ||
                (c.patient_first_name ?? "").toLowerCase().includes(q) ||
                (c.patient_last_name ?? "").toLowerCase().includes(q);
            const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
            const matchPriority =
                priorityFilter === "ALL" || c.priority === priorityFilter;
            return matchSearch && matchStatus && matchPriority;
        })
        .sort((a, b) => {
            if (dateSort === "none") return 0;
            const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return dateSort === "asc" ? diff : -diff;
        });

    const cycleSort = () =>
        setDateSort((s) => s === "none" ? "desc" : s === "desc" ? "asc" : "none");

    if (!workspaceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FileText className="w-12 h-12 text-neutral-300 dark:text-slate-700 mb-4" />
                <h2 className="text-xl font-bold mb-2">No Active Workspace</h2>
                <Link
                    href="/workspaces"
                    className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90"
                >
                    Go to Workspaces
                </Link>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">Cases</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {cases.length} case{cases.length !== 1 ? "s" : ""} in this workspace
                    </p>
                </div>
                {isAdmin && (
                    <Link
                        href="/cases/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Case
                    </Link>
                )}
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="flex flex-wrap gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        placeholder="Search cases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white w-36 sm:w-48"
                    />
                </div>

                {/* Status tabs */}
                <div className="flex p-1 rounded-xl bg-neutral-100 dark:bg-gray-900 border border-neutral-200 dark:border-slate-700">
                    {["ALL", "PENDING", "PROCESSING", "REVIEWED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all uppercase tracking-wide",
                                statusFilter === s
                                    ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm"
                                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                            )}
                        >
                            {s === "ALL" ? "All" : s}
                        </button>
                    ))}
                </div>

                {/* Priority select */}
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-gray-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none"
                >
                    <option value="ALL">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                </select>
            </motion.div>

            {/* Table */}
            <motion.div variants={item} className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                            {["Patient", "Assigned", "Priority", "Status"].map((h) => (
                                <th key={h} className="py-3 px-4 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                                    {h}
                                </th>
                            ))}
                            <th className="py-3 px-4 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                                <button
                                    onClick={cycleSort}
                                    className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    Created
                                    {dateSort === "none" && <ArrowUpDown size={11} className="opacity-40" />}
                                    {dateSort === "desc" && <ArrowDown size={11} />}
                                    {dateSort === "asc" && <ArrowUp size={11} />}
                                </button>
                            </th>
                            <th className="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="py-3.5 px-4">
                                            <Skeleton className="h-4 w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <FileText className="w-8 h-8 text-neutral-400" />
                                        <p className="text-sm font-medium text-neutral-500">
                                            {search ? `No results for "${search}"` : "No cases yet"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <CaseRow
                                    key={c.id}
                                    caseItem={c}
                                    isAdmin={isAdmin}
                                    workspaceId={workspaceId}
                                    members={members}
                                    onDelete={() => deleteCase.mutate(c.id)}
                                    isDeleting={deleteCase.isPending && deleteCase.variables === c.id}
                                />
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

function DeleteConfirmModal({
    patientName,
    caseId,
    onConfirm,
    onCancel,
}: {
    patientName: string | null;
    caseId: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-700 w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-black dark:text-white">Delete Case</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="bg-neutral-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-neutral-100 dark:border-slate-700">
                    {patientName && (
                        <p className="text-sm font-medium text-black dark:text-white">{patientName}</p>
                    )}
                    <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">{caseId}</p>
                </div>

                <div className="flex gap-2 mt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function CaseRow({
    caseItem: c,
    isAdmin,
    members,
    onDelete,
    isDeleting,
}: {
    caseItem: Case;
    isAdmin: boolean;
    workspaceId: string;
    members: WorkspaceMember[];
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
    const priority = (c.priority || "normal").toLowerCase();

    const assignedMember = c.assigned_to_member_id
        ? members.find((m) => m.id === c.assigned_to_member_id)
        : null;
    const assignedName = assignedMember
        ? (assignedMember.user_name || assignedMember.user_email || "Unknown")
        : (c.assigned_to_name ?? null);

    const patientName = (c.patient_first_name || c.patient_last_name)
        ? `${c.patient_first_name ?? ""} ${c.patient_last_name ?? ""}`.trim()
        : null;

    const createdAt = new Date(c.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <>
        {showDeleteModal && (
            <DeleteConfirmModal
                patientName={patientName}
                caseId={c.id}
                onConfirm={() => { setShowDeleteModal(false); onDelete(); }}
                onCancel={() => setShowDeleteModal(false)}
            />
        )}
        <tr className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors">
            {/* Patient */}
            <td className="py-3.5 px-4">
                {patientName ? (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 shrink-0">
                            {(c.patient_first_name?.[0] ?? "")}{(c.patient_last_name?.[0] ?? "")}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-black dark:text-white">{patientName}</span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">{c.id}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-neutral-400 italic">Unknown</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">{c.id}</span>
                    </div>
                )}
            </td>
            {/* Assigned */}
            <td className="py-3.5 px-4 text-xs">
                {assignedName ? (
                    <div className="flex items-center gap-1.5">
                        <User size={12} className="text-blue-500 shrink-0" />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{assignedName}</span>
                    </div>
                ) : (
                    <span className="text-neutral-400 italic">Unassigned</span>
                )}
            </td>
            {/* Priority */}
            <td className="py-3.5 px-4">
                <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal
                )}>
                    {priority}
                </span>
            </td>
            {/* Status */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-2">
                    {c.status === "PENDING" && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                    )}
                    {c.status === "REVIEWED" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    {c.status === "PROCESSING" && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    <span className={cn("text-xs font-bold", STATUS_STYLES[c.status] ?? STATUS_STYLES.PENDING)}>
                        {c.status}
                    </span>
                </div>
            </td>
            {/* Created */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 whitespace-nowrap">
                    <Calendar size={12} className="shrink-0" />
                    {createdAt}
                </div>
            </td>
            {/* Actions */}
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => {
                            setIsOpening(true);
                            router.push(`/cases/${c.id}`);
                        }}
                        disabled={isOpening}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 text-xs font-bold text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
                    >
                        {isOpening ? <Loader2 size={12} className="animate-spin" /> : null}
                        Open
                        {!isOpening ? <ArrowUpRight size={12} /> : null}
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Trash2 size={14} />
                            )}
                        </button>
                    )}
                </div>
            </td>
        </tr>
        </>
    );
}