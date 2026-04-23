"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    Float,
    PerspectiveCamera,
    Center
} from "@react-three/drei";
import { EffectComposer, Vignette, SMAA } from "@react-three/postprocessing";
import { Suspense, useRef, useLayoutEffect, useState, useEffect } from "react";
import { Loader2, Move3d, MousePointer2, Settings2, Maximize2, Minimize2, RotateCcw, PauseCircle } from "lucide-react";
import * as THREE from "three";

const NODE_MATERIALS: Record<string, { color: number; emissive: number; emissiveIntensity: number }> = {
    ncr: { color: 0xdc3232, emissive: 0xdc3232, emissiveIntensity: 0.5 },
    edema: { color: 0xe6c832, emissive: 0xe6c832, emissiveIntensity: 0.5 },
    enhancing: { color: 0x32c8dc, emissive: 0x32c8dc, emissiveIntensity: 0.5 },
    brain_surface: { color: 0xa0a0a0, emissive: 0x000000, emissiveIntensity: 0 },
};

type LayerKey = "brain_surface" | "ncr" | "edema" | "enhancing";

const LAYERS: { key: LayerKey; label: string; desc: string; hex: string }[] = [
    { key: "brain_surface", label: "Brain Surface", desc: "Outer tissue", hex: "#a0a0a0" },
    { key: "ncr", label: "Necrotic Core", desc: "Dead tissue", hex: "#dc3232" },
    { key: "edema", label: "Edema", desc: "Swelling", hex: "#e6c832" },
    { key: "enhancing", label: "Active Tumor", desc: "Growing cells", hex: "#32c8dc" },
];

function BrainModel({
    visible,
    rotating,
}: {
    visible: Record<LayerKey, boolean>;
    rotating: boolean;
}) {
    const { scene } = useGLTF("/models/brain.glb");
    const modelRef = useRef<THREE.Group>(null);
    const angleRef = useRef(0);

    useLayoutEffect(() => {
        scene.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            let node: THREE.Object3D = mesh;
            while (node.parent && !node.name) node = node.parent;

            const def = NODE_MATERIALS[node.name];
            const isBrainSurface = node.name === "brain_surface";

            mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(def?.color ?? 0xffffff),
                emissive: new THREE.Color(def?.emissive ?? 0x000000),
                emissiveIntensity: def?.emissiveIntensity ?? 0,
                roughness: 0.4,
                metalness: 0.3,
                envMapIntensity: 1.0,
                transparent: isBrainSurface,
                opacity: isBrainSurface ? 0.25 : 1.0,
                depthWrite: !isBrainSurface,
                side: isBrainSurface ? THREE.DoubleSide : THREE.FrontSide,
            });
        });
    }, [scene]);

    useLayoutEffect(() => {
        scene.traverse((child) => {
            let node: THREE.Object3D = child;
            while (node.parent && !node.name) node = node.parent;
            const key = node.name as LayerKey;
            if (key in visible) child.visible = visible[key];
        });
    }, [scene, visible]);

    useFrame((_, delta) => {
        if (modelRef.current && rotating) {
            angleRef.current += delta * 0.1;
            modelRef.current.rotation.y = angleRef.current;
        }
    });

    return (
        <group ref={modelRef}>
            <Center>
                <primitive object={scene} scale={0.5} rotation={[-Math.PI / 2, 0, 0]} />
            </Center>
        </group>
    );
}

