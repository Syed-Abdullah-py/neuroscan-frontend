"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
    UserPlus, Search, Users, Pencil,
    Trash2, X, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatients, useUpdatePatient, useDeletePatient } from "@/features/patients/hooks/use-patients";
import { useWorkspace } from "@/providers/workspace-provider";
import { Skeleton } from "@/components/ui/skeleton";
import type { Patient } from "@/lib/types/patient.types";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

interface PatientsShellProps {
    workspaceId: string | null;
    workspaceRole: WorkspaceRole | null;
    initialPatients: Patient[];
    initialMembers: any[];
}

export function PatientsShell({
    workspaceId,
    workspaceRole,
    initialPatients,
}: PatientsShellProps) {
    const { activeWorkspaceId } = useWorkspace();
    const [search, setSearch] = useState("");
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    // Pass initialPatients so React Query seeds the cache immediately -
    // isLoading is false from the first render, no skeleton flash on navigation.
    const { data: patients = [], isLoading } = usePatients(initialPatients);

    const isAdmin =
        workspaceRole === "OWNER" || workspaceRole === "ADMIN";

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.first_name.toLowerCase().includes(q) ||
            p.last_name.toLowerCase().includes(q) ||
            (p.mrn?.toLowerCase().includes(q) ?? false) ||
            p.phone_number.includes(q)
        );
    });

    if (!workspaceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Users className="w-12 h-12 text-neutral-300 dark:text-slate-700 mb-4" />
                <h2 className="text-xl font-bold text-black dark:text-white mb-2">
                    No Active Workspace
                </h2>
                <p className="text-neutral-500 mb-6">
                    Select a workspace to view patients.
                </p>
                <Link
                    href="/workspaces"
                    className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    Go to Workspaces
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div
                variants={item}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">
                        Patients
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {patients.length} patient{patients.length !== 1 ? "s" : ""} in
                        this workspace
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-full border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all w-48 md:w-64"
                        />
                    </div>
                    {isAdmin && (
                        <Link
                            href="/patients/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Patient
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                variants={item}
                className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20"
            >
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                            {["Patient", "Phone", "DOB", "Gender", "City", "MRN", "Actions"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="py-3 px-4 text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest"
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j} className="py-3.5 px-4">
                                            <Skeleton className="h-4 w-20" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-40">
                                        <Users className="w-8 h-8 text-neutral-400" />
                                        <p className="text-sm font-medium text-neutral-500">
                                            {search
                                                ? `No results for "${search}"`
                                                : "No patients yet"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <PatientRow
                                    key={p.id}
                                    patient={p}
                                    isAdmin={isAdmin}
                                    workspaceId={activeWorkspaceId!}
                                    onEdit={() => setEditingPatient(p)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Edit modal */}
            <AnimatePresence>
                {editingPatient && (
                    <EditPatientModal
                        patient={editingPatient}
                        workspaceId={activeWorkspaceId!}
                        onClose={() => setEditingPatient(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Patient row ────────────────────────────────────────────────────────────

function PatientRow({
    patient: p,
    isAdmin,
    workspaceId,
    onEdit,
}: {
    patient: Patient;
    isAdmin: boolean;
    workspaceId: string;
    onEdit: () => void;
}) {
    const deletePatient = useDeletePatient();

    const handleDelete = () => {
        if (
            !confirm(
                `Delete ${p.first_name} ${p.last_name}? This will also delete all their cases.`
            )
        )
            return;
        deletePatient.mutate(p.id);
    };

    return (
        <tr className="group hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                        {p.first_name[0]}
                        {p.last_name[0]}
                    </div>
                    <span className="text-sm font-bold text-black dark:text-white">
                        {p.first_name} {p.last_name}
                    </span>
                </div>
            </td>
            <td className="py-3.5 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                {p.phone_number}
            </td>
            <td className="py-3.5 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                {new Date(p.dob).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>
            <td className="py-3.5 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                {p.gender}
            </td>
            <td className="py-3.5 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                {p.city || "-"}
            </td>
            <td className="py-3.5 px-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                {p.mrn || "-"}
            </td>
            <td className="py-3.5 px-4">
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deletePatient.isPending}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                            {deletePatient.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Trash2 size={14} />
                            )}
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

// ── Edit modal ─────────────────────────────────────────────────────────────

function EditPatientModal({
    patient,
    workspaceId,
    onClose,
}: {
    patient: Patient;
    workspaceId: string;
    onClose: () => void;
}) {
    const updatePatient = useUpdatePatient();
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        try {
            await updatePatient.mutateAsync({
                patientId: patient.id,
                data: {
                    first_name: fd.get("first_name") as string,
                    last_name: fd.get("last_name") as string,
                    phone_number: fd.get("phone_number") as string,
                    gender: fd.get("gender") as string,
                    mrn: (fd.get("mrn") as string) || undefined,
                    cnic: (fd.get("cnic") as string) || undefined,
                    address: (fd.get("address") as string) || undefined,
                    city: (fd.get("city") as string) || undefined,
                },
            });
            onClose();
        } catch (err: any) {
            setMsg(err.message || "Failed to update.");
        }
    };

    const inputCls =
        "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-black dark:text-white">
                        Edit Patient
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                First Name
                            </label>
                            <input
                                name="first_name"
                                defaultValue={patient.first_name}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Last Name
                            </label>
                            <input
                                name="last_name"
                                defaultValue={patient.last_name}
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Phone
                            </label>
                            <input
                                name="phone_number"
                                defaultValue={patient.phone_number}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Gender
                            </label>
                            <select
                                name="gender"
                                defaultValue={patient.gender}
                                className={inputCls}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                MRN
                            </label>
                            <input
                                name="mrn"
                                defaultValue={patient.mrn ?? ""}
                                className={inputCls}
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                CNIC
                            </label>
                            <input
                                name="cnic"
                                defaultValue={patient.cnic ?? ""}
                                className={inputCls}
                                placeholder="xxxxx-xxxxxxx-x"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                City
                            </label>
                            <input
                                name="city"
                                defaultValue={patient.city ?? ""}
                                className={inputCls}
                                placeholder="Lahore"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                Address
                            </label>
                            <input
                                name="address"
                                defaultValue={patient.address ?? ""}
                                className={inputCls}
                                placeholder="123 Main St"
                            />
                        </div>
                    </div>

                    {msg && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            {msg}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updatePatient.isPending}
                            className="flex-1 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {updatePatient.isPending && (
                                <Loader2 size={14} className="animate-spin" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}