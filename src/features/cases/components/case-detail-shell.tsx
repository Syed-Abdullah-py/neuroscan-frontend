"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
    ArrowLeft, Brain, User, Phone,
    FileText, Activity, ShieldAlert,
    Calendar, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateCase } from "@/features/cases/hooks/use-cases";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Case, CaseStatus } from "@/lib/types/case.types";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

// 3D viewer — lazy loaded, never in the main bundle
const ThreeDViewerContainer = dynamic(
    () =>
        import("@/components/three-d-viewer-container").then(
            (m) => m.ThreeDViewerContainer
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        ),
    }
);

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

const PRIORITY_STYLES: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    normal: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800",
    low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

interface CaseDetailShellProps {
    caseItem: Case;
    workspaceId: string;
    workspaceRole: WorkspaceRole | null;
    membershipId: string | null;
    user: { name: string; email: string; globalRole: string };
}

export function CaseDetailShell({
    caseItem,
    workspaceRole,
    membershipId,
}: CaseDetailShellProps) {
    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";
    const isAssignedDoctor =
        workspaceRole === "DOCTOR" &&
        caseItem.assigned_to_member_id === membershipId;

    const priority = (caseItem.priority || "normal").toLowerCase();

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/cases"
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                Case #{caseItem.id.slice(-6)}
                            </h1>
                            <span className={cn(
                                "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                                PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal
                            )}>
                                {priority}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar size={14} />
                            Created {new Date(caseItem.created_at).toLocaleDateString("en-GB")}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main grid */}
            <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: viewer + patient + notes */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 3D Viewer */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                3D Analysis
                            </h2>
                            <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                                brain.glb
                            </span>
                        </div>
                        <div className="h-[480px] w-full bg-slate-950">
                            <ThreeDViewerContainer />
                        </div>
                    </motion.div>

                    {/* Patient + Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User size={14} /> Patient Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        Patient #{caseItem.patient_id.slice(-8)}
                                    </p>
                                    <p className="text-xs text-slate-400 font-mono">{caseItem.patient_id}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Assigned To</span>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            caseItem.assigned_to_member_id
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-slate-400 italic"
                                        )}>
                                            {caseItem.assigned_to_member_id ? "Assigned" : "Unassigned"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Last Updated</span>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {new Date(caseItem.updated_at).toLocaleDateString("en-GB")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileText size={14} /> Clinical Notes
                            </h3>
                            <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    {caseItem.notes || "No clinical notes provided."}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right: AI placeholder + status + verdict */}
                <div className="lg:col-span-4 space-y-6">
                    {/* AI Analysis placeholder */}
                    <motion.div variants={item} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 p-1 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-md">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                        AI Analysis
                                    </h2>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                        Neural Network
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                        Status
                                    </p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {caseItem.status === "REVIEWED"
                                            ? "Analysis complete"
                                            : "Awaiting processing"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                                            Priority
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                                            {caseItem.priority}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                                            Files
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {(() => {
                                                try {
                                                    return JSON.parse(caseItem.file_references).length;
                                                } catch {
                                                    return "—";
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status */}
                    <motion.div variants={item} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={14} /> Current Status
                        </h2>
                        <StatusSelector
                            caseId={caseItem.id}
                            currentStatus={caseItem.status}
                            isAdmin={isAdmin}
                        />
                    </motion.div>

                    {/* Verdict */}
                    <motion.div variants={item} className={cn(
                        "p-6 rounded-2xl border shadow-sm",
                        isAssignedDoctor || isAdmin
                            ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    )}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "p-2 rounded-lg",
                                caseItem.verdict
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            )}>
                                <ShieldAlert size={16} />
                            </div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                Diagnostic Verdict
                            </h2>
                        </div>

                        {isAssignedDoctor || isAdmin ? (
                            <VerdictForm
                                caseId={caseItem.id}
                                initialVerdict={caseItem.verdict}
                            />
                        ) : (
                            <div className={cn(
                                "p-4 rounded-xl text-sm border",
                                caseItem.verdict
                                    ? "bg-white dark:bg-slate-950 border-green-200 dark:border-green-900/30 text-slate-700 dark:text-slate-300"
                                    : "bg-slate-50 dark:bg-slate-950/50 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic text-center"
                            )}>
                                {caseItem.verdict || "Waiting for doctor's assessment."}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Status selector ────────────────────────────────────────────────────────

function StatusSelector({
    caseId,
    currentStatus,
    isAdmin,
}: {
    caseId: string;
    currentStatus: CaseStatus;
    isAdmin: boolean;
}) {
    const updateCase = useUpdateCase();
    const { activeWorkspaceId } = useWorkspace();

    const statuses: CaseStatus[] = ["PENDING", "PROCESSING", "REVIEWED"];
    const colors: Record<CaseStatus, string> = {
        PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        REVIEWED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };

    if (!isAdmin) {
        return (
            <div className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold uppercase text-center",
                colors[currentStatus]
            )}>
                {currentStatus}
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {statuses.map((s) => (
                <button
                    key={s}
                    disabled={updateCase.isPending || s === currentStatus}
                    onClick={() =>
                        updateCase.mutate({ caseId, data: { status: s } })
                    }
                    className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all",
                        s === currentStatus
                            ? colors[s]
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                    )}
                >
                    {updateCase.isPending && updateCase.variables?.data?.status === s ? (
                        <Loader2 size={12} className="animate-spin mx-auto" />
                    ) : (
                        s
                    )}
                </button>
            ))}
        </div>
    );
}

// ── Verdict form ───────────────────────────────────────────────────────────

function VerdictForm({
    caseId,
    initialVerdict,
}: {
    caseId: string;
    initialVerdict: string | null;
}) {
    const [verdict, setVerdict] = useState(initialVerdict || "");
    const [msg, setMsg] = useState("");
    const updateCase = useUpdateCase();

    const handleSubmit = async () => {
        if (!verdict.trim()) return;
        try {
            await updateCase.mutateAsync({
                caseId,
                data: { verdict, status: "REVIEWED" },
            });
            setMsg("Verdict saved.");
            setTimeout(() => setMsg(""), 3000);
        } catch (err: any) {
            setMsg(err.message || "Failed to save verdict.");
        }
    };

    return (
        <div className="space-y-3">
            <textarea
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                rows={4}
                placeholder="Enter detailed diagnostic findings and recommendation..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all placeholder:text-slate-400 dark:text-white"
            />
            <div className="flex items-center justify-between">
                {msg ? (
                    <span className={cn(
                        "text-xs font-medium flex items-center gap-1.5",
                        msg.includes("saved")
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    )}>
                        <AlertCircle size={12} />
                        {msg}
                    </span>
                ) : (
                    <span />
                )}
                <button
                    onClick={handleSubmit}
                    disabled={updateCase.isPending || !verdict.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                    {updateCase.isPending && (
                        <Loader2 size={13} className="animate-spin" />
                    )}
                    {initialVerdict ? "Update Verdict" : "Submit Verdict"}
                </button>
            </div>
        </div>
    );
}