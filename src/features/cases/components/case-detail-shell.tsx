"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "framer-motion";
import {
    ArrowLeft, Brain, User, FileText, ShieldAlert,
    Calendar, Loader2, AlertCircle, ScanLine, Box,
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LayoutGrid,
    Maximize2, Minimize2, Play, Pause, Settings2,
    SlidersHorizontal, CheckCircle2, X,
    Phone, MapPin, CreditCard, Stethoscope, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCase, useUpdateCase } from "@/features/cases/hooks/use-cases";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Case, CaseStatus } from "@/lib/types/case.types";
import type { Patient } from "@/lib/types/patient.types";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

// ── Dynamic imports (SSR disabled) ────────────────────────────────────────

const ThreeDViewer = dynamic(
    () => import("@/features/admin/components/three-d-viewer").then((m) => m.ThreeDViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center" style={{ background: "#050d18" }}>
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        ),
    }
);

const ModalityViewer = dynamic(
    () => import("./modality-viewer").then((m) => m.ModalityViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full items-center justify-center" style={{ background: "#050d18" }}>
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        ),
    }
);

const ModalityGridViewer = dynamic(
    () => import("./modality-viewer").then((m) => m.ModalityGridViewer),
    { ssr: false }
);

const ModalityContactSheet = dynamic(
    () => import("./modality-viewer").then((m) => m.ModalityContactSheet),
    { ssr: false }
);

// ── Constants ──────────────────────────────────────────────────────────────

type TabKey = "t1" | "t1ce" | "t2" | "flair" | "3d" | "grid";

const MODALITY_TABS: { key: Exclude<TabKey, "3d">; label: string; fullLabel: string }[] = [
    { key: "t1", label: "T1", fullLabel: "T1-weighted" },
    { key: "t1ce", label: "T1ce", fullLabel: "T1 Contrast Enhanced" },
    { key: "t2", label: "T2", fullLabel: "T2-weighted" },
    { key: "flair", label: "FLAIR", fullLabel: "FLAIR" },
];

const MASK_LEGEND = [
    { label: "Necrotic Core", color: "#dc2828" },
    { label: "Edema", color: "#fac814" },
    { label: "Active Tumor", color: "#3b82f6" },
];

const PRIORITY_STYLES: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
    normal: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800",
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_COLORS: Record<CaseStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    REVIEWED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const BRATS_BASE = "/brats-slices/BraTS20_Training_001";
const MODALITY_ORDER = ["t1", "t1ce", "t2", "flair"] as const;

// ── Animation ──────────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

// ── Props ──────────────────────────────────────────────────────────────────

interface CaseDetailShellProps {
    caseItem: Case;
    workspaceId: string;
    workspaceRole: WorkspaceRole | null;
    membershipId: string | null;
    patient: Patient | null;
    user: { name: string; email: string; globalRole: string };
}

// ── Module-level 30-minute buffer cache (survives unmount/remount) ─────────

const BUFFER_CACHE_TTL = 30 * 60 * 1000;

type CachedScanData = {
    scans: (ArrayBuffer | null)[];
    seg: ArrayBuffer | null;
    slicesPrefetched: boolean;
    cachedAt: number;
};

const _scanBufferCache = new Map<string, CachedScanData>();

function getCachedBuffers(caseId: string): CachedScanData | null {
    const entry = _scanBufferCache.get(caseId);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > BUFFER_CACHE_TTL) {
        _scanBufferCache.delete(caseId);
        return null;
    }
    return entry;
}

// ── ViewerPanel - isolated so slice ticks don't re-render sidebar ──────────

