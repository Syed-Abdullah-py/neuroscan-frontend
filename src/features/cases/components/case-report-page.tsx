"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Printer, AlertCircle } from "lucide-react";
import type { Case } from "@/lib/types/case.types";
import type { Patient } from "@/lib/types/patient.types";

// ── Types ──────────────────────────────────────────────────────────────────

interface Props {
    caseItem: Case;
    patient: Patient | null;
}

type SliceImages = { orig: string | null; masked: string | null };
type ModKey = "t1" | "t1ce" | "t2" | "flair";

const MODALITIES: { key: ModKey; label: string }[] = [
    { key: "t1",   label: "T1" },
    { key: "t1ce", label: "T1ce" },
    { key: "t2",   label: "T2" },
    { key: "flair",label: "FLAIR" },
];

const SURVIVAL_MAP = {
    Short: { label: "Short-term Survival",    range: "≤ 300 days",    color: "#dc2626", bar: "33%" },
    Mid:   { label: "Intermediate Survival",  range: "301–450 days",  color: "#d97706", bar: "66%" },
    Long:  { label: "Extended Survival",      range: "> 450 days",    color: "#059669", bar: "100%" },
} as const;

const PRIORITY_COLOR: Record<string, string> = {
    urgent: "#dc2626", high: "#ea580c", normal: "#2563eb", low: "#64748b",
};
const STATUS_COLOR: Record<string, string> = {
    PENDING: "#d97706", PROCESSING: "#2563eb", REVIEWED: "#059669",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function calcAge(dob: string) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--;
    return age;
}

function fmtDate(d: string | null | undefined) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ── Main component ─────────────────────────────────────────────────────────

