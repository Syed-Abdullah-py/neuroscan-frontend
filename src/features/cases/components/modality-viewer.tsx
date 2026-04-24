"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ModalityViewerProps {
    url: string;
    segUrl?: string;
    showMask?: boolean;
    slice: number;
    onLoad: (totalSlices: number, initialSlice: number) => void;
    onSliceChange: (slice: number) => void;
}

export function ModalityViewer(props: ModalityViewerProps) {
    return <NiiVueViewer {...props} />;
}

// ── PNG grid viewer (2×2, all 4 modalities) ────────────────────────────────

const MODALITY_LABELS: Record<string, { label: string; color: string }> = {
    t1:    { label: "T1",    color: "#60a5fa" },
    t1ce:  { label: "T1ce",  color: "#a78bfa" },
    t2:    { label: "T2",    color: "#34d399" },
    flair: { label: "FLAIR", color: "#fb923c" },
};

export function ModalityGridViewer({
    sliceBase,
    slice,
    showMask,
    onSliceChange: _onSliceChange,
}: {
    sliceBase: string;      // e.g. "/brats-slices/BraTS20_Training_001"
    slice: number;
    showMask: boolean;
    onSliceChange: (s: number) => void;
}) {
    const modalities = ["t1", "t1ce", "t2", "flair"] as const;
    const suffix = showMask ? "_m" : "";
    const padded = String(slice).padStart(3, "0");

    return (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-px bg-slate-800/60">
            {modalities.map((mod) => {
                const src = `${sliceBase}/${mod}/${padded}${suffix}.png`;
                const meta = MODALITY_LABELS[mod];
                return (
                    <div key={mod} className="relative overflow-hidden flex items-center justify-center" style={{ background: "#050d18" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={`${meta.label} slice ${slice}`}
                            className="max-h-full max-w-full object-contain"
                            style={{ imageRendering: "pixelated" }}
                            draggable={false}
                        />
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

// ── NiiVue viewer ─────────────────────────────────────────────────────────

function NiiVueViewer({
    url,
    segUrl,
    showMask = false,
    slice,
    onLoad,
    onSliceChange,
}: ModalityViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nvRef     = useRef<any>(null);
    const totalRef  = useRef(1);
    const aliveRef  = useRef(true);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState<string | null>(null);

    // Mount / URL change → init NiiVue and load volumes
    useEffect(() => {
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
                    backColor:      [0.02, 0.05, 0.09, 1],
                    crosshairWidth: 0,
                    isColorbar:     false,
                    dragMode:       1,
                    loadingText:    "",
                });
                nvRef.current = nv;
                await nv.attachToCanvas(canvasRef.current);
                nv.setSliceType(0); // axial

                const fetchBuf = async (u: string): Promise<ArrayBuffer> => {
                    const r = await fetch(u);
                    if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${u}`);
                    return r.arrayBuffer();
                };

                // Pass ArrayBuffer as `url` — NiiVue detects ArrayBuffer and uses
                // it as dataBuffer directly, skipping all internal fetch/stream logic.
                const mriBuffer = await fetchBuf(url);
                const volumes: any[] = [
                    { url: mriBuffer, name: "scan.nii", colormap: "gray" },
                ];

                // Always load seg (if available) — start invisible, toggle via opacity
                if (segUrl) {
                    const segBuffer = await fetchBuf(segUrl);
                    volumes.push({ url: segBuffer, name: "seg.nii", colormap: "actc", opacity: showMask ? 0.5 : 0 });
                }

                await nv.loadVolumes(volumes);
                if (!aliveRef.current) return;

                const dims: number[] = nv.volumes[0].hdr!.dims;
                const nz = Math.max(dims[3] ?? 1, 1);
                totalRef.current = nz;
                const mid = Math.floor(nz / 2);
                _seek(nv, mid, nz);
                onLoad(nz, mid);
                setLoading(false);

                nv.onLocationChange = (data: any) => {
                    if (!aliveRef.current || !data?.vox) return;
                    const vz = Math.round(data.vox[2] ?? 0);
                    onSliceChange(Math.max(0, Math.min(vz, nz - 1)));
                };
            } catch (err: any) {
                if (aliveRef.current) {
                    setError(err?.message ?? "Failed to load scan");
                    setLoading(false);
                }
            }
        })();

        return () => { aliveRef.current = false; nvRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Toggle mask — just flip the seg volume opacity; no refetch needed
    useEffect(() => {
        const nv = nvRef.current;
        if (!nv || loading || error || nv.volumes.length < 2) return;
        nv.volumes[1]._opacity = showMask ? 0.5 : 0;
        nv.updateGLVolume();
    }, [showMask, loading, error]);

    // Controlled slice → update crosshair position
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

function _seek(nv: any, sliceIdx: number, nz: number) {
    if (!nv?.scene) return;
    const target = sliceIdx / Math.max(nz - 1, 1);
    const pos: [number, number, number] = [...nv.scene.crosshairPos] as [number, number, number];
    if (Math.abs(pos[2] - target) < 0.5 / nz) return;
    pos[2] = target;
    nv.scene.crosshairPos = pos;
    nv.drawScene();
}