const ViewerPanel = memo(function ViewerPanel({
    activeTab,
    caseId,
    scanFiles,
    authHeaders,
}: {
    activeTab: TabKey;
    caseId: string;
    scanFiles: string[];
    authHeaders?: HeadersInit;
}) {
    const is3D = activeTab === "3d";
    const isGrid = activeTab === "grid";
    const is2D = !is3D && !isGrid;
    const activeMeta = MODALITY_TABS.find(t => t.key === activeTab);

    const scanUrls = MODALITY_ORDER.map((_, i) =>
        scanFiles[i] ? `/api/cases/${caseId}/scans/${i}` : null
    );
    const scanNames = scanFiles.map((ref) => ref.split("/").pop() ?? "scan.nii");
    const tabIndex = MODALITY_ORDER.indexOf(activeTab as typeof MODALITY_ORDER[number]);
    const activeScanName = is2D && tabIndex >= 0 ? scanNames[tabIndex] : "scan.nii";
    const hasScan = is2D && tabIndex >= 0 && !!scanFiles[tabIndex];

    // ── Unified pre-fetch: 4 scans + mesh.glb + seg.nii + PNG slices ────────
    type FetchStatus = "pending" | "downloading" | "done" | "error";
    type FileFetchState = { label: string; color: string; sizeMb: number; progress: number; status: FetchStatus };
    type SliceFetchState = { done: number; status: "idle" | "fetching" | "done" };

    const FETCH_COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#fb923c", "#e879f9", "#38bdf8"];
    const FETCH_LABELS = ["scan_0_slices", "scan_1_slices", "scan_2_slices", "scan_3_slices", "mesh.glb", "seg.nii"];
    const SLICE_TOTAL = 155;
    const SLICE_MODS_ORDER = ["t1", "t1ce", "t2", "flair"] as const;
    const SLICE_MOD_LABELS = ["T1", "T1ce", "T2", "FLAIR"];
    const FETCH_URLS = [
        ...scanUrls,
        `/api/cases/${caseId}/mesh`,
        `/api/cases/${caseId}/seg`,
    ];

    // Initialise from cache immediately so we never re-download within the TTL
    const cached = getCachedBuffers(caseId);
    const [scanBuffers, setScanBuffers] = useState<(ArrayBuffer | null)[]>(
        () => cached?.scans ?? [null, null, null, null]
    );
    const [segBuffer, setSegBuffer] = useState<ArrayBuffer | null>(
        () => cached?.seg ?? null
    );
    const [fetchStates, setFetchStates] = useState<FileFetchState[]>(() =>
        cached
            ? FETCH_LABELS.map((label, i) => ({
                label, color: FETCH_COLORS[i], sizeMb: 0, progress: 100, status: "done" as FetchStatus,
            }))
            : FETCH_LABELS.map((label, i) => ({
                label, color: FETCH_COLORS[i], sizeMb: 0, progress: 0,
                status: (i < 4 ? (scanFiles[i] ? "pending" : "done") : "pending") as FetchStatus,
            }))
    );
    const [sliceStates, setSliceStates] = useState<SliceFetchState[]>(() =>
        cached?.slicesPrefetched
            ? SLICE_MODS_ORDER.map(() => ({ done: SLICE_TOTAL, status: "done" as const }))
            : SLICE_MODS_ORDER.map(() => ({ done: 0, status: "idle" as const }))
    );
    const [fetchToastCollapsed, setFetchToastCollapsed] = useState(false);
    const [fetchToastDismissed, setFetchToastDismissed] = useState(() => !!cached);
    const [viewMode, setViewMode] = useState<"slider" | "contact">("slider");

    const patchFetch = useCallback((i: number, patch: Partial<FileFetchState>) => {
        setFetchStates(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s));
    }, []);
    const patchSlice = useCallback((modIdx: number, patch: Partial<SliceFetchState>) => {
        setSliceStates(prev => prev.map((s, j) => j === modIdx ? { ...s, ...patch } : s));
    }, []);

    const sliceControllersRef = useRef<AbortController[]>([]);
    // Accumulate buffers during download so we can write them to cache atomically
    const pendingBuffersRef = useRef<{ scans: (ArrayBuffer | null)[]; seg: ArrayBuffer | null }>({
        scans: cached?.scans ?? [null, null, null, null],
        seg: cached?.seg ?? null,
    });

    // Phase 1 - download main files (scans + mesh + seg); skipped when cache is fresh
    useEffect(() => {
        if (!scanFiles.length) return;

        // If cache is still valid for this caseId, nothing to fetch
        if (getCachedBuffers(caseId)) return;

        setScanBuffers([null, null, null, null]);
        setSegBuffer(null);
        pendingBuffersRef.current = { scans: [null, null, null, null], seg: null };
        setFetchStates(FETCH_LABELS.map((label, i) => ({
            label, color: FETCH_COLORS[i], sizeMb: 0, progress: 0,
            status: (i < 4 ? (scanFiles[i] ? "pending" : "done") : "pending") as FetchStatus,
        })));
        setSliceStates(SLICE_MODS_ORDER.map(() => ({ done: 0, status: "idle" as const })));
        setFetchToastDismissed(false);

        sliceControllersRef.current.forEach(c => c.abort());

        const fileControllers = FETCH_URLS.map(() => new AbortController());

        FETCH_URLS.forEach((url, i) => {
            if (!url) return;
            patchFetch(i, { status: "downloading" });
            fetch(url, { signal: fileControllers[i].signal, headers: authHeaders })
                .then(res => {
                    if (!res.ok) throw new Error(`${res.status}`);
                    const total = parseInt(res.headers.get("Content-Length") ?? "0", 10);
                    if (total > 0) patchFetch(i, { sizeMb: parseFloat((total / 1024 / 1024).toFixed(1)) });
                    const reader = res.body!.getReader();
                    const chunks: Uint8Array[] = [];
                    let received = 0;
                    const read = (): Promise<ArrayBuffer> =>
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                const buf = new Uint8Array(received);
                                let off = 0;
                                for (const c of chunks) { buf.set(c, off); off += c.length; }
                                return buf.buffer;
                            }
                            chunks.push(value!);
                            received += value!.length;
                            if (total > 0) patchFetch(i, { progress: Math.round((received / total) * 100) });
                            return read();
                        });
                    return read();
                })
                .then(buf => {
                    if (i < 4) {
                        pendingBuffersRef.current.scans[i] = buf;
                        setScanBuffers(prev => { const next = [...prev]; next[i] = buf; return next; });
                    } else if (i === 5) {
                        pendingBuffersRef.current.seg = buf;
                        setSegBuffer(buf);
                    }
                    patchFetch(i, { progress: 100, status: "done" });
                })
                .catch(err => { if (err?.name !== "AbortError") patchFetch(i, { status: "error" }); });
        });

        return () => {
            fileControllers.forEach(c => c.abort());
            sliceControllersRef.current.forEach(c => c.abort());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [caseId]);

    const allMainDone = fetchStates.every(s => s.status === "done" || s.status === "error");
    const allSlicesDone = sliceStates.every(s => s.status === "done" || s.status === "idle");
    const allFetchDone = allMainDone && allSlicesDone;

    // Write main buffers to cache once all files are downloaded
    useEffect(() => {
        if (!allMainDone || getCachedBuffers(caseId)) return;
        _scanBufferCache.set(caseId, {
            scans: pendingBuffersRef.current.scans,
            seg: pendingBuffersRef.current.seg,
            slicesPrefetched: false,
            cachedAt: Date.now(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allMainDone, caseId]);

    // Phase 2 - PNG slice pre-fetch via proxy, starts immediately after main files are done.
    // Uses the same URLs as ModalityContactSheet <img> tags so the browser cache is shared.
    useEffect(() => {
        if (!allMainDone || !scanFiles.length) return;

        // Slices already pre-fetched and cached — nothing to do
        const entry = _scanBufferCache.get(caseId);
        if (entry?.slicesPrefetched) return;

        sliceControllersRef.current.forEach(c => c.abort());
        const controllers = SLICE_MODS_ORDER.map(() => new AbortController());
        sliceControllersRef.current = controllers;

        SLICE_MODS_ORDER.forEach((mod, modIdx) => {
            const sig = controllers[modIdx].signal;
            patchSlice(modIdx, { status: "fetching", done: 0 });
            (async () => {
                let done = 0;
                const CONCURRENT = 6;
                for (let start = 0; start < SLICE_TOTAL && !sig.aborted; start += CONCURRENT) {
                    const end = Math.min(start + CONCURRENT, SLICE_TOTAL);
                    await Promise.allSettled(
                        Array.from({ length: end - start }, (_, k) => start + k).map(idx =>
                            fetch(`/api/cases/${caseId}/slices/${mod}/${idx}`, {
                                signal: sig,
                                headers: authHeaders,
                            })
                                .then(() => { done++; patchSlice(modIdx, { done }); })
                                .catch(() => { })
                        )
                    );
                }
                if (!sig.aborted) patchSlice(modIdx, { done: SLICE_TOTAL, status: "done" });
            })();
        });

        return () => controllers.forEach(c => c.abort());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allMainDone, caseId]);

    // Mark slices as prefetched in cache once phase 2 completes
    useEffect(() => {
        if (!allSlicesDone) return;
        const entry = _scanBufferCache.get(caseId);
        if (entry && !entry.slicesPrefetched) {
            _scanBufferCache.set(caseId, { ...entry, slicesPrefetched: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allSlicesDone, caseId]);

    // Auto-dismiss 3 s after everything (files + slices) is done
    useEffect(() => {
        if (!scanFiles.length) return;
        if (allFetchDone) {
            const t = setTimeout(() => setFetchToastDismissed(true), 3000);
            return () => clearTimeout(t);
        }
    }, [allFetchDone, scanFiles.length]);

    const activeBuffer = tabIndex >= 0 ? scanBuffers[tabIndex] : null;

    const [slice, setSlice] = useState(0);
    const [totalSlices, setTotalSlices] = useState(155);
    const [showMask, setShowMask] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playFps, setPlayFps] = useState(8);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const viewerCardRef = useRef<HTMLDivElement>(null);

    // Reset when tab changes
    useEffect(() => {
        setSlice(0);
        setTotalSlices(155);
        setViewMode("slider");
        setIsPlaying(false);
        setSettingsOpen(false);
        setShowMask(false);
    }, [activeTab]);

    // Fullscreen listener
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Playback loop - interval only, no extra deps
    useEffect(() => {
        if (!isPlaying || is3D) return;
        const id = setInterval(() => setSlice(s => (s + 1) % totalSlices), 1000 / playFps);
        return () => clearInterval(id);
    }, [isPlaying, playFps, totalSlices, is3D]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) viewerCardRef.current?.requestFullscreen();
        else document.exitFullscreen();
    }, []);

    const handleVolumeLoad = useCallback((total: number, _initial: number) => {
        setTotalSlices(total);
        setSlice(0);
    }, []);

    const isContactSheet = is2D && viewMode === "contact";
    const slicePct = (slice / Math.max(totalSlices - 1, 1)) * 100;

    const showFetchToast = !fetchToastDismissed && scanFiles.length > 0;

    // Overall progress across all downloads (files + all slice images)
    const totalSliceImages = SLICE_MODS_ORDER.length * SLICE_TOTAL;
    const doneSliceImages = sliceStates.reduce((s, st) => s + st.done, 0);
    const fileProgress = fetchStates.reduce((s, f) => s + f.progress, 0) / fetchStates.length;
    const sliceProgress = (doneSliceImages / totalSliceImages) * 100;
    const overallProgress = Math.round((fileProgress + sliceProgress) / 2);

    return (
        <>
            {showFetchToast && isClient && createPortal(
              <div className={cn(
                    "fixed bottom-6 right-6 z-50 w-[320px] rounded-2xl shadow-2xl overflow-hidden border bg-white dark:bg-slate-900",
                    allFetchDone
                        ? "border-emerald-200 dark:border-emerald-800/60"
                        : "border-slate-200 dark:border-slate-700"
                )}>
                    {/* Toast header */}
                    <div className={cn(
                        "flex items-center justify-between px-4 py-3",
                        allFetchDone ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-slate-50 dark:bg-slate-800/60"
                    )}>
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                                allFetchDone ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-blue-100 dark:bg-blue-900/50"
                            )}>
                                {allFetchDone
                                    ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    : <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400" />}
                            </div>
                            <div className="min-w-0">
                                <p className={cn(
                                    "text-sm font-semibold",
                                    allFetchDone ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"
                                )}>
                                    {allFetchDone ? "Case ready" : allMainDone ? `Loading images - ${doneSliceImages}/${totalSliceImages}` : `Loading - ${overallProgress}%`}
                                </p>
                                {!allFetchDone && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {allMainDone ? `${sliceStates.filter(s => s.status === "done").length}/4 modalities loaded` : `${fetchStates.filter(s => s.status === "done").length} of ${fetchStates.length} files ready`}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                                onClick={() => setFetchToastCollapsed(v => !v)}
                                title={fetchToastCollapsed ? "Expand" : "Collapse"}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                {fetchToastCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </button>
                            {allFetchDone && (
                                <button
                                    onClick={() => setFetchToastDismissed(true)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Overall progress strip */}
                    {!allFetchDone && (
                        <div className="h-1 bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    )}

                    {/* Per-file rows + slice pre-fetch */}
                    {!fetchToastCollapsed && (
                        <div className="px-4 py-3 space-y-2.5">
                            {fetchStates.map((f, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 tabular-nums"
                                            style={{ color: f.color }}>
                                            {f.label}
                                        </span>
                                        {f.sizeMb > 0 && (
                                            <span className="text-xs text-slate-400 shrink-0 tabular-nums">{f.sizeMb} MB</span>
                                        )}
                                        {f.status === "done" && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                                        {f.status === "error" && <AlertCircle size={12} className="text-red-500 shrink-0" />}
                                        {(f.status === "downloading" || f.status === "pending") && (
                                            <span className="text-xs tabular-nums text-blue-600 dark:text-blue-400 shrink-0 w-7 text-right">
                                                {f.progress > 0 ? `${f.progress}%` : "…"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-200",
                                                f.status === "error" ? "bg-red-500"
                                                    : f.status === "done" ? "bg-emerald-500"
                                                        : f.status === "pending" ? "bg-slate-300 dark:bg-slate-600"
                                                            : "bg-blue-500"
                                            )}
                                            style={{ width: `${f.status === "pending" ? 0 : f.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Slice image pre-fetch section */}
                            {sliceStates.some(s => s.status !== "idle") && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">PNG Slices</p>
                                    {SLICE_MODS_ORDER.map((mod, modIdx) => {
                                        const s = sliceStates[modIdx];
                                        const pct = (s.done / SLICE_TOTAL) * 100;
                                        return (
                                            <div key={mod} className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold w-8 shrink-0"
                                                    style={{ color: FETCH_COLORS[modIdx] }}>
                                                    {SLICE_MOD_LABELS[modIdx]}
                                                </span>
                                                <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-150",
                                                            s.status === "done" ? "bg-emerald-500" : "bg-blue-400")}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-400 shrink-0 tabular-nums w-12 text-right">
                                                    {s.done}/{SLICE_TOTAL}
                                                </span>
                                                {s.status === "done" && <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>,
              document.body
            )}

            <div
                ref={viewerCardRef}
                className={cn(
                    "rounded-2xl border overflow-hidden shadow-sm flex flex-col",
                    isFullscreen
                        ? "h-screen border-transparent"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}
                style={isFullscreen ? { background: "#050d18" } : undefined}
            >
                {/* Header - hidden in fullscreen */}
                {!isFullscreen && (
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/80">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {is3D
                                ? <Brain className="w-4 h-4 text-purple-500 shrink-0" />
                                : isGrid
                                    ? <LayoutGrid className="w-4 h-4 text-teal-500 shrink-0" />
                                    : isContactSheet
                                        ? <LayoutGrid className="w-4 h-4 text-blue-500 shrink-0" />
                                        : <ScanLine className="w-4 h-4 text-blue-500 shrink-0" />}
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {is3D
                                    ? "3D Brain Model"
                                    : isGrid
                                        ? "All Modalities - Grid View"
                                        : isContactSheet
                                            ? `${activeMeta?.fullLabel} - Contact Sheet`
                                            : `${activeMeta?.fullLabel} - 2D Slices`}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {!is3D && !isContactSheet && (
                                <span className="text-xs text-slate-500 font-mono">{slice + 1} / {totalSlices}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Canvas */}
                <div className={cn("w-full relative", isFullscreen ? "flex-1 min-h-0" : "h-[480px]")}>
                    {/* Canvas overlay - top right (hidden for 3D which has its own controls) */}
                    {!is3D && <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                        {/* Top row: Collapse toggle + Fullscreen always visible */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center justify-center gap-1.5 py-1 px-2 w-[88px] rounded-lg border border-white/10 backdrop-blur-md text-slate-300 hover:text-white hover:border-white/25 transition-all text-[10px] font-semibold"
                                style={{ background: "rgba(8,15,28,0.65)" }}
                            >
                                {isFullscreen ? <Minimize2 className="w-3 h-3 shrink-0" /> : <Maximize2 className="w-3 h-3 shrink-0" />}
                                <span>{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
                            </button>
                            <button
                                onClick={() => setControlsVisible(v => !v)}
                                title={controlsVisible ? "Collapse" : "Expand"}
                                className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-white/10 backdrop-blur-md text-slate-400 hover:text-white hover:border-white/25 transition-all text-[10px] font-semibold"
                                style={{ background: "rgba(8,15,28,0.65)" }}
                            >
                                {controlsVisible
                                    ? <><ChevronRight className="w-3 h-3" /><span>Collapse</span></>
                                    : <SlidersHorizontal className="w-3 h-3" />}
                            </button>
                        </div>

                        {controlsVisible && (<>
                            {/* 1. Mask */}
                            {!is3D && (
                                <button
                                    onClick={() => setShowMask(v => !v)}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1 px-2 w-full rounded-lg border backdrop-blur-md transition-all text-[10px] font-semibold",
                                        showMask
                                            ? "border-violet-500/60 text-violet-200"
                                            : "border-white/10 text-slate-300 hover:text-violet-300 hover:border-violet-500/40"
                                    )}
                                    style={{ background: showMask ? "rgba(124,58,237,0.25)" : "rgba(8,15,28,0.65)" }}
                                >
                                    <span className={cn("w-2 h-2 rounded-full shrink-0 transition-all", showMask ? "bg-violet-400 shadow-[0_0_6px_2px_rgba(167,139,250,0.6)]" : "bg-slate-600")} />
                                    <span>Mask</span>
                                </button>
                            )}

                            {/* 2. Grid (contact sheet) - 2D only */}
                            {is2D && (
                                <button
                                    onClick={() => setViewMode(v => v === "slider" ? "contact" : "slider")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1 px-2 w-full rounded-lg border backdrop-blur-md transition-all text-[10px] font-semibold",
                                        isContactSheet
                                            ? "border-blue-500/60 text-blue-300"
                                            : "border-white/10 text-slate-300 hover:text-blue-300 hover:border-blue-500/40"
                                    )}
                                    style={{ background: isContactSheet ? "rgba(37,99,235,0.20)" : "rgba(8,15,28,0.65)" }}
                                >
                                    <LayoutGrid className="w-3 h-3 shrink-0" />
                                    <span>Grid</span>
                                </button>
                            )}

                            {/* 3. Settings */}
                            {!is3D && (
                                <button
                                    onClick={() => setSettingsOpen(v => !v)}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1 px-2 w-full rounded-lg border backdrop-blur-md transition-all text-[10px] font-semibold",
                                        settingsOpen
                                            ? "border-cyan-500/40 text-cyan-300"
                                            : "border-white/10 text-slate-300 hover:text-white hover:border-white/25"
                                    )}
                                    style={{ background: settingsOpen ? "rgba(0,180,255,0.12)" : "rgba(8,15,28,0.65)" }}
                                >
                                    <Settings2 className="w-3 h-3 shrink-0" />
                                    <span>Settings</span>
                                </button>
                            )}

                            {/* Settings panel - speed only */}
                            {settingsOpen && !is3D && !isContactSheet && (
                                <div
                                    className="w-52 rounded-2xl border border-white/[0.07] backdrop-blur-xl shadow-2xl overflow-hidden"
                                    style={{ background: "rgba(6,12,24,0.94)" }}
                                >
                                    <div className="px-3 pt-3 pb-3 space-y-2.5">
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.18em]">Playback Speed</p>
                                            <span className="text-[10px] font-bold text-cyan-400 font-mono">{playFps} fps</span>
                                        </div>
                                        <input
                                            type="range" min={1} max={24} value={playFps}
                                            onChange={e => setPlayFps(Number(e.target.value))}
                                            className="w-full h-1 rounded-full cursor-pointer accent-cyan-400"
                                        />
                                        <div className="flex justify-between px-0.5">
                                            <span className="text-[8px] text-slate-600">1 fps</span>
                                            <span className="text-[8px] text-slate-600">24 fps</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>)}
                    </div>}

                    {/* Fullscreen bottom: play + slider only */}
                    {isFullscreen && !is3D && !isContactSheet && (
                        <div
                            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
                            style={{ background: "rgba(8,15,28,0.75)", minWidth: "360px" }}
                        >
                            <button onClick={() => setIsPlaying(v => !v)} className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0">
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <button onClick={() => setSlice(s => Math.max(0, s - 1))} className="p-1 text-slate-400 hover:text-white transition-colors shrink-0">
                                <ChevronLeft size={16} />
                            </button>
                            <input
                                type="range" min={0} max={Math.max(totalSlices - 1, 0)} value={slice}
                                onChange={e => setSlice(Number(e.target.value))}
                                className="flex-1 h-1 rounded-full cursor-pointer accent-cyan-400"
                            />
                            <button onClick={() => setSlice(s => Math.min(totalSlices - 1, s + 1))} className="p-1 text-slate-400 hover:text-white transition-colors shrink-0">
                                <ChevronRight size={16} />
                            </button>
                            <span className="text-xs font-mono text-slate-400 shrink-0 w-14 text-right">{slice + 1}/{totalSlices}</span>
                        </div>
                    )}

                    {/* Viewer */}
                    {is3D ? (
                        <ThreeDViewer modelUrl={`/api/cases/${caseId}/mesh`} />
                    ) : isGrid ? (
                        <ModalityGridViewer
                            scanBuffers={scanBuffers}
                            scanNames={scanNames}
                            segBuffer={segBuffer}
                            slice={slice}
                            showMask={showMask}
                            onLoad={handleVolumeLoad}
                            onSliceChange={setSlice}
                        />
                    ) : isContactSheet ? (
                        <ModalityContactSheet
                            caseId={scanFiles.length > 0 ? caseId : undefined}
                            sliceBase={scanFiles.length === 0 ? BRATS_BASE : undefined}
                            modality={activeTab}
                            showMask={showMask}
                        />
                    ) : hasScan ? (
                        <ModalityViewer
                            buffer={activeBuffer}
                            segBuffer={segBuffer}
                            scanName={activeScanName}
                            showMask={showMask}
                            slice={slice}
                            onLoad={handleVolumeLoad}
                            onSliceChange={setSlice}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3" style={{ background: "#050d18" }}>
                            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                                <ScanLine className="w-6 h-6 text-slate-500" />
                            </div>
                            <p className="text-sm text-slate-500">No scan file uploaded for this modality</p>
                        </div>
                    )}
                </div>

                {/* Controls panel */}
                {!is3D && !isFullscreen && (isGrid || isContactSheet || hasScan) && (
                    <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                        {!isContactSheet && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsPlaying(v => !v)}
                                    title={isPlaying ? "Pause" : "Play"}
                                    className={cn(
                                        "w-7 h-7 rounded-lg border flex items-center justify-center transition-all shrink-0",
                                        isPlaying
                                            ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30"
                                            : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400 hover:text-blue-600"
                                    )}
                                >
                                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={Math.max(totalSlices - 1, 0)}
                                    value={slice}
                                    onChange={e => { setIsPlaying(false); setSlice(Number(e.target.value)); }}
                                    className="flex-1 h-1 rounded-full cursor-pointer accent-blue-600"
                                    style={{ background: `linear-gradient(to right,#2563eb ${slicePct}%,#e2e8f0 ${slicePct}%)` }}
                                />
                                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-14 text-right shrink-0">
                                    {slice + 1}/{totalSlices}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setSlice(s => Math.max(0, s - 1))}
                                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-all"
                                    >
                                        <ChevronLeft size={12} />
                                    </button>
                                    <button
                                        onClick={() => setSlice(s => Math.min(totalSlices - 1, s + 1))}
                                        className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-all"
                                    >
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 shrink-0">Mask Legend</span>
                            {MASK_LEGEND.map(({ label, color }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0 transition-all"
                                        style={showMask
                                            ? { background: color, boxShadow: `0 0 6px ${color}99` }
                                            : { background: "transparent", border: `1.5px solid ${color}77` }
                                        }
                                    />
                                    <span className={cn("text-xs", showMask ? "text-slate-500" : "text-slate-400 dark:text-slate-600")}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {is3D && !isFullscreen && (
                    <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <p className="text-[11px] text-slate-400 text-center">
                            Drag to rotate · Scroll to zoom · Use layer controls inside the viewer
                        </p>
                    </div>
                )}
            </div>
        </>
    );
});

// ── Sidebar - memoized, never re-renders on slice changes ──────────────────

interface SidebarProps {
    caseItem: Case;
    isAdmin: boolean;
    isAssignedDoctor: boolean;
    fileUrls: string[];
    patient: Patient | null;
}

const CaseSidebar = memo(function CaseSidebar({ caseItem, isAdmin, isAssignedDoctor, fileUrls, patient }: SidebarProps) {
    const patientName = patient
        ? `${patient.first_name} ${patient.last_name}`
        : [caseItem.patient_first_name, caseItem.patient_last_name].filter(Boolean).join(" ") || "Unknown Patient";

    const initials = patientName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const age = patient?.dob ? calcAge(patient.dob) : null;
    const formattedDob = patient?.dob
        ? new Date(patient.dob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : null;

    return (
        <div className="lg:col-span-4 space-y-4">
            {/* AI Analysis */}
            <motion.div variants={fadeUp} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 p-px rounded-2xl border border-purple-100 dark:border-purple-900/30">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[15px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-md shrink-0">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">AI Analysis</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">Neural Network</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-purple-100 dark:border-purple-900/30">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {caseItem.status === "REVIEWED" ? "Analysis complete" : "Awaiting processing"}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{caseItem.priority}</p>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Files</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{fileUrls.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Patient Details */}
            <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                        <User size={12} /> Patient Details
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-blue-500/20">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{patientName}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {patient?.mrn ? `MRN: ${patient.mrn}` : `ID: #${caseItem.patient_id.slice(-8).toUpperCase()}`}
                            </p>
                        </div>
                        {patient?.gender && (
                            <span className={cn(
                                "ml-auto shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                patient.gender.toLowerCase() === "male"
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                            )}>
                                {patient.gender}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                {(age !== null || formattedDob) && (
                    <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                        {age !== null && (
                            <div className="px-4 py-3 text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                                    {age} <span className="text-xs font-normal text-slate-400">yrs</span>
                                </p>
                            </div>
                        )}
                        {formattedDob && (
                            <div className="px-4 py-3 text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{formattedDob}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Detail rows */}
                <div className="px-5 py-4 space-y-3">
                    {patient?.phone_number && (
                        <PatientInfoRow icon={Phone} label="Phone" value={patient.phone_number} />
                    )}
                    {patient?.cnic && (
                        <PatientInfoRow icon={CreditCard} label="CNIC" value={patient.cnic} mono />
                    )}
                    {(patient?.address || patient?.city) && (
                        <PatientInfoRow
                            icon={MapPin}
                            label="Address"
                            value={[patient.address, patient.city].filter(Boolean).join(", ")}
                        />
                    )}

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <Row label="Assigned To" value={
                            <span className={cn("text-xs font-semibold", caseItem.assigned_to_name ? "text-blue-600 dark:text-blue-400" : "text-slate-400 italic")}>
                                {caseItem.assigned_to_name ?? "Unassigned"}
                            </span>
                        } />
                        <Row label="Last Updated" value={
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {new Date(caseItem.updated_at).toLocaleDateString("en-GB")}
                            </span>
                        } />
                    </div>
                </div>
            </motion.div>

            {/* Diagnostic Verdict */}
            <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Verdict header */}
                <div className={cn(
                    "px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3",
                    caseItem.verdict
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
                        : "bg-slate-50 dark:bg-slate-800/40"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl",
                            caseItem.verdict
                                ? "bg-emerald-100 dark:bg-emerald-900/40"
                                : "bg-slate-200 dark:bg-slate-700"
                        )}>
                            <Stethoscope size={14} className={caseItem.verdict ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Diagnostic Verdict</p>
                            <p className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider",
                                caseItem.verdict ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                            )}>
                                {caseItem.verdict ? "Assessment recorded" : "Pending review"}
                            </p>
                        </div>
                    </div>
                    {caseItem.verdict && (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    )}
                </div>

                <div className="p-5">
                    {isAssignedDoctor ? (
                        <VerdictForm caseId={caseItem.id} initialVerdict={caseItem.verdict} />
                    ) : caseItem.verdict ? (
                        <div className="space-y-3">
                            {/* Doctor + date meta */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                {caseItem.assigned_to_name && (
                                    <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                                        <User size={10} />
                                        Dr. {caseItem.assigned_to_name}
                                    </span>
                                )}
                                {caseItem.verdict_updated_at && (
                                    <span className="flex items-center gap-1 font-mono">
                                        <Clock size={9} />
                                        {new Date(caseItem.verdict_updated_at).toLocaleDateString("en-GB")}
                                    </span>
                                )}
                            </div>
                            {/* Verdict text */}
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 dark:bg-emerald-600 rounded-full" />
                                <p className="pl-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {caseItem.verdict}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                                <ShieldAlert size={20} className="text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-400 italic">Waiting for doctor&apos;s assessment.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

// ── Shell ──────────────────────────────────────────────────────────────────

export function CaseDetailShell({ caseItem: initialCaseItem, workspaceRole, membershipId, patient }: CaseDetailShellProps) {
    const { data: caseItem = initialCaseItem } = useCase(initialCaseItem.id, initialCaseItem);
    const { token, activeWorkspaceId } = useWorkspace();
    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";
    // Any doctor who reaches this page has passed the server-side guard (they ARE the assigned doctor)
    const isAssignedDoctor = workspaceRole === "DOCTOR";
    const priority = (caseItem.priority || "normal").toLowerCase();
    const fileUrls: string[] = (() => { try { return JSON.parse(caseItem.file_references); } catch { return []; } })();

    const [activeTab, setActiveTab] = useState<TabKey>("t1");

    const handleTabChange = useCallback((tab: TabKey) => setActiveTab(tab), []);

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/cases" className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0">
                        <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {patient
                                    ? `${patient.first_name} ${patient.last_name}`
                                    : [caseItem.patient_first_name, caseItem.patient_last_name].filter(Boolean).join(" ") || `Case #${caseItem.id.slice(-6).toUpperCase()}`}
                            </h1>
                            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider", PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal)}>
                                {priority}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Calendar size={11} />
                            Case <span className="font-mono">#{caseItem.id.slice(-6).toUpperCase()}</span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            Created {new Date(caseItem.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <HeaderStatusControl caseId={caseItem.id} currentStatus={caseItem.status} isAdmin={isAdmin} />
                    <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Radiology
                    </div>
                </div>
            </motion.div>

            {/* Main grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left column */}
                <div className="lg:col-span-8 space-y-4">

                    {/* Modality tabs */}
                    <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mr-1 shrink-0">Modality</span>

                        {MODALITY_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all",
                                    activeTab === tab.key
                                        ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-400"
                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

                        <button
                            onClick={() => handleTabChange("grid")}
                            className={cn(
                                "px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all flex items-center gap-1.5",
                                activeTab === "grid"
                                    ? "bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <LayoutGrid size={13} />
                            Grid
                        </button>

                        <button
                            onClick={() => handleTabChange("3d")}
                            className={cn(
                                "px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all flex items-center gap-1.5",
                                activeTab === "3d"
                                    ? "bg-purple-50 border-purple-500 text-purple-600 dark:bg-purple-950/40 dark:border-purple-500 dark:text-purple-400"
                                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <Box size={13} />
                            3D
                        </button>
                    </motion.div>

                    {/* Viewer - isolated, memoized */}
                    <motion.div variants={fadeUp}>
                        <ViewerPanel
                            activeTab={activeTab}
                            caseId={caseItem.id}
                            scanFiles={fileUrls}
                            authHeaders={{
                                Authorization: `Bearer ${token}`,
                                ...(activeWorkspaceId
                                    ? { "X-Workspace-Id": activeWorkspaceId }
                                    : {}),
                            }}
                        />
                    </motion.div>

                    {/* Clinical Notes */}
                    <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            <FileText size={12} /> Clinical Notes
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            {caseItem.notes || "No clinical notes provided."}
                        </p>
                    </motion.div>
                </div>

                {/* Right sidebar - memoized */}
                <CaseSidebar
                    caseItem={caseItem}
                    isAdmin={isAdmin}
                    isAssignedDoctor={isAssignedDoctor}
                    fileUrls={fileUrls}
                    patient={patient}
                />
            </motion.div>
        </motion.div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function PatientInfoRow({ icon: Icon, label, value, mono }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                <Icon size={11} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={cn("text-xs font-medium text-slate-700 dark:text-slate-300 break-all", mono && "font-mono")}>{value}</p>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 shrink-0">{label}</span>
            {value}
        </div>
    );
}

function HeaderStatusControl({ caseId, currentStatus, isAdmin }: { caseId: string; currentStatus: CaseStatus; isAdmin: boolean }) {
    const updateCase = useUpdateCase();
    const statuses: CaseStatus[] = ["PENDING", "PROCESSING", "REVIEWED"];

    if (!isAdmin) {
        return (
            <span className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider", STATUS_COLORS[currentStatus])}>
                {currentStatus}
            </span>
        );
    }
    return (
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            {statuses.map((s) => (
                <button
                    key={s}
                    disabled={updateCase.isPending || s === currentStatus}
                    onClick={() => updateCase.mutate({ caseId, data: { status: s } })}
                    className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        s === currentStatus
                            ? STATUS_COLORS[s]
                            : "text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
                    )}
                >
                    {updateCase.isPending && updateCase.variables?.data?.status === s
                        ? <Loader2 size={10} className="animate-spin mx-auto" />
                        : s}
                </button>
            ))}
        </div>
    );
}

function StatusSelector({ caseId, currentStatus, isAdmin }: { caseId: string; currentStatus: CaseStatus; isAdmin: boolean }) {
    const updateCase = useUpdateCase();
    const { activeWorkspaceId } = useWorkspace();
    void activeWorkspaceId;
    const statuses: CaseStatus[] = ["PENDING", "PROCESSING", "REVIEWED"];

    if (!isAdmin) {
        return (
            <div className={cn("px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center", STATUS_COLORS[currentStatus])}>
                {currentStatus}
            </div>
        );
    }
    return (
        <div className="flex gap-1.5">
            {statuses.map((s) => (
                <button
                    key={s}
                    disabled={updateCase.isPending || s === currentStatus}
                    onClick={() => updateCase.mutate({ caseId, data: { status: s } })}
                    className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        s === currentStatus
                            ? STATUS_COLORS[s]
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                    )}
                >
                    {updateCase.isPending && updateCase.variables?.data?.status === s
                        ? <Loader2 size={11} className="animate-spin mx-auto" />
                        : s}
                </button>
            ))}
        </div>
    );
}

function VerdictForm({ caseId, initialVerdict }: { caseId: string; initialVerdict: string | null }) {
    const [verdict, setVerdict] = useState(initialVerdict || "");
    const [msg, setMsg] = useState("");
    const updateCase = useUpdateCase();
    const wordCount = verdict.trim().split(/\s+/).filter(Boolean).length;

    const handleSubmit = async () => {
        if (!verdict.trim()) return;
        try {
            await updateCase.mutateAsync({ caseId, data: { verdict, status: "REVIEWED" } });
            setMsg("Verdict saved.");
            setTimeout(() => setMsg(""), 3000);
        } catch (err: any) {
            setMsg(err.message || "Failed to save verdict.");
        }
    };

    return (
        <div className="space-y-3">
            {/* Editor hint */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <FileText size={12} className="text-blue-500 shrink-0" />
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    {initialVerdict ? "Revise your diagnostic report below" : "Write your diagnostic assessment and findings"}
                </span>
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={verdict}
                    onChange={e => setVerdict(e.target.value)}
                    rows={5}
                    placeholder="Describe findings, impression, and clinical recommendations..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-600 outline-none resize-none transition-all placeholder:text-slate-400 dark:text-white"
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 pointer-events-none">
                    {wordCount}w
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
                {msg ? (
                    <span className={cn("text-xs font-medium flex items-center gap-1.5", msg.includes("saved") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {msg.includes("saved") ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        {msg}
                    </span>
                ) : <span />}
                <button
                    onClick={handleSubmit}
                    disabled={updateCase.isPending || !verdict.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                    {updateCase.isPending
                        ? <Loader2 size={12} className="animate-spin" />
                        : <CheckCircle2 size={12} />}
                    {initialVerdict ? "Update Verdict" : "Submit Verdict"}
                </button>
            </div>
        </div>
    );
}
