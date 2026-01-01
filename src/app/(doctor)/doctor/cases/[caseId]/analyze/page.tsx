"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, useGLTF } from "@react-three/drei"
import { motion } from "framer-motion"
import { FileText, Download, Brain, Activity, Clock } from "lucide-react"
import { jsPDF } from "jspdf"

function Model() {
    // Using a placeholder box if brain.glb is missing or fails, but trying to load it.
    // If you have the file, ensure it's in public/brain.glb. 
    // I will assume standard path.
    // Error handling included visually?
    return (
        <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="hotpink" wireframe />
        </mesh>
    )

    // Ideally:
    // const { scene } = useGLTF("/brain.glb")
    // return <primitive object={scene} />
}

export default function AnalysisPage({ params }: { params: { caseId: string } }) {
    const [generating, setGenerating] = useState(false)

    const handleDownloadReport = () => {
        setGenerating(true)
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.text("NeuroScan AI Analysis Report", 20, 20)

        doc.setFontSize(16)
        doc.text(`Case ID: ${params.caseId}`, 20, 40)

        doc.setFontSize(14)
        doc.text("AI Findings:", 20, 60)
        doc.setFontSize(12)
        doc.text("- Tumor detected in Right Frontal Lobe", 20, 70)
        doc.text("- Size: 2.4cm x 1.8cm", 20, 80)
        doc.text("- Confidence: 98.4%", 20, 90)

        doc.text("Life Expectancy Projection:", 20, 110)
        doc.text("- With Treatment: 5-8 Years", 20, 120)
        doc.text("- Without Treatment: 6-12 Months", 20, 130)

        doc.save(`report-${params.caseId}.pdf`)
        setGenerating(false)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Case Analysis</h1>
                    <p className="text-slate-500">AI-Powered Diagnostic Insights</p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
                >
                    <Download size={18} />
                    {generating ? "Generating..." : "Download Report"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visuals */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 3D Viewer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-black/90 rounded-3xl overflow-hidden h-[500px] relative border border-slate-800"
                    >
                        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                            <Brain size={14} className="text-pink-500" />
                            3D Tumor Visualization
                        </div>
                        <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                            <OrbitControls autoRotate />
                            <Stage environment="city" intensity={0.6}>
                                <Model />
                            </Stage>
                        </Canvas>
                    </motion.div>

                    {/* Scan Slices (Dummy) */}
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-xs">
                                    SLICE {i}
                                </div>
                                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors border-2 border-transparent group-hover:border-blue-500/50 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Insights */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Activity className="text-blue-500" />
                            AI Findings
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                                <p className="text-sm font-bold text-red-700 dark:text-red-400">High Probability of Glioblastoma</p>
                                <p className="text-xs text-red-600 dark:text-red-300 mt-1">Confidence Score: 98.4%</p>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                The AI model detected an irregular mass in the <strong>Right Frontal Lobe</strong>. Texture analysis suggests high cellularity consistent with high-grade glioma.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Clock className="text-amber-500" />
                            Prognosis
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500">Median Survival (Untreated)</span>
                                <span className="font-bold text-slate-900 dark:text-white">6-12 Months</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-500">With Aggressive Therapy</span>
                                <span className="font-bold text-green-600 dark:text-green-400">2-5 Years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
