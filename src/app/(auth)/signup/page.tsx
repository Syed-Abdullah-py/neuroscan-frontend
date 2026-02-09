"use client";

import Link from "next/link";
import { Check, ArrowRight, Lock, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignupForm } from "@/features/auth/components/signup-form";
import { useState } from "react";

// Types
type Step = 1 | 2;
type Role = "radiologist" | "admin";

export default function SignupPage() {
    const [step, setStep] = useState<Step>(1);
    const [role, setRole] = useState<Role | null>(null);

    const handleNext = () => setStep((prev) => (prev < 2 ? (prev + 1) as Step : prev));
    const handleBack = () => setStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">

            {/* Minimal Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto h-full px-6 md:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
                        </div>
                        <span className="text-lg font-bold">NeuroScan</span>
                    </Link>

                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400">
                            Already a member?
                        </span>
                        <Link
                            href="/login"
                            className="flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors group"
                        >
                            Log In
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative min-h-screen flex items-center justify-center pt-2 px-6 md:px-8">
                <div className="w-full max-w-2xl py-20">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Create your account with
                            <span className="italic text-neutral-500">- Neuroscan</span>
                        </h1>

                        <p className="text-base text-neutral-600 dark:text-neutral-400">
                            Get started with NeuroScan in a few simple steps.
                        </p>
                    </div>

                    {/* Signup Card */}
                    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="p-8 md:p-12">

                            {/* Stepper - Elegant 2-step design */}
                            <div className="mb-12 mx-auto max-w-xs">
                                <div className="flex items-center justify-between relative">
                                    {/* Background Line */}
                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />

                                    {/* Progress Line */}
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-black dark:bg-white z-0 transition-all duration-500 ease-out"
                                        style={{ width: step === 1 ? '0%' : '100%' }}
                                    />

                                    {[1, 2].map((s) => (
                                        <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                                s === step
                                                    ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black scale-110"
                                                    : s < step
                                                        ? "bg-neutral-100 dark:bg-neutral-800 border-black dark:border-white text-black dark:text-white"
                                                        : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-400"
                                            )}>
                                                {s < step ? <Check size={16} strokeWidth={2.5} /> : s}
                                            </div>
                                            <span className={cn(
                                                "absolute -bottom-8 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300",
                                                s === step
                                                    ? "text-black dark:text-white"
                                                    : "text-neutral-400 dark:text-neutral-600"
                                            )}>
                                                {s === 1 && "Role"}
                                                {s === 2 && "Details"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Area */}
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
                    <div className="mt-8 flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
                            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                            256-bit Encryption • HIPAA Compliant
                        </div>
                        <p className="text-xs text-neutral-500 text-center">
                            © 2025 NeuroScan AI Medical Systems. Authorized medical personnel only.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}