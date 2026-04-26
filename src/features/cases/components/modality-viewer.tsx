"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// ── ModalityViewer (single modality, NiiVue-based) ────────────────────────

interface ModalityViewerProps {
    buffer: ArrayBuffer | null;  // null = still downloading
    segBuffer?: ArrayBuffer | null;
    scanName?: string;
    showMask?: boolean;
    slice: number;
    onLoad: (totalSlices: number, initialSlice: number) => void;
    onSliceChange: (slice: number) => void;
}

export function ModalityViewer(props: ModalityViewerProps) {
    return <NiiVueViewer {...props} />;
}


// ── 4-modality grid viewer (2×2) ──────────────────────────────────────────

const MODALITY_META: Record<string, { label: string; color: string }> = {
    t1: { label: "T1", color: "#60a5fa" },
    t1ce: { label: "T1ce", color: "#a78bfa" },
    t2: { label: "T2", color: "#34d399" },
    flair: { label: "FLAIR", color: "#fb923c" },
};

const GRID_MODS = ["t1", "t1ce", "t2", "flair"] as const;
const BRATS_TOTAL = 155;

export function ModalityGridViewer({
    scanBuffers,
    scanNames,
    sliceBase,
    showMask,
    slice,
    onLoad,
    onSliceChange: _onSliceChange,
}: {
    scanBuffers?: (ArrayBuffer | null)[];
    scanNames?: string[];
    sliceBase?: string;
    showMask: boolean;
    slice: number;
    onLoad?: (nz: number, mid: number) => void;
    onSliceChange: (s: number) => void;
}) {
    const isRealData = !!scanBuffers;

    // Must be before any early return — rules of hooks
    useEffect(() => {
        if (!isRealData) onLoad?.(BRATS_TOTAL, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRealData]);

    if (isRealData) {
        return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px bg-slate-800/60">
                {GRID_MODS.map((mod, i) => {
                    const buf = scanBuffers[i] ?? null;
                    const meta = MODALITY_META[mod];
                    return (
                        <div
                            key={mod}
                            className="relative overflow-hidden flex items-center justify-center"
                            style={{ background: "#050d18" }}
                        >
                            <NiiVueMiniViewer
                                buffer={buf}
                                scanName={scanNames?.[i]}
                                slice={slice}
                                onLoad={i === 0 ? onLoad : undefined}
                            />
                            <span
                                className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm z-10"
                                style={{
                                    background: `${meta.color}22`,
                                    color: meta.color,
                                    border: `1px solid ${meta.color}44`,
                                }}
                            >
                                {meta.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // PNG/BraTS fallback
    const idx = String(Math.max(0, Math.min(slice, BRATS_TOTAL - 1))).padStart(3, "0");

    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px bg-slate-800/60">
            {GRID_MODS.map((mod) => {
                const meta = MODALITY_META[mod];
                const src = `${sliceBase}/${mod}/${idx}${showMask ? "_m" : ""}.png`;
                return (
                    <div key={mod} className="relative overflow-hidden flex items-center justify-center" style={{ background: "#050d18" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={`${meta.label} slice ${slice + 1}`}
                            className="max-h-full max-w-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                            draggable={false}
                        />
                        <OrientLabels mini />
                        <span
                            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm"
                            style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}44` }}
                        >
                            {meta.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Per-modality contact sheet — PNG-based ────────────────────────────────

const CONTACT_COLS = 5;
const SLICE_INDICES = Array.from({ length: BRATS_TOTAL }, (_, i) => i);

export function ModalityContactSheet({
    caseId,
    sliceBase,
    modality,
    showMask,
}: {
    caseId?: string;
    sliceBase?: string;
    modality: string;
    showMask: boolean;
}) {
    const buildSrc = (sliceIdx: number): string => {
        const idx = String(sliceIdx).padStart(3, "0");
        if (caseId) {
            return `/api/cases/${caseId}/slices/${modality}/${sliceIdx}${showMask ? "?masked=true" : ""}`;
        }
        if (sliceBase) {
            return `${sliceBase}/${modality}/${idx}${showMask ? "_m" : ""}.png`;
        }
        return "";
    };

    if (!caseId && !sliceBase) {
        return (
            <div className="flex h-full items-center justify-center" style={{ background: "#050d18" }}>
                <p className="text-xs text-slate-500">Contact sheet not available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto" style={{ background: "#050d18" }}>
            <div
                className="grid gap-px p-px"
                style={{ gridTemplateColumns: `repeat(${CONTACT_COLS}, 1fr)` }}
            >
                {SLICE_INDICES.map((sliceIdx) => {
                    const src = buildSrc(sliceIdx);
                    return (
                        <div
                            key={sliceIdx}
                            className="relative aspect-square overflow-hidden group"
                            style={{ background: "#000" }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt={`Slice ${sliceIdx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                draggable={false}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-cyan-400/0 group-hover:ring-cyan-400/60 transition-all" />
                            <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono leading-none text-white/25 group-hover:text-white/70 transition-colors">
                                {sliceIdx + 1}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Orientation labels — shared across all 2-D slice views ───────────────
// T = top of image, L = patient's left side (viewer's right in radiology convention,
// but placed left here to match the PNG slices as generated — verify and flip if needed)

function OrientLabels({ mini = false }: { mini?: boolean }) {
    const cls = mini
        ? "text-[7px] font-bold font-mono text-white/45 select-none pointer-events-none"
        : "text-[9px] font-bold font-mono text-white/50 select-none pointer-events-none";
    return (
        <>
            <span className={`absolute top-1.5 left-1/2 -translate-x-1/2 z-30 ${cls}`}>T</span>
            <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-30 ${cls}`}>L</span>
        </>
    );
}

// ── NiiVue single-modality viewer ─────────────────────────────────────────

function NiiVueViewer({
    buffer,
    segBuffer,
    scanName,
    showMask = false,
    slice,
    onLoad,
    onSliceChange,
}: ModalityViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nvRef = useRef<any>(null);
    const totalRef = useRef(1);
    const aliveRef = useRef(true);
    // keep latest values accessible inside async callbacks without causing re-runs
    const bufferRef = useRef(buffer);
    const segBufferRef = useRef(segBuffer);
    const scanNameRef = useRef(scanName);
    const showMaskRef = useRef(showMask);
    bufferRef.current = buffer;
    segBufferRef.current = segBuffer;
    scanNameRef.current = scanName;
    showMaskRef.current = showMask;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect 1: initialise NiiVue and load the scan volume
    useEffect(() => {
        if (!buffer) { setLoading(true); setError(null); return; }
        if (!canvasRef.current) return;

        aliveRef.current = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const { Niivue } = await import("@niivue/niivue");
                if (!aliveRef.current || !canvasRef.current) return;

                const nv = new Niivue({
                    isResizeCanvas: true,
                    backColor: [0.02, 0.05, 0.09, 1],
                    crosshairWidth: 0,
                    isColorbar: false,
                    dragMode: 1,
                    loadingText: "",
                });
                nvRef.current = nv;
                await nv.attachToCanvas(canvasRef.current);
                nv.setSliceType(0);

                await nv.loadVolumes([{ url: buffer as any, name: scanName ?? "scan.nii", colormap: "gray" }]);
                if (!aliveRef.current) return;

                const dims: number[] = nv.volumes[0].hdr!.dims;
                const nz = Math.max(dims[3] ?? 1, 1);
                totalRef.current = nz;
                _seek(nv, 0, nz);
                onLoad(nz, 0);
                setLoading(false);

                nv.onLocationChange = (data: any) => {
                    if (!aliveRef.current || !data?.vox) return;
                    const vz = Math.round(data.vox[2] ?? 0);
                    onSliceChange(Math.max(0, Math.min(vz, nz - 1)));
                };
            } catch (err: any) {
                if (aliveRef.current) { setError(err?.message ?? "Failed to load scan"); setLoading(false); }
            }
        })();

        return () => { aliveRef.current = false; nvRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buffer]);

    // Effect 2: toggle seg overlay — uses loadVolumes (addVolume has ArrayBuffer issues in NiiVue)
    // Uses refs for buffer/scanName so scan is not re-initialised, only the volume list changes.
    useEffect(() => {
        const nv = nvRef.current;
        if (!nv || loading || error || !bufferRef.current) return;

        const savedSlice = _currentSliceIdx(nv, totalRef.current);
        const vols: any[] = [{ url: bufferRef.current as any, name: scanNameRef.current ?? "scan.nii", colormap: "gray" }];
        if (showMask && segBufferRef.current) {
            vols.push({ url: segBufferRef.current as any, name: "seg.nii", opacity: 0.55, colormap: "warm", cal_min: 0.5, cal_max: 4 });
        }
        nv.loadVolumes(vols).then(() => {
            if (aliveRef.current) _seek(nv, savedSlice, totalRef.current);
        }).catch(() => { /* ignore */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showMask, segBuffer]);

    // Effect 3: seek to requested slice
    useEffect(() => {
        const nv = nvRef.current;
        if (!nv || loading || error) return;
        _seek(nv, slice, totalRef.current);
    }, [slice, loading, error]);

    return (
        <div className="relative w-full h-full" style={{ background: "#050d18" }}>
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(0,160,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,0.035) 1px,transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />
            {/* NiiVue renders its own A/P/L/R orientation markers; no overlay needed */}
            <canvas
                ref={canvasRef}
                className="relative z-10 w-full h-full"
                style={{ display: loading || error ? "none" : "block" }}
            />
            {loading && !error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                        <Loader2 className="relative w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                    <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300/60">
                        Loading Volume
                    </p>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-8 text-center">
                    <p className="text-sm font-semibold text-slate-300">Unable to render scan</p>
                    <p className="text-xs text-slate-500 max-w-[260px]">{error}</p>
                </div>
            )}
        </div>
    );
}

// ── NiiVue mini viewer — for the 2×2 grid ────────────────────────────────

function NiiVueMiniViewer({
    buffer,
    scanName,
    slice,
    onLoad,
}: {
    buffer: ArrayBuffer | null;
    scanName?: string;
    slice: number;
    onLoad?: (nz: number, mid: number) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nvRef = useRef<any>(null);
    const totalRef = useRef(1);
    const aliveRef = useRef(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!buffer) { setLoading(true); setError(null); return; }
        if (!canvasRef.current) return;

        aliveRef.current = true;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const { Niivue } = await import("@niivue/niivue");
                if (!aliveRef.current || !canvasRef.current) return;

                const nv = new Niivue({
                    isResizeCanvas: true,
                    backColor: [0.02, 0.05, 0.09, 1],
                    crosshairWidth: 0,
                    isColorbar: false,
                    dragMode: 1,
                    loadingText: "",
                });
                nvRef.current = nv;
                await nv.attachToCanvas(canvasRef.current);
                nv.setSliceType(0);

                const miniVolumes: any[] = [{ url: buffer, name: scanName ?? "scan.nii", colormap: "gray" }];
                await nv.loadVolumes(miniVolumes);
                if (!aliveRef.current) return;

                const dims: number[] = nv.volumes[0].hdr!.dims;
                const nz = Math.max(dims[3] ?? 1, 1);
                totalRef.current = nz;
                _seek(nv, 0, nz);
                onLoad?.(nz, 0);
                setLoading(false);
            } catch (err: any) {
                if (aliveRef.current) { setError(err?.message ?? "Failed to load"); setLoading(false); }
            }
        })();

        return () => { aliveRef.current = false; nvRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buffer]);

    useEffect(() => {
        const nv = nvRef.current;
        if (!nv || loading || error) return;
        _seek(nv, slice, totalRef.current);
    }, [slice, loading, error]);

    return (
        <div className="relative w-full h-full" style={{ background: "#050d18" }}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: loading || error ? "none" : "block" }}
            />
            {!loading && !error && <OrientLabels mini />}
            {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400/60" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
                    <p className="text-[10px] text-slate-500">{error}</p>
                </div>
            )}
        </div>
    );
}

function _seek(nv: any, sliceIdx: number, nz: number) {
    if (!nv?.scene) return;
    const target = sliceIdx / Math.max(nz - 1, 1);
    const pos: [number, number, number] = [...nv.scene.crosshairPos] as [number, number, number];
    if (Math.abs(pos[2] - target) < 0.5 / nz) return;
    pos[2] = target;
    nv.scene.crosshairPos = pos;
    nv.drawScene();
}

function _currentSliceIdx(nv: any, nz: number): number {
    if (!nv?.scene) return 0;
    return Math.round((nv.scene.crosshairPos?.[2] ?? 0) * Math.max(nz - 1, 1));
}
