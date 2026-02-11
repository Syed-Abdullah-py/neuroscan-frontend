"use client";

import { ArrowLeft, FileText, Phone, User, Activity, Brain, ShieldAlert, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VerdictForm } from "@/features/cases/components/verdict-form";
import { ThreeDViewerContainer } from "@/components/three-d-viewer-container";
import { motion, Variants } from "framer-motion";

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

interface CaseDetailsViewProps {
    caseItem: any;
    user: any;
    aiData: {
        diagnosis: string;
        confidence: number;
        volume: string;
        lifeExpectancy: number;
    };
    isDoctor: boolean;
    isAssignedDoctor: boolean;
}

export function CaseDetailsView({ caseItem, user, aiData, isDoctor, isAssignedDoctor }: CaseDetailsViewProps) {
    const renderPriorityBadge = (priority: string) => {
        const p = (priority || 'normal').toLowerCase();
        let className = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        if (p === 'critical' || p === 'urgent') className = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
        else if (p === 'high') className = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
        else if (p === 'normal') className = "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800";

        return (
            <span className={cn("px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider", className)}>
                {p}
            </span>
        );
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 font-sans"
        >
            <div className="max-w-[1800px] mx-auto space-y-6">

                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={isDoctor ? "/doctor" : "/admin"}
                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                    Case #{caseItem.id.slice(-6)}
                                </h1>
                                {renderPriorityBadge(caseItem.priority)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Calendar size={14} />
                                <span>Created {new Date(caseItem.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Grid Layout - Fixed Columns */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN (Span 8) - Viewer & Patient Data */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 3D Viewer Card */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    3D Analysis
                                </h2>
                                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                    brain.glb
                                </span>
                            </div>
                            <div className="h-[500px] w-full relative bg-slate-950">
                                <ThreeDViewerContainer />
                            </div>
                        </motion.div>

                        {/* Patient & Notes Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Patient Info */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User size={16} /> Patient Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {caseItem.patient?.first_name ?? "Unknown"} {caseItem.patient?.last_name ?? ""}
                                        </p>
                                        <p className="text-sm text-slate-500">MRN: {caseItem.patient?.id?.slice(0, 8) ?? "N/A"}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-500">Contact</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                <Phone size={14} /> {caseItem.patient?.phone_number ?? "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Assigned To</span>
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {caseItem.assigned_to_member_id ? "Assigned" : "Unassigned"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Clinical Notes */}
                            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Clinical Notes
                                </h3>
                                <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        {caseItem.notes || "No clinical notes provided."}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Span 4) - AI & Verdict */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* AI Analysis Card (Original Purple/Blue Theme) */}
                        <motion.div variants={itemVariants} className="bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 p-1 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-linear-to-br from-purple-600 to-blue-600 rounded-lg shadow-md">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Analysis</h2>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Neural Network Prediction</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Diagnosis Box */}
                                    <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Primary Diagnosis</label>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {aiData.diagnosis}
                                        </p>
                                    </div>

                                    {/* Confidence Bar */}
                                    <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</label>
                                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{aiData.confidence}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full"
                                                style={{ width: `${aiData.confidence}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* The "Missing" Grid Cards */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Volume</label>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{aiData.volume}</p>
                                            <span className="text-[10px] text-slate-500">cm³</span>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Est. Life</label>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{aiData.lifeExpectancy}</p>
                                            <span className="text-[10px] text-slate-500">months</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Card */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={16} /> Current Status
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Stage</span>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-md text-xs font-bold uppercase",
                                        caseItem.status === 'COMPLETED' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    )}>
                                        {caseItem.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Last Update</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {new Date(caseItem.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Verdict Section */}
                        <motion.div variants={itemVariants} className={cn(
                            "p-6 rounded-2xl border shadow-sm transition-all",
                            isAssignedDoctor
                                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        )}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    caseItem.verdict ? "bg-green-100 text-green-600" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                )}>
                                    <ShieldAlert size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Diagnostic Verdict</h2>
                            </div>

                            {isAssignedDoctor ? (
                                <VerdictForm caseId={caseItem.id} initialVerdict={caseItem.verdict} />
                            ) : (
                                <div className={cn(
                                    "p-4 rounded-xl text-sm leading-relaxed border",
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
            </div>
        </motion.div>
    );
}
