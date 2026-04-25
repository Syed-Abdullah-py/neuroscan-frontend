"use client";

import { CheckCircle2, AlertCircle, Loader2, X, FileText, Upload } from "lucide-react";
import { useUpload } from "@/providers/upload-provider";
import { cn } from "@/lib/utils";

export function UploadToast() {
    const { active, files, overallStatus, errorMessage, dismiss } = useUpload();

    if (!active) return null;

    const overallProgress =
        files.length > 0
            ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
            : 0;

    const isDone = overallStatus === "done";
    const isError = overallStatus === "error";
    const isCreating = overallStatus === "creating";
    const isUploading = overallStatus === "uploading";

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 w-[340px] rounded-2xl shadow-2xl overflow-hidden",
                "border bg-white dark:bg-slate-900",
                isDone
                    ? "border-emerald-200 dark:border-emerald-800/60"
                    : isError
                    ? "border-red-200 dark:border-red-800/60"
                    : "border-slate-200 dark:border-slate-700"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-3",
                    isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : isError
                        ? "bg-red-50 dark:bg-red-950/40"
                        : "bg-slate-50 dark:bg-slate-800/60"
                )}
            >
                <div className="flex items-center gap-2.5">
                    {isUploading || isCreating ? (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50">
                            <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                    ) : isDone ? (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/50">
                            <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                        </div>
                    )}
                    <div>
                        <p
                            className={cn(
                                "text-sm font-semibold",
                                isDone
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : isError
                                    ? "text-red-700 dark:text-red-300"
                                    : "text-slate-800 dark:text-slate-100"
                            )}
                        >
                            {isUploading && `Uploading scans — ${overallProgress}%`}
                            {isCreating && "Creating case…"}
                            {isDone && "Case created"}
                            {isError && "Upload failed"}
                        </p>
                        {(isUploading || isCreating) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {isCreating
                                    ? "Finalising…"
                                    : `${files.filter((f) => f.status === "done").length} of ${files.length} files done`}
                            </p>
                        )}
                    </div>
                </div>
                {(isDone || isError) && (
                    <button
                        onClick={dismiss}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Overall progress bar — thin strip under header */}
            {(isUploading || isCreating) && (
                <div className="h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: isCreating ? "100%" : `${overallProgress}%` }}
                    />
                </div>
            )}

            {/* Per-file list */}
            <div className="px-4 py-3 space-y-2.5">
                {files.map((f, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileText
                                size={13}
                                className={cn(
                                    "shrink-0",
                                    f.status === "done"
                                        ? "text-emerald-500"
                                        : f.status === "error"
                                        ? "text-red-500"
                                        : "text-slate-400 dark:text-slate-500"
                                )}
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                                {f.name}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
                                {f.sizeMb} MB
                            </span>
                            {f.status === "done" && (
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            )}
                            {f.status === "error" && (
                                <AlertCircle size={13} className="text-red-500 shrink-0" />
                            )}
                            {f.status === "uploading" && (
                                <span className="text-xs tabular-nums text-blue-600 dark:text-blue-400 shrink-0 w-8 text-right">
                                    {f.progress}%
                                </span>
                            )}
                        </div>
                        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-200",
                                    f.status === "error"
                                        ? "bg-red-500"
                                        : f.status === "done"
                                        ? "bg-emerald-500"
                                        : "bg-blue-500"
                                )}
                                style={{ width: `${f.progress}%` }}
                            />
                        </div>
                    </div>
                ))}

                {isError && errorMessage && (
                    <div className="flex items-start gap-2 mt-1 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
                        <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
                    </div>
                )}

                {isDone && (
                    <div className="flex items-center gap-2 mt-1 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                        <Upload size={13} className="text-emerald-500 shrink-0" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            All scans saved and case is ready.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
