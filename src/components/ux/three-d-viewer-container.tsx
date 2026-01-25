// src/components/three-d-viewer-container.tsx
"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// This is the dynamic import moved into a Client Component
const ThreeDViewerComponent = dynamic(
    () => import("@/features/admin/components/three-d-viewer").then((mod) => mod.ThreeDViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-mono uppercase tracking-widest opacity-70">Initializing WebGL...</p>
            </div>
        ),
    }
);

export function ThreeDViewerContainer() {
    return <ThreeDViewerComponent />;
}