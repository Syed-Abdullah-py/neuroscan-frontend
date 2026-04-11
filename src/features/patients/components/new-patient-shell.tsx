"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPatientAction, type PatientFormState } from "@/features/patients/actions/patients.actions";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

const initialState: PatientFormState = { message: "" };

const inputCls =
    "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all placeholder:text-slate-400";

const labelCls =
    "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

interface NewPatientShellProps {
    workspaceRole: WorkspaceRole | null;
}

export function NewPatientShell({ workspaceRole: _ }: NewPatientShellProps) {
    const [state, action, isPending] = useActionState(
        createPatientAction,
        initialState
    );
    const router = useRouter();
    const queryClient = useQueryClient();

    // On success: remove cached data entirely so initialData from the server render is used
    useEffect(() => {
        if (state.success) {
            queryClient.removeQueries({ queryKey: ["patients"] });
            router.push("/patients");
        }
    }, [state.success]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/patients"
                    className="p-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} className="text-neutral-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-black dark:text-white">
                        Add New Patient
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Register a patient in this workspace.
                    </p>
                </div>
            </div>

            {/* Form card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-8">
                <form action={action} className="space-y-6">
                    {/* Error banner */}
                    {state.message && !state.success && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{state.message}</span>
                        </div>
                    )}

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="first_name"
                                placeholder="Ahmed"
                                className={cn(
                                    inputCls,
                                    state.errors?.first_name &&
                                    "border-red-400 dark:border-red-600"
                                )}
                                required
                            />
                            {state.errors?.first_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {state.errors.first_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="last_name"
                                placeholder="Khan"
                                className={cn(
                                    inputCls,
                                    state.errors?.last_name &&
                                    "border-red-400 dark:border-red-600"
                                )}
                                required
                            />
                            {state.errors?.last_name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {state.errors.last_name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* DOB + Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="dob"
                                type="date"
                                className={cn(
                                    inputCls,
                                    state.errors?.dob && "border-red-400 dark:border-red-600"
                                )}
                                required
                            />
                            {state.errors?.dob && (
                                <p className="mt-1 text-xs text-red-500">
                                    {state.errors.dob}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="gender"
                                className={cn(
                                    inputCls,
                                    state.errors?.gender && "border-red-400 dark:border-red-600"
                                )}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {state.errors?.gender && (
                                <p className="mt-1 text-xs text-red-500">
                                    {state.errors.gender}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className={labelCls}>
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="phone_number"
                            type="tel"
                            placeholder="+923001234567"
                            className={cn(
                                inputCls,
                                state.errors?.phone_number &&
                                "border-red-400 dark:border-red-600"
                            )}
                            required
                        />
                        {state.errors?.phone_number && (
                            <p className="mt-1 text-xs text-red-500">
                                {state.errors.phone_number}
                            </p>
                        )}
                    </div>

                    {/* MRN + CNIC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>MRN</label>
                            <input
                                name="mrn"
                                placeholder="HOSP-001"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>CNIC</label>
                            <input
                                name="cnic"
                                placeholder="xxxxx-xxxxxxx-x"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* City + Address */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>City</label>
                            <input
                                name="city"
                                placeholder="Lahore"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Address</label>
                            <input
                                name="address"
                                placeholder="123 Main St, Block A"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-slate-800">
                        <Link
                            href="/patients"
                            className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        >
                            {isPending && (
                                <Loader2 size={14} className="animate-spin" />
                            )}
                            {isPending ? "Saving..." : "Register Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}