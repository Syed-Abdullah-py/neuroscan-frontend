"use client";

import { useActionState, useState, useRef, startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Upload, FileText, X,
  Loader2, AlertCircle, CheckCircle2, ChevronDown, Phone, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCaseAction, type CaseFormState } from "@/features/cases/actions/case.actions";
import type { Patient } from "@/lib/types/patient.types";

const initialState: CaseFormState = { message: "" };

interface NewCaseShellProps {
  workspaceId: string;
  patients: Patient[];
  members: any[];
}

export function NewCaseShell({ patients, members }: NewCaseShellProps) {
  const [state, action, isPending] = useActionState(createCaseAction, initialState);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Patient search state
  const [phoneQuery, setPhoneQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // On success: remove cached data entirely so initialData from the server render is used
  useEffect(() => {
    if (state.success) {
      queryClient.removeQueries({ queryKey: ["cases"] });
      router.push("/cases");
    }
  }, [state.success]);

  const doctors = members.filter(
    (m) => m.role === "DOCTOR" || m.role === "ADMIN" || m.role === "OWNER"
  );

  // Filter patients by phone number as the user types
  const trimmed = phoneQuery.trim();
  const filteredPatients = trimmed.length > 0
    ? patients.filter((p) => p.phone_number.replace(/\s+/g, "").includes(trimmed.replace(/\s+/g, "")))
    : [];

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected);
    setFiles((prev) => {
      const combined = [...prev, ...arr].slice(0, 4);
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const inputCls =
    "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all";
  const labelCls =
    "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

  // Inject files into form action — useActionState doesn't support
  // files directly, so we build FormData manually
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length !== 4 || !selectedPatient) return;

    const fd = new FormData(e.currentTarget);
    // Ensure the selected patient id is in the form data
    fd.set("patient_id", selectedPatient.id);
    // Remove any old scan entries, add the real File objects
    fd.delete("scans");
    files.forEach((f) => fd.append("scans", f));
    // Wrap in startTransition so isPending updates correctly
    startTransition(() => {
      action(fd);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/cases"
          className="p-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} className="text-neutral-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">New Case</h1>
          <p className="text-sm text-neutral-500">Create a diagnostic case with 4 MRI scans.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {state.message && !state.success && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {state.message}
            </div>
          )}

          {/* Patient — phone search then select */}
          <div>
            <label className={labelCls}>
              Patient <span className="text-red-500">*</span>
            </label>

            {/* Hidden input carries the selected id into FormData */}
            <input type="hidden" name="patient_id" value={selectedPatient?.id ?? ""} />

            {patients.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-slate-700 text-center">
                <p className="text-sm text-neutral-500 mb-3">
                  No patients found. Add one first.
                </p>
                <Link
                  href="/patients/new"
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  Add Patient →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Step 1 — search by phone */}
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Search by phone number…"
                    value={phoneQuery}
                    onChange={(e) => {
                      setPhoneQuery(e.target.value);
                      setSelectedPatient(null);
                    }}
                    className={cn(inputCls, "pl-10")}
                  />
                </div>

                {/* Step 2 — results */}
                {trimmed.length > 0 && (
                  filteredPatients.length === 0 ? (
                    <p className="text-xs text-slate-400 px-1">
                      No patients match that phone number.
                    </p>
                  ) : filteredPatients.length === 1 ? (
                    // Single match — clickable card to confirm
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(filteredPatients[0])}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                        selectedPatient?.id === filteredPatients[0].id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <UserCheck size={16} className={selectedPatient?.id === filteredPatients[0].id ? "text-blue-500" : "text-slate-400"} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {filteredPatients[0].first_name} {filteredPatients[0].last_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {filteredPatients[0].phone_number}
                          {filteredPatients[0].mrn ? ` · MRN ${filteredPatients[0].mrn}` : ""}
                        </p>
                      </div>
                      {selectedPatient?.id === filteredPatients[0].id && (
                        <CheckCircle2 size={16} className="text-blue-500 ml-auto shrink-0" />
                      )}
                    </button>
                  ) : (
                    // Multiple matches — dropdown
                    <div className="relative">
                      <select
                        className={inputCls}
                        value={selectedPatient?.id ?? ""}
                        onChange={(e) => {
                          const p = filteredPatients.find((x) => x.id === e.target.value) ?? null;
                          setSelectedPatient(p);
                        }}
                      >
                        <option value="">
                          {filteredPatients.length} patients found — select one
                        </option>
                        {filteredPatients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                            {p.mrn ? ` — MRN ${p.mrn}` : ""} · {p.phone_number}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                  )
                )}

                {/* Selected patient confirmation badge */}
                {selectedPatient && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 truncate">
                      {selectedPatient.first_name} {selectedPatient.last_name} selected
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSelectedPatient(null); setPhoneQuery(""); }}
                      className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority + Assign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Priority</label>
              <div className="relative">
                <select name="priority" defaultValue="normal" className={inputCls}>
                  <option value="low">Low — Routine</option>
                  <option value="normal">Normal — Standard</option>
                  <option value="high">High — Urgent</option>
                  <option value="urgent">Urgent — Emergency</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Assign To</label>
              <div className="relative">
                <select name="assigned_to_member_id" className={inputCls}>
                  <option value="">Unassigned</option>
                  {doctors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user_name || m.user_email || "Unknown"} ({m.role})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Clinical Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Add clinical observations or instructions for the assigned doctor..."
              className={cn(inputCls, "resize-none")}
            />
          </div>

          {/* File upload */}
          <div>
            <label className={labelCls}>
              MRI Scans <span className="text-red-500">*</span>{" "}
              <span className="text-neutral-400 normal-case font-normal">
                (exactly 4 files)
              </span>
            </label>

            {/* Drop zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                files.length === 4
                  ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
              onClick={() => files.length < 4 && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".nii,.dcm,.nrrd,.mha,.mhd,.gz"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {files.length === 4 ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    4 files ready
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-slate-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Click to upload MRI scans
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      .nii, .nii.gz, .dcm, .nrrd, .mha, .mhd — 500MB max each
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {files.length}/4 selected
                  </span>
                </div>
              )}
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-slate-400 shrink-0" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {f.name}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">
                        {(f.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-neutral-100 dark:border-slate-800">
            <Link
              href="/cases"
              className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 text-sm font-semibold text-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || files.length !== 4 || !selectedPatient}
              className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Creating..." : "Create Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}