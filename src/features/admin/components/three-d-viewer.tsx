"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    Float,
    Sparkles,
    ContactShadows,
    PerspectiveCamera,
    Center
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef, useLayoutEffect } from "react";
import { Loader2, Move3d, MousePointer2 } from "lucide-react";
import * as THREE from "three";

function BrainModel() {
    const { scene } = useGLTF("/models/brain.glb");
    const modelRef = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.roughness = 0.4;
                    mesh.material.metalness = 0.3;
                    mesh.material.envMapIntensity = 1.0;
                    mesh.material.needsUpdate = true;
                }
            }
        });
    }, [scene]);

    useFrame((state) => {
        if (modelRef.current) {
            modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={modelRef}>
            <Center>
                {/* CONTROL 1: MODEL SIZE */}
                {/* Decreased scale from 2.5 to 0.8 to fit better */}
                <primitive object={scene} scale={0.5} />
            </Center>
        </group>
    );
}

export function ThreeDViewer() {
    return (
        <div className="w-full h-full relative bg-slate-950 overflow-hidden">
            <Suspense
                fallback={
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
                        <Loader2 className="animate-spin w-12 h-12 text-blue-500 relative z-10" />
                        <span className="text-sm text-blue-200 mt-4 font-mono animate-pulse">INITIALIZING NEURAL RENDER...</span>
                    </div>
                }
            >
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    gl={{ antialias: false }}
                >
                    {/* Fixed Perspective: Wider FOV and further back camera */}
                    <PerspectiveCamera makeDefault position={[-100, 0, 180]} fov={50} />

                    <ambientLight intensity={0.4} />
                    <spotLight position={[50, 50, 50]} angle={0.2} penumbra={1} intensity={2000} color="#00e5ff" castShadow />
                    <pointLight position={[-20, -20, -20]} intensity={800} color="#bd00ff" />
                    <spotLight position={[0, 50, -50]} intensity={1200} color="white" />

                    <Environment preset="city" blur={1} />

                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                        <BrainModel />
                    </Float>

                    <Sparkles count={40} scale={100} size={3} speed={0.4} opacity={0.5} color="#00e5ff" />
                    {/* <ContactShadows resolution={512} scale={100} blur={2.5} opacity={0.5} far={20} color="#000000" /> */}

                    <EffectComposer enableNormalPass={false} multisampling={0}>
                        <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.2} radius={0.5} />
                        <Vignette eskil={false} offset={0.3} darkness={0.7} />
                    </EffectComposer>

                    <OrbitControls
                        enablePan={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.5}
                        minDistance={80}
                        maxDistance={300}
                        autoRotate={true}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
            </Suspense>

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

            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full z-10">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-bold text-blue-400 tracking-widest">LIVE VIEW</span>
            </div>
        </div>
    );
}

useGLTF.preload("/models/brain.glb");