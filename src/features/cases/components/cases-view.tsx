"use client";

import { useState } from "react";
import { CreateCaseWizard } from "@/features/cases/components/create-case-wizard";
import { FileText, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CasesView({ workspaceId }: { workspaceId: string }) {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Case Management</h1>
                    <p className="text-slate-500 mt-1">Manage diagnostic cases and assignments.</p>
                </div>
                <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} />
                    Register New Case
                </button>
            </div>

            {/* Wizard Modal */}
            <AnimatePresence>
                {showWizard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-2xl">
                            <button
                                onClick={() => setShowWizard(false)}
                                className="absolute -top-12 right-0 text-white hover:text-slate-200 flex items-center gap-1"
                            >
                                <X size={18} /> Close
                            </button>
                            <CreateCaseWizard
                                workspaceId={workspaceId}
                                onSuccess={() => setShowWizard(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FileText className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">All Cases</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    A comprehensive list of all cases across the workspace will be displayed here.
                    (Feature currently in development: Admin Case List)
                </p>
            </div>
        </div>
    );
}