export function ThreeDViewer() {
    const [panelOpen, setPanelOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState<Record<LayerKey, boolean>>({
        brain_surface: true,
        ncr: true,
        edema: true,
        enhancing: true,
    });

    const toggle = (key: LayerKey) =>
        setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ background: "#050d18" }}
        >
            {/* Fine grid */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                backgroundImage:
                    "linear-gradient(rgba(0,160,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,160,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }} />
            {/* Central glow */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(0,60,140,0.22) 0%, transparent 68%)",
            }} />

            <Suspense
                fallback={
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
                        style={{ background: "#050d18" }}>
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                            <Loader2 className="relative animate-spin w-10 h-10 text-cyan-400" />
                        </div>
                        <span className="text-xs text-cyan-300/70 mt-5 font-mono tracking-[0.25em] uppercase">
                            Initializing Neural Render
                        </span>
                    </div>
                }
            >
                <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
                    <PerspectiveCamera makeDefault position={[-100, 0, 180]} fov={50} />

                    <ambientLight intensity={2.5} color="#ffffff" />
                    <spotLight position={[50, 50, 50]} angle={0.2} penumbra={1} intensity={5000} color="#00e5ff" castShadow />
                    <pointLight position={[-20, -20, -20]} intensity={2000} color="#bd00ff" />
                    <spotLight position={[0, 50, -50]} intensity={3000} color="white" />
                    <pointLight position={[0, -50, 50]} intensity={1500} color="#ffffff" />

                    <Environment preset="city" blur={1} />

                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                        <BrainModel visible={visible} rotating={autoRotate} />
                    </Float>

                    <EffectComposer enableNormalPass={false} multisampling={0}>
                        <SMAA />
                        <Vignette eskil={false} offset={0.2} darkness={0.4} />
                    </EffectComposer>

                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.5}
                        minDistance={80}
                        maxDistance={300}
                    />
                </Canvas>
            </Suspense>

            {/* Top-left: LIVE badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 backdrop-blur-md"
                style={{ background: "rgba(0,180,255,0.08)" }}>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-[10px] font-bold text-cyan-300 tracking-[0.2em] uppercase">Live View</span>
            </div>

            {/* Top-right: fullscreen + settings */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl border border-slate-600/40 backdrop-blur-md text-slate-400 hover:text-slate-200 hover:border-slate-500/60 transition-all"
                    style={{ background: "rgba(15,23,42,0.65)" }}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                    onClick={() => setPanelOpen((v) => !v)}
                    className={`p-2 rounded-xl border backdrop-blur-md transition-all ${panelOpen
                        ? "border-cyan-500/50 text-cyan-300"
                        : "border-slate-600/40 text-slate-400 hover:text-slate-200 hover:border-slate-500/60"
                        }`}
                    style={{ background: panelOpen ? "rgba(0,180,255,0.12)" : "rgba(15,23,42,0.65)" }}
                >
                    <Settings2 className="w-4 h-4" />
                </button>
            </div>

            {/* Settings panel */}
            {panelOpen && (
                <div
                    className="absolute top-14 right-4 z-10 w-52 rounded-2xl border border-white/[0.07] backdrop-blur-xl shadow-2xl overflow-hidden"
                    style={{ background: "rgba(6,12,24,0.92)" }}
                >
                    {/* Rotation toggle — full-width pill at top */}
                    <div className="px-3 pt-3 pb-2">
                        <button
                            onClick={() => setAutoRotate((v) => !v)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${autoRotate
                                    ? "border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white"
                                    : "border-cyan-500/40 text-cyan-300 bg-cyan-500/[0.08]"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {autoRotate
                                    ? <PauseCircle className="w-3.5 h-3.5" />
                                    : <RotateCcw className="w-3.5 h-3.5" />}
                                <span className="text-[11px] font-semibold tracking-wide">
                                    {autoRotate ? "Stop Rotation" : "Resume Rotation"}
                                </span>
                            </div>
                            {/* State pill */}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${autoRotate ? "bg-green-500/20 text-green-400" : "bg-slate-700/60 text-slate-500"
                                }`}>
                                {autoRotate ? "ON" : "OFF"}
                            </span>
                        </button>
                    </div>

                    <div className="mx-3 h-px bg-white/[0.06]" />

                    {/* Layers section */}
                    <div className="px-3 pt-2.5 pb-3">
                        <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.18em] mb-2 px-1">
                            Layers
                        </p>
                        <div className="flex flex-col gap-0.5">
                            {LAYERS.map(({ key, label, desc, hex }) => {
                                const on = visible[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggle(key)}
                                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all text-left ${on ? "hover:bg-white/[0.04]" : "opacity-50 hover:opacity-70"
                                            }`}
                                    >
                                        {/* Swatch */}
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/10"
                                            style={{
                                                background: on ? hex : "transparent",
                                                borderColor: hex,
                                                border: on ? undefined : `1.5px solid ${hex}66`,
                                                boxShadow: on ? `0 0 7px ${hex}77` : "none",
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-semibold leading-none ${on ? "text-slate-100" : "text-slate-500"}`}>
                                                {label}
                                            </p>
                                            <p className="text-[9px] text-slate-600 mt-0.5">{desc}</p>
                                        </div>
                                        {/* Toggle track */}
                                        <div className={`w-6 h-3 rounded-full flex-shrink-0 transition-colors relative ${on ? "bg-cyan-500/40" : "bg-slate-700/60"}`}>
                                            <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${on ? "left-3.5 bg-cyan-300" : "left-0.5 bg-slate-500"}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom controls pill */}
            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 rounded-full border border-slate-700/30 backdrop-blur-xl shadow-2xl z-10"
                style={{ background: "rgba(8,15,28,0.70)" }}
            >
                <div className="flex items-center gap-2">
                    <Move3d className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-300 font-semibold">Rotate</span>
                </div>
                <div className="w-px h-3 bg-slate-700/80" />
                <div className="flex items-center gap-2">
                    <MousePointer2 className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-300 font-semibold">Scroll to Zoom</span>
                </div>
            </div>
        </div>
    );
}

useGLTF.preload("/models/brain.glb");
