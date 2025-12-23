"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Stethoscope, Shield, Check, Eye, EyeOff } from "lucide-react";

// Types
type Step = 1 | 2 | 3;
type Role = "radiologist" | "admin";

export function SignupForm() {
    const [step, setStep] = useState<Step>(1);
    const [role, setRole] = useState<Role | null>(null);
    const [showPass, setShowPass] = useState(false);

    // Step 1 UI
    const StepOne = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">First Name</label>
                    <input
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg h-11 px-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="e.g. Jane"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Last Name</label>
                    <input
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg h-11 px-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="e.g. Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Work Email</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <input
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg h-11 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="doctor@hospital.org"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Medical License ID</label>
                    <input
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg h-11 px-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="LIC-12345678"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Password</label>
                    <div className="relative">
                        <input
                            type={showPass ? "text" : "password"}
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg h-11 pl-4 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 2 UI
    const StepTwo = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Role</h3>
            <div className="grid grid-cols-2 gap-4">
                {/* Role Card 1 */}
                <div
                    onClick={() => setRole("radiologist")}
                    className={cn(
                        "cursor-pointer relative p-6 rounded-xl border transition-all duration-200",
                        role === "radiologist"
                            ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-600 dark:ring-blue-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent hover:border-blue-300 dark:hover:bg-slate-900/50"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                        role === "radiologist"
                            ? "bg-blue-600 text-white dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    )}>
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <h4 className={cn("font-bold text-sm mb-1", role === "radiologist" ? "text-blue-900 dark:text-white" : "text-slate-900 dark:text-slate-100")}>
                        Radiologist / Doctor
                    </h4>
                    <p className={cn("text-xs leading-relaxed", role === "radiologist" ? "text-blue-700 dark:text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                        Full access to scan analysis, AI segmentation tools, and patient reporting workflows.
                    </p>
                </div>

                {/* Role Card 2 */}
                <div
                    onClick={() => setRole("admin")}
                    className={cn(
                        "cursor-pointer relative p-6 rounded-xl border transition-all duration-200",
                        role === "admin"
                            ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-600 dark:ring-blue-500"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent hover:border-purple-300 dark:hover:bg-slate-900/50"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                        role === "admin"
                            ? "bg-purple-600 text-white dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                    )}>
                        <Shield className="w-6 h-6" />
                    </div>
                    <h4 className={cn("font-bold text-sm mb-1", role === "admin" ? "text-blue-900 dark:text-white" : "text-slate-900 dark:text-slate-100")}>
                        Administrator
                    </h4>
                    <p className={cn("text-xs leading-relaxed", role === "admin" ? "text-blue-700 dark:text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                        Manage institution settings, user permissions, integrations, and compliance audits.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {/* Steps Vertical Line */}
            <div className="absolute -left-12 top-2 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block">
                <div
                    className="absolute top-0 w-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                    style={{ height: step === 1 ? "10%" : step === 2 ? "50%" : "100%" }}
                />
            </div>

            {/* Step Indicators */}
            <div className="space-y-12 relative">
                {/* Step 1 Block */}
                <div className={cn("transition-opacity duration-300", step !== 1 && "opacity-40 pointer-events-none")}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                            step >= 1
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}>
                            {step > 1 ? <Check size={16} /> : "1"}
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Identity & Credentials</h3>
                    </div>
                    {step === 1 && (
                        <div className="pl-11 pb-8 border-l border-slate-200 dark:border-slate-800 ml-4 lg:ml-0 lg:border-none lg:pl-0 lg:pb-0">
                            <StepOne />
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2 Block */}
                <div className={cn("transition-opacity duration-300", step !== 2 && "opacity-40 pointer-events-none")}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                            step >= 2
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}>
                            {step > 2 ? <Check size={16} /> : "2"}
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Select Role</h3>
                    </div>
                    {step === 2 && (
                        <div className="pl-11 pb-8 border-l border-slate-200 dark:border-slate-800 ml-4 lg:ml-0 lg:border-none lg:pl-0 lg:pb-0">
                            <StepTwo />
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-6 py-2.5 text-sm font-medium transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!role}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3 Placeholder */}
                <div className={cn("transition-opacity duration-300", step !== 3 && "opacity-40")}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors",
                            step >= 3
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        )}>3</div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">System Preferences</h3>
                    </div>
                </div>

            </div>
        </div>
    );
}