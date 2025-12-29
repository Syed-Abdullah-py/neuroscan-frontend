"use client";

import Link from "next/link";
import { Check, ArrowRight, Lock, Activity, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignupForm } from "@/features/auth/components/signup-form";
import { useState } from "react";

// Types
type Step = 1 | 2 | 3;
type Role = "radiologist" | "admin";

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1);
    const [role, setRole] = useState<Role | null>(null);

    const handleNext = () => setStep((prev) => (prev < 3 ? (prev + 1) as Step : prev));
    const handleBack = () => setStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30">

            {/* Background Layers */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-4 md:p-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 md:gap-3">
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Brain className="w-5 h-5" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan AI</span>
                    </Link>
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="hidden md:inline">Already a member?</span>
                    <Link href="/login" className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                        Log In <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </header>

            {/* Main Content Card */}
            <main className="relative z-10 w-full max-w-[800px] px-4 pt-24 pb-12 md:py-20">
                <div className="text-center mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-3 text-slate-900 dark:text-white">
                        Create your workspace
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg px-4">
                        Setup your medical analysis environment in a few steps.
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                    <div className="p-6 md:p-14">

                        {/* Stepper */}
                        <div className="mb-12 md:mb-14 mx-auto max-w-lg">
                            <div className="flex items-center justify-between relative">
                                {/* Connecting Line */}
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-500 ease-out"
                                    style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                                ></div>

                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 transition-all duration-300",
                                            s === step
                                                ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110"
                                                : s < step
                                                    ? "bg-blue-100 border-blue-600 text-blue-600 dark:bg-slate-900 dark:text-blue-500"
                                                    : "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-600"
                                        )}>
                                            {s < step ? <Check size={14} strokeWidth={3} /> : s}
                                        </div>
                                        <span className={cn(
                                            "absolute -bottom-8 text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300",
                                            s === step
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-slate-400 dark:text-slate-600"
                                        )}>
                                            {s === 1 && "Identity"}
                                            {s === 2 && "Role"}
                                            {s === 3 && "Preferences"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Area - Passing State to the Logic Component */}
                        <div className="min-h-[300px]">
                            <SignupForm
                                currentStep={step}
                                onNext={handleNext}
                                onBack={handleBack}
                                onRoleSelect={setRole}
                                selectedRole={role}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-8 flex flex-col items-center gap-3 text-center px-4">
                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                        <Lock className="w-3 h-3" />
                        Secured by 256-bit Encryption • HIPAA Compliant
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-600">
                        © 2025 NeuroScan AI Medical Systems. Designed for authorized medical personnel only.
                    </p>
                </div>
            </main>
        </div>
    );
}