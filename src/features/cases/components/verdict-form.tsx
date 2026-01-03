"use client";

import { useState } from "react";
import { updateCaseVerdict } from "@/features/cases/actions/case-actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function VerdictForm({ caseId, initialVerdict }: { caseId: string, initialVerdict: string | null }) {
    const [verdict, setVerdict] = useState(initialVerdict || "");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        if (!verdict) return;
        setLoading(true);
        setMsg("");
        try {
            await updateCaseVerdict(caseId, verdict);
            setMsg("Verdict updated successfully.");
            router.refresh();
        } catch (error) {
            setMsg("Failed to update verdict.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <textarea
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                placeholder="Enter detailed diagnostic findings and recommendation..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between">
                <span className={`text-xs ${msg.includes("success") ? "text-green-600" : "text-red-500"}`}>
                    {msg}
                </span>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !verdict}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {initialVerdict ? "Update Verdict" : "Submit Verdict"}
                </button>
            </div>
        </div>
    );
}
