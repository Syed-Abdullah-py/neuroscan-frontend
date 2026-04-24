"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, type Variants } from "framer-motion";
import {
    ArrowLeft, Brain, User, FileText, Activity, ShieldAlert,
    Calendar, Loader2, AlertCircle, ScanLine, Box,
    ChevronLeft, ChevronRight, LayoutGrid,
    Maximize2, Minimize2, Play, Pause, Settings2,
    SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateCase } from "@/features/cases/hooks/use-cases";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Case, CaseStatus } from "@/lib/types/case.types";
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
    { label: "Edema", color: "#32c850" },
    { label: "Active Tumor", color: "#ff8c00" },
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

const BRATS_API = "/api/brats/BraTS20_Training_001/BraTS20_Training_001";
const BRATS_BASE = "/brats-slices/BraTS20_Training_001";
const URL_MAP: Record<string, string> = {
    t1: `${BRATS_API}_t1.nii.gz`,
    t1ce: `${BRATS_API}_t1ce.nii.gz`,
    t2: `${BRATS_API}_t2.nii.gz`,
    flair: `${BRATS_API}_flair.nii.gz`,
};
const SEG_URL = `${BRATS_API}_seg.nii.gz`;

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
    user: { name: string; email: string; globalRole: string };
}

// ── ViewerPanel — isolated so slice ticks don't re-render sidebar ──────────

const ViewerPanel = memo(function ViewerPanel({ activeTab }: { activeTab: TabKey }) {
    const is3D = activeTab === "3d";
    const isGrid = activeTab === "grid";
    const is2D = !is3D && !isGrid;
    const activeMeta = MODALITY_TABS.find(t => t.key === activeTab);
    const activeUrl = is2D ? URL_MAP[activeTab] : undefined;

    const [slice, setSlice] = useState(0);
    const [totalSlices, setTotalSlices] = useState(155);
    const [showMask, setShowMask] = useState(false);
    const [viewMode, setViewMode] = useState<"slider" | "contact">("slider");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playFps, setPlayFps] = useState(8);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
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

    // Playback loop — interval only, no extra deps
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

    return (
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
            {/* Header — hidden in fullscreen */}
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
                                    ? "All Modalities — Grid View"
                                    : isContactSheet
                                        ? `${activeMeta?.fullLabel} — Contact Sheet`
                                        : `${activeMeta?.fullLabel} — 2D Slices`}
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
                {/* Canvas overlay — top right (hidden for 3D which has its own controls) */}
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

                        {/* 2. Grid (contact sheet) — 2D only */}
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

                        {/* Settings panel — speed only */}
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
                    <ThreeDViewer />
                ) : isGrid ? (
                    <ModalityGridViewer
                        sliceBase={BRATS_BASE}
                        slice={slice}
                        showMask={showMask}
                        onSliceChange={setSlice}
                    />
                ) : isContactSheet ? (
                    <ModalityContactSheet
                        sliceBase={BRATS_BASE}
                        modality={activeTab}
                        showMask={showMask}
                    />
                ) : activeUrl ? (
                    <ModalityViewer
                        url={activeUrl}
                        segUrl={SEG_URL}
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
            {!is3D && !isFullscreen && (isGrid || isContactSheet || activeUrl) && (
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
    );
});

// ── Sidebar — memoized, never re-renders on slice changes ──────────────────

interface SidebarProps {
    caseItem: Case;
    isAdmin: boolean;
    isAssignedDoctor: boolean;
    fileUrls: string[];
}

const CaseSidebar = memo(function CaseSidebar({ caseItem, isAdmin, isAssignedDoctor, fileUrls }: SidebarProps) {
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
            <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                    <User size={12} /> Patient Details
                </h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            #{caseItem.patient_id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">{caseItem.patient_id}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <Row label="Assigned To" value={
                            <span className={cn("text-xs font-semibold", caseItem.assigned_to_member_id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 italic")}>
                                {caseItem.assigned_to_member_id ? "Assigned" : "Unassigned"}
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

            {/* Current Status */}
            <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Activity size={12} /> Current Status
                </h3>
                <StatusSelector caseId={caseItem.id} currentStatus={caseItem.status} isAdmin={isAdmin} />
            </motion.div>

            {/* Diagnostic Verdict */}
            <motion.div variants={fadeUp} className={cn(
                "p-5 rounded-2xl border shadow-sm",
                isAssignedDoctor || isAdmin
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            )}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-1.5 rounded-lg", caseItem.verdict ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                        <ShieldAlert size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Diagnostic Verdict</h3>
                </div>
                {isAssignedDoctor || isAdmin ? (
                    <VerdictForm caseId={caseItem.id} initialVerdict={caseItem.verdict} />
                ) : (
                    <div className={cn(
                        "p-4 rounded-xl text-sm border",
                        caseItem.verdict
                            ? "bg-white dark:bg-slate-950 border-green-200 dark:border-green-900/30 text-slate-700 dark:text-slate-300"
                            : "bg-slate-50 dark:bg-slate-950/50 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic text-center"
                    )}>
                        {caseItem.verdict || "Waiting for doctor's assessment."}
                    </div>
                )}
            </motion.div>
        </div>
    );
});

// ── Shell ──────────────────────────────────────────────────────────────────

export function CaseDetailShell({ caseItem, workspaceRole, membershipId }: CaseDetailShellProps) {
    const isAdmin = workspaceRole === "OWNER" || workspaceRole === "ADMIN";
    const isAssignedDoctor = workspaceRole === "DOCTOR" && caseItem.assigned_to_member_id === membershipId;
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
                                Case <span className="font-mono">#{caseItem.id.slice(-6).toUpperCase()}</span>
                            </h1>
                            <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider", PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal)}>
                                {priority}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={11} />
                            Created {new Date(caseItem.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Patient</p>
                        <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">#{caseItem.patient_id.slice(-8).toUpperCase()}</p>
                    </div>
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

                    {/* Viewer — isolated, memoized */}
                    <motion.div variants={fadeUp}>
                        <ViewerPanel activeTab={activeTab} />
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

                {/* Right sidebar — memoized */}
                <CaseSidebar
                    caseItem={caseItem}
                    isAdmin={isAdmin}
                    isAssignedDoctor={isAssignedDoctor}
                    fileUrls={fileUrls}
                />
            </motion.div>
        </motion.div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 shrink-0">{label}</span>
            {value}
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
            <textarea
                value={verdict}
                onChange={e => setVerdict(e.target.value)}
                rows={4}
                placeholder="Enter detailed diagnostic findings and recommendation..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all placeholder:text-slate-400 dark:text-white"
            />
            <div className="flex items-center justify-between gap-2">
                {msg ? (
                    <span className={cn("text-xs font-medium flex items-center gap-1.5", msg.includes("saved") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                        <AlertCircle size={11} /> {msg}
                    </span>
                ) : <span />}
                <button
                    onClick={handleSubmit}
                    disabled={updateCase.isPending || !verdict.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                    {updateCase.isPending && <Loader2 size={12} className="animate-spin" />}
                    {initialVerdict ? "Update Verdict" : "Submit Verdict"}
                </button>
            </div>
        </div>
    );
}