export function CaseReportPage({ caseItem, patient }: Props) {
    const [slices, setSlices] = useState<Record<ModKey, SliceImages>>({
        t1: { orig: null, masked: null },
        t1ce: { orig: null, masked: null },
        t2: { orig: null, masked: null },
        flair: { orig: null, masked: null },
    });
    const [loadState, setLoadState] = useState<"loading" | "done" | "error">("loading");
    const [reportDate, setReportDate] = useState<string>("");
    const [reportTime, setReportTime] = useState<string>("");
    const objectUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        const now = new Date();
        setReportDate(fmtDate(now.toISOString()) ?? "");
        setReportTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, []);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => { objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u)); };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const JSZip = (await import("jszip")).default;

                const results = await Promise.allSettled(
                    MODALITIES.map(async ({ key }) => {
                        const res = await fetch(`/api/cases/${caseItem.id}/slices/${key}/zip`);
                        if (!res.ok) throw new Error(`${key} zip ${res.status}`);
                        const buf = await res.arrayBuffer();
                        const zip = await JSZip.loadAsync(buf);

                        // Original PNGs sorted (exclude masked)
                        const origFiles = Object.keys(zip.files)
                            .filter(n => n.endsWith(".png") && !n.includes("_m."))
                            .sort();
                        if (!origFiles.length) return { key, orig: null, masked: null };

                        const midName = origFiles[Math.floor(origFiles.length / 2)];
                        const maskedName = midName.replace(".png", "_m.png");

                        const origBlob = await zip.files[midName].async("blob");
                        const origUrl = URL.createObjectURL(origBlob);
                        objectUrlsRef.current.push(origUrl);

                        let maskedUrl: string | null = null;
                        if (zip.files[maskedName]) {
                            const mBlob = await zip.files[maskedName].async("blob");
                            maskedUrl = URL.createObjectURL(mBlob);
                            objectUrlsRef.current.push(maskedUrl);
                        }

                        return { key, orig: origUrl, masked: maskedUrl };
                    })
                );

                if (cancelled) return;

                const next: Record<ModKey, SliceImages> = {
                    t1: { orig: null, masked: null },
                    t1ce: { orig: null, masked: null },
                    t2: { orig: null, masked: null },
                    flair: { orig: null, masked: null },
                };
                for (const r of results) {
                    if (r.status === "fulfilled" && r.value) {
                        next[r.value.key] = { orig: r.value.orig, masked: r.value.masked };
                    }
                }
                setSlices(next);
                setLoadState("done");
            } catch {
                if (!cancelled) setLoadState("error");
            }
        }

        load();
        return () => { cancelled = true; };
    }, [caseItem.id]);

    const patientName = patient
        ? `${patient.first_name} ${patient.last_name}`
        : [caseItem.patient_first_name, caseItem.patient_last_name].filter(Boolean).join(" ") || "Unknown Patient";

    const age = patient?.dob ? calcAge(patient.dob) : null;
    const priority = (caseItem.priority ?? "normal").toLowerCase();
    const survival = caseItem.survival_prediction ? SURVIVAL_MAP[caseItem.survival_prediction] : null;
    const caseRef = caseItem.id.slice(-8).toUpperCase();

    const anySliceLoaded = Object.values(slices).some(s => s.orig);

    return (
        <>
            {/* Global styles — screen layout + print rules */}
            <style>{`
                * { box-sizing: border-box; }
                body { margin: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; }

                .report-toolbar {
                    position: sticky; top: 0; z-index: 50;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 10px 24px;
                    background: #0f172a;
                    border-bottom: 1px solid #1e293b;
                }
                .report-wrap {
                    max-width: 900px; margin: 32px auto 64px; padding: 0 16px;
                }
                .report-doc {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 40px rgba(0,0,0,0.15);
                }

                .scan-img {
                    width: 100%; aspect-ratio: 1/1; object-fit: cover;
                    background: #000; display: block; border-radius: 4px;
                }

                @media print {
                    @page { size: A4; margin: 14mm 12mm; }
                    body { background: #fff; }
                    .report-toolbar { display: none !important; }
                    .report-wrap { max-width: none; margin: 0; padding: 0; }
                    .report-doc { box-shadow: none; border-radius: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            {/* Toolbar (hidden on print) */}
            <div className="report-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                    </div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>NeuroScan</span>
                    <span style={{ color: "#475569", fontSize: 12 }}>/ Clinical Report</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {loadState === "loading" && (
                        <span style={{ color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            Loading scans...
                        </span>
                    )}
                    <button
                        onClick={() => window.print()}
                        disabled={loadState === "loading"}
                        style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "8px 18px", borderRadius: 10,
                            background: loadState === "loading" ? "#334155" : "#2563eb",
                            color: "#fff", border: "none", cursor: loadState === "loading" ? "not-allowed" : "pointer",
                            fontSize: 13, fontWeight: 600,
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        {loadState === "loading" ? "Loading scans…" : "Print / Save as PDF"}
                    </button>
                </div>
            </div>

            {/* Report document */}
            <div className="report-wrap">
                {loadState === "error" && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Scan images could not be loaded. The report text is still complete.
                    </div>
                )}

                <div className="report-doc">

                    {/* ══ Header ══ */}
                    <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a3150 50%, #0f172a 100%)", padding: "28px 36px 22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                                </div>
                                <div>
                                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "-0.3px" }}>NeuroScan</div>
                                    <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>AI-Assisted Radiology Platform</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", textTransform: "uppercase" }}>Clinical Radiology Report</div>
                                <div style={{ color: "#64748b", fontSize: 10, marginTop: 4, fontFamily: "monospace" }}>REF: NSR-{caseRef}</div>
                                <div style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{reportDate} · {reportTime}</div>
                            </div>
                        </div>

                        {/* Status strip */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
                            <Pill label={caseItem.status} color={STATUS_COLOR[caseItem.status] ?? "#64748b"} />
                            <Pill label={`${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`} color={PRIORITY_COLOR[priority] ?? "#64748b"} />
                            {caseItem.assigned_to_name && (
                                <Pill label={`Dr. ${caseItem.assigned_to_name}`} color="#475569" />
                            )}
                        </div>
                    </div>

                    {/* ══ Body ══ */}
                    <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Patient + Case info */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <Section title="Patient Information" color="#3b82f6">
                                {patient?.mrn && <InfoRow label="MRN" value={patient.mrn} mono />}
                                <InfoRow label="Full Name" value={patientName} bold />
                                {fmtDate(patient?.dob) && <InfoRow label="Date of Birth" value={fmtDate(patient?.dob)!} />}
                                {age !== null && <InfoRow label="Age" value={`${age} years`} />}
                                {patient?.gender && <InfoRow label="Gender" value={patient.gender} />}
                                {patient?.cnic && <InfoRow label="ID / CNIC" value={patient.cnic} mono />}
                                {patient?.phone_number && <InfoRow label="Phone" value={patient.phone_number} />}
                                {patient?.city && <InfoRow label="City" value={patient.city} />}
                                {patient?.address && <InfoRow label="Address" value={patient.address} />}
                            </Section>

                            <Section title="Case Details" color="#7c3aed">
                                <InfoRow label="Reference" value={`NSR-${caseRef}`} mono bold />
                                <InfoRow label="Department" value="Radiology — Neuro-Oncology" />
                                <InfoRow label="Study Date" value={fmtDate(caseItem.created_at)!} />
                                {fmtDate(caseItem.verdict_updated_at) && <InfoRow label="Report Date" value={fmtDate(caseItem.verdict_updated_at)!} />}
                                <InfoRow label="Status" value={caseItem.status} />
                                <InfoRow label="Priority" value={`${priority.charAt(0).toUpperCase() + priority.slice(1)}`} />
                                <InfoRow label="Modalities" value="T1 · T1ce · T2 · FLAIR" />
                                {caseItem.assigned_to_name && <InfoRow label="Physician" value={`Dr. ${caseItem.assigned_to_name}`} bold />}
                            </Section>
                        </div>

                        <Divider />

                        {/* ══ 2D Scan Images ══ */}
                        <Section title="MRI Scan Images — Axial Slices" color="#0ea5e9">
                            {loadState === "loading" ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                                    {MODALITIES.map(({ key }) => (
                                        <ScanPlaceholder key={key} label={key.toUpperCase()} loading />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* Row 1: Original */}
                                    <div style={{ marginBottom: 6 }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Original Scans</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                                            {MODALITIES.map(({ key, label }) => (
                                                <div key={key}>
                                                    {slices[key].orig
                                                        ? <img src={slices[key].orig!} alt={`${label} scan`} className="scan-img" />
                                                        : <ScanPlaceholder label={label} />}
                                                    <div style={{ textAlign: "center", marginTop: 4, fontSize: 10, fontWeight: 700, color: "#0ea5e9" }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Row 2: Segmentation overlay */}
                                    {MODALITIES.some(({ key }) => slices[key].masked) && (
                                        <div style={{ marginTop: 14 }}>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>With Segmentation Overlay</div>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                                                {MODALITIES.map(({ key, label }) => (
                                                    <div key={key}>
                                                        {slices[key].masked
                                                            ? <img src={slices[key].masked!} alt={`${label} segmentation`} className="scan-img" />
                                                            : slices[key].orig
                                                                ? <img src={slices[key].orig!} alt={`${label} scan`} className="scan-img" />
                                                                : <ScanPlaceholder label={label} />}
                                                        <div style={{ textAlign: "center", marginTop: 4, fontSize: 10, fontWeight: 700, color: "#0ea5e9" }}>{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Segmentation legend */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Legend</span>
                                        {[
                                            { label: "Necrotic Core", color: "#dc2626" },
                                            { label: "Edema", color: "#ca8a04" },
                                            { label: "Active Tumor", color: "#2563eb" },
                                        ].map(({ label, color }) => (
                                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                                                <span style={{ fontSize: 10, color: "#475569" }}>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </Section>

                        <Divider />

                        {/* ══ AI Analysis ══ */}
                        <Section title="AI Analysis — Survival Prognosis" color="#10b981">
                            {survival ? (
                                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                                    {/* Prognosis card */}
                                    <div style={{ flexShrink: 0, minWidth: 160, border: `1.5px solid ${survival.color}33`, borderRadius: 10, padding: "16px 20px", background: `${survival.color}08`, textAlign: "center" }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Survival Prognosis</div>
                                        <div style={{ fontSize: 17, fontWeight: 800, color: survival.color, lineHeight: 1.2 }}>{survival.label}</div>
                                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, fontFamily: "monospace" }}>{survival.range}</div>
                                        <div style={{ marginTop: 12, height: 6, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
                                            <div style={{ height: "100%", borderRadius: 99, background: survival.color, width: survival.bar }} />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 8, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
                                            <span>Short</span><span>Mid</span><span>Long</span>
                                        </div>
                                    </div>
                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.65, marginBottom: 12 }}>
                                            Survival category estimated from tumor morphology, enhancement pattern, and multi-parametric MRI features using the integrated ML model.
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {[
                                                { label: "Short", range: "≤ 300 days", color: "#dc2626" },
                                                { label: "Mid",   range: "301–450 days", color: "#d97706" },
                                                { label: "Long",  range: "> 450 days",   color: "#059669" },
                                            ].map(c => (
                                                <div key={c.label} style={{
                                                    padding: "6px 12px", borderRadius: 8,
                                                    background: c.color === survival.color ? `${c.color}15` : "#f8fafc",
                                                    border: `1px solid ${c.color === survival.color ? c.color + "44" : "#e2e8f0"}`,
                                                    fontSize: 10, color: c.color === survival.color ? c.color : "#64748b",
                                                    fontWeight: c.color === survival.color ? 700 : 500,
                                                }}>
                                                    {c.label}: {c.range}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #e2e8f0", textAlign: "center" }}>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Survival prediction not available for this case.</p>
                                </div>
                            )}
                        </Section>

                        <Divider />

                        {/* ══ Clinical Notes ══ */}
                        <Section title="Clinical Notes" color="#f59e0b">
                            {caseItem.notes ? (
                                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "14px 16px" }}>
                                    <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>{caseItem.notes}</p>
                                </div>
                            ) : (
                                <EmptyState text="No clinical notes provided." />
                            )}
                        </Section>

                        <Divider />

                        {/* ══ Radiologist Assessment ══ */}
                        <Section title="Radiologist's Assessment" color="#7c3aed">
                            {caseItem.verdict ? (
                                <div>
                                    {/* Byline */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        {caseItem.assigned_to_name && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>Dr. {caseItem.assigned_to_name}</span>
                                                <span style={{ fontSize: 9, background: "#ede9fe", color: "#6d28d9", padding: "2px 7px", borderRadius: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Radiologist</span>
                                            </div>
                                        )}
                                        {fmtDate(caseItem.verdict_updated_at) && (
                                            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>
                                                {fmtDate(caseItem.verdict_updated_at)}
                                            </span>
                                        )}
                                    </div>
                                    {/* Verdict text */}
                                    <div style={{ borderLeft: "3px solid #7c3aed", paddingLeft: 14, paddingTop: 8, paddingBottom: 8 }}>
                                        <p style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{caseItem.verdict}</p>
                                    </div>
                                    {/* Verified */}
                                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: "#059669" }}>Assessment completed and recorded</span>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState text="Radiologist assessment pending. Report will be updated upon completion." />
                            )}
                        </Section>

                        <Divider />

                        {/* ══ Signature block ══ */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 36 }}>Reporting Physician Signature</div>
                                <div style={{ height: 1, background: "#cbd5e1", marginBottom: 6 }} />
                                {caseItem.assigned_to_name && <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>Dr. {caseItem.assigned_to_name}</div>}
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>Radiologist</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 36 }}>Report Generated</div>
                                <div style={{ height: 1, background: "#cbd5e1", marginBottom: 6 }} />
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{reportDate}</div>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>{reportTime} — NeuroScan Platform</div>
                            </div>
                        </div>
                    </div>

                    {/* ══ Footer ══ */}
                    <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "14px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <p style={{ fontSize: 9, color: "#94a3b8", maxWidth: 540, lineHeight: 1.5, margin: 0 }}>
                            <strong style={{ color: "#64748b" }}>Disclaimer:</strong> AI-derived findings are probabilistic estimates intended to support clinical judgment. All diagnoses must be verified by a licensed medical professional. This document is a confidential medical record.
                        </p>
                        <div style={{ fontSize: 9, color: "#cbd5e1", textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>
                            NSR-{caseRef}<br />Confidential
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 3, height: 16, borderRadius: 2, background: color, flexShrink: 0 }} />
                <h2 style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</h2>
                <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
    return (
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0, minWidth: 80 }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: bold ? 700 : 500, color: bold ? "#1e293b" : "#475569", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>{value}</span>
        </div>
    );
}

function Pill({ label, color }: { label: string; color: string }) {
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 99,
            background: `${color}22`, border: `1px solid ${color}44`,
            fontSize: 9, fontWeight: 700, color: "#e2e8f0",
            textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
            {label}
        </span>
    );
}

function Divider() {
    return <div style={{ height: 1, background: "linear-gradient(to right, transparent, #e2e8f0, transparent)" }} />;
}

function EmptyState({ text }: { text: string }) {
    return (
        <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #e2e8f0" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", margin: 0 }}>{text}</p>
        </div>
    );
}

function ScanPlaceholder({ label, loading }: { label: string; loading?: boolean }) {
    return (
        <div style={{ aspectRatio: "1/1", background: "#0f172a", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading ? (
                <svg style={{ animation: "spin 1s linear infinite", color: "#334155" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            )}
            <span style={{ fontSize: 9, color: "#334155", fontWeight: 600 }}>{label}</span>
        </div>
    );
}
