"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Upload, X,
  CheckCircle2, ChevronDown, Phone, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/providers/upload-provider";
import type { Patient } from "@/lib/types/patient.types";

type ModalityKey = "t1" | "t1ce" | "t2" | "flair";

const MODALITY_META: { key: ModalityKey; label: string; full: string; color: string }[] = [
  { key: "t1", label: "T1", full: "T1-weighted", color: "#60a5fa" },
  { key: "t1ce", label: "T1ce", full: "T1 Contrast Enhanced", color: "#a78bfa" },
  { key: "t2", label: "T2", full: "T2-weighted", color: "#34d399" },
  { key: "flair", label: "FLAIR", full: "FLAIR", color: "#fb923c" },
];

interface NewCaseShellProps {
  workspaceId: string;
  patients: Patient[];
  members: any[];
}

export function NewCaseShell({ patients, members }: NewCaseShellProps) {
  const [scans, setScans] = useState<Record<ModalityKey, File | null>>({
    t1: null, t1ce: null, t2: null, flair: null,
  });
  const inputRefs = useRef<Record<ModalityKey, HTMLInputElement | null>>({
    t1: null, t1ce: null, t2: null, flair: null,
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startUpload } = useUpload();

  const allScansReady = MODALITY_META.every(({ key }) => scans[key] !== null);

  // Patient search state
  const [phoneQuery, setPhoneQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const doctors = members.filter((m) => m.role === "DOCTOR");

  // Filter patients by phone number as the user types
  const trimmed = phoneQuery.trim();
  const filteredPatients = trimmed.length > 0
    ? patients.filter((p) => p.phone_number.replace(/\s+/g, "").includes(trimmed.replace(/\s+/g, "")))
    : [];

  const setScan = (key: ModalityKey, file: File | null) =>
    setScans((prev) => ({ ...prev, [key]: file }));

  const inputCls =
    "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all";
  const labelCls =
    "text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allScansReady || !selectedPatient) return;

    const fd = new FormData(e.currentTarget);
    const priority = fd.get("priority") as string ?? "normal";
    const assignedToMemberId = fd.get("assigned_to_member_id") as string ?? "";
    const notes = fd.get("notes") as string ?? "";

    // Files are passed in MODALITY_ORDER: [t1, t1ce, t2, flair] → indices 0, 1, 2, 3
    const orderedFiles = MODALITY_META.map(({ key }) => scans[key]!);

    startUpload(orderedFiles, {
      patientId: selectedPatient.id,
      priority,
      assignedToMemberId,
      notes,
    });
    queryClient.removeQueries({ queryKey: ["cases"] });
    router.push("/cases");
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

          {/* Patient - phone search then select */}
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
                {/* Step 1 - search by phone */}
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

                {/* Step 2 - results */}
                {trimmed.length > 0 && (
                  filteredPatients.length === 0 ? (
                    <p className="text-xs text-slate-400 px-1">
                      No patients match that phone number.
                    </p>
                  ) : filteredPatients.length === 1 ? (
                    // Single match - clickable card to confirm
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
                    // Multiple matches - dropdown
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
                          {filteredPatients.length} patients found - select one
                        </option>
                        {filteredPatients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                            {p.mrn ? ` - MRN ${p.mrn}` : ""} · {p.phone_number}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Priority</label>
              <div className="relative">
                <select name="priority" defaultValue="normal" className={cn(inputCls, "appearance-none")}>
                  <option value="low">Low - Routine</option>
                  <option value="normal">Normal - Standard</option>
                  <option value="high">High - Urgent</option>
                  <option value="urgent">Urgent - Emergency</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Assign To</label>
              <div className="relative">
                <select name="assigned_to_member_id" className={cn(inputCls, "appearance-none")}>
                  <option value="">Unassigned</option>
                  {doctors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user_name || m.user_email || "Unknown"}
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

          {/* MRI Scans - 4 individual modality slots */}
          <div>
            <label className={labelCls}>
              MRI Scans <span className="text-red-500">*</span>{" "}
              <span className="text-neutral-400 normal-case font-normal">
                (one file per modality)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODALITY_META.map(({ key, label, full, color }) => {
                const file = scans[key];
                return (
                  <div key={key}>
                    {/* Hidden file input */}
                    <input
                      ref={(el) => { inputRefs.current[key] = el; }}
                      type="file"
                      accept=".nii,.nii.gz,.dcm,.nrrd,.mha,.mhd"
                      className="hidden"
                      onChange={(e) => setScan(key, e.target.files?.[0] ?? null)}
                    />

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => inputRefs.current[key]?.click()}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRefs.current[key]?.click(); } }}
                      className={cn(
                        "w-full rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
                        file
                          ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10"
                          : "border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      {/* Modality badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                        >
                          {label}
                        </span>
                        {file ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setScan(key, null); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        ) : (
                          <Upload size={13} className="text-slate-400" />
                        )}
                      </div>

                      {file ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {file.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {full}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Click to select file
                          </p>
                        </div>
                      )}

                      {file && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-3">
              {MODALITY_META.map(({ key, color }) => (
                <div
                  key={key}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: scans[key] ? color : "#e2e8f0" }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {MODALITY_META.filter(({ key }) => scans[key]).length}/4 modalities selected
            </p>
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
              disabled={!allScansReady || !selectedPatient}
              className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}