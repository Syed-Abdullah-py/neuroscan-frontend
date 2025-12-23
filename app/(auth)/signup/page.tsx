import { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
    title: "Create Workspace | NeuroScan AI",
};

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[40%_60%] transition-colors duration-300">
            {/* LEFT: Marketing/Testimonial (Stays Dark or uses Secondary color) */}
            <div className="hidden lg:flex flex-col p-12 relative overflow-hidden border-r border-border bg-slate-950 text-white dark:bg-card">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 dark:via-background dark:to-background" />

                <div className="relative z-10 mb-auto">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold">NeuroScan AI</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
                        Precision in every <span className="text-blue-500">voxel</span>.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Join the network of elite medical professionals using next-generation AI for brain tumor segmentation and analysis.
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl dark:bg-card/50 dark:border-border">
                    <div className="absolute -top-3 right-8 bg-blue-600 px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-white">Trusted by Experts</div>
                    <div className="flex gap-1 text-yellow-400 mb-4">
                        {[1, 2, 3, 4, 5].map((i) => <span key={i}>★</span>)}
                    </div>
                    <blockquote className="text-slate-200 mb-6 font-light dark:text-muted-foreground">
                        &quot;The granularity of the segmentation models in NeuroScan has completely transformed our pre-operative planning workflow.&quot;
                    </blockquote>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="text-blue-900 w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-semibold text-sm text-white dark:text-foreground">Dr. Sarah Chen</div>
                            <div className="text-slate-500 text-xs dark:text-muted-foreground">Chief of Radiology, Mercy Hospital</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Form Wizard */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-24 relative bg-background">
                <div className="absolute top-8 right-20 text-sm text-muted-foreground">
                    Already a member? <Link href="/login" className="text-foreground hover:text-primary ml-1 inline-flex items-center font-medium">Log In</Link>
                </div>

                <div className="w-full max-w-xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-2 text-foreground">Create your workspace</h2>
                        <p className="text-muted-foreground">Complete the setup below to access the NeuroScan platform.</p>
                    </div>

                    <SignupForm />
                </div>
            </div>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
}