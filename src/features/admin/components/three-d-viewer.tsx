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
import { Suspense, useRef, useLayoutEffect, useState } from "react";
import { Loader2, Move3d, MousePointer2, Settings2 } from "lucide-react";
import * as THREE from "three";

const NODE_MATERIALS: Record<string, { color: number; emissive: number; emissiveIntensity: number }> = {
    ncr:           { color: 0xdc3232, emissive: 0xdc3232, emissiveIntensity: 0.5 },
    edema:         { color: 0xe6c832, emissive: 0xe6c832, emissiveIntensity: 0.5 },
    enhancing:     { color: 0x32c8dc, emissive: 0x32c8dc, emissiveIntensity: 0.5 },
    brain_surface: { color: 0xa0a0a0, emissive: 0x000000, emissiveIntensity: 0   },
};

type LayerKey = "brain_surface" | "ncr" | "edema" | "enhancing";

const LAYERS: { key: LayerKey; label: string; desc: string; dot: string }[] = [
    { key: "brain_surface", label: "Brain Surface", desc: "Outer brain tissue",    dot: "bg-[#a0a0a0] opacity-50" },
    { key: "ncr",           label: "Necrotic Core", desc: "Dead tissue at center", dot: "bg-[#dc3232]"            },
    { key: "edema",         label: "Edema",          desc: "Swelling around tumor", dot: "bg-[#e6c832]"            },
    { key: "enhancing",     label: "Active Tumor",   desc: "Growing tumor cells",   dot: "bg-[#32c8dc]"            },
];

function BrainModel({ visible }: { visible: Record<LayerKey, boolean> }) {
    const { scene } = useGLTF("/models/brain.glb");
    const modelRef = useRef<THREE.Group>(null);

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
                color:             new THREE.Color(def?.color    ?? 0xffffff),
                emissive:          new THREE.Color(def?.emissive ?? 0x000000),
                emissiveIntensity: def?.emissiveIntensity ?? 0,
                roughness:         0.4,
                metalness:         0.3,
                envMapIntensity:   1.0,
                transparent:       isBrainSurface,
                opacity:           isBrainSurface ? 0.18 : 1.0,
                depthWrite:        !isBrainSurface,
                side:              isBrainSurface ? THREE.DoubleSide : THREE.FrontSide,
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

    useFrame((state) => {
        if (modelRef.current)
            modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
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
    const [visible, setVisible] = useState<Record<LayerKey, boolean>>({
        brain_surface: true,
        ncr:           true,
        edema:         true,
        enhancing:     true,
    });

    const toggle = (key: LayerKey) =>
        setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden">
            <Suspense
                fallback={
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
                        <span className="text-sm text-blue-200 mt-4 font-mono animate-pulse">
                            INITIALIZING NEURAL RENDER...
                        </span>
                    </div>
                }
            >
                <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
                    <PerspectiveCamera makeDefault position={[-100, 0, 180]} fov={50} />

                    <ambientLight intensity={1} />
                    <spotLight position={[50, 50, 50]} angle={0.2} penumbra={1} intensity={2000} color="#00e5ff" castShadow />
                    <pointLight position={[-20, -20, -20]} intensity={800} color="#bd00ff" />
                    <spotLight position={[0, 50, -50]} intensity={1200} color="white" />

                    <Environment preset="city" blur={1} />

                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                        <BrainModel visible={visible} />
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
                        autoRotate
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </Suspense>

            {/* Bottom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-slate-900/40 backdrop-blur-md rounded-full border border-slate-700/30 shadow-xl z-10">
                <div className="flex items-center gap-2">
                    <Move3d className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Rotate</span>
                </div>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Zoom</span>
                </div>
            </div>

            {/* Live view badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full z-10">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-[10px] font-bold text-blue-400 tracking-widest">LIVE VIEW</span>
            </div>

            {/* Gear button */}
            <button
                onClick={() => setPanelOpen((v) => !v)}
                className={`absolute top-4 right-4 z-20 p-2 rounded-xl border backdrop-blur-md transition-all ${
                    panelOpen
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-slate-900/70 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/60"
                }`}
            >
                <Settings2 className="w-4 h-4" />
            </button>

            {/* Layer panel — slides in from right */}
            {panelOpen && (
                <div className="absolute top-14 right-4 z-10 flex flex-col gap-1 px-4 py-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/40 min-w-[210px] shadow-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Visible Layers
                    </p>
                    {LAYERS.map(({ key, label, desc, dot }) => (
                        <label
                            key={key}
                            className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors group"
                        >
                            {/* Custom checkbox */}
                            <div className="relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={visible[key]}
                                    onChange={() => toggle(key)}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                    visible[key]
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-transparent border-slate-600 group-hover:border-slate-400"
                                }`}>
                                    {visible[key] && (
                                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${dot}`} />

                            <div className="min-w-0">
                                <p className={`text-[11px] font-semibold leading-none transition-colors ${
                                    visible[key] ? "text-slate-200" : "text-slate-500"
                                }`}>
                                    {label}
                                </p>
                                <p className="text-[9px] text-slate-600 mt-0.5">{desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

useGLTF.preload("/models/brain.glb");
