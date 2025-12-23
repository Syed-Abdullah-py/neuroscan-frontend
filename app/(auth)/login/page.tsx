import { Metadata } from "next";
import Link from "next/link";
import { Mail, Lock, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BiometricScanner } from "@/features/auth/components/biometric-scanner";

export const metadata: Metadata = {
    title: "Login | NeuroScan Admin Portal",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30">

            {/* 
               PERFORMANCE OPTIMIZATION: 
               1. No transitions on background layers.
               2. No backdrop-blur on full-screen layers.
               3. Static gradients.
            */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
                {/* Opacity layer instead of blur for performance */}
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>

            {/* Navbar - Matched Signup Page Structure */}
            <header className="absolute top-0 left-0 w-full p-4 md:p-8 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 md:gap-3">
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan AI</span>
                    </Link>
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="hidden md:inline">Don&apos;t have an account?</span>
                    <Link href="/signup" className="text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center group">
                        Create Workspace <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-[700px] px-4 pt-24 pb-12 md:py-20">

                {/* Card Title */}
                <div className="text-center mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-3 text-slate-900 dark:text-white">
                        Admin Portal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg px-4">
                        Enter your credentials to access patient data.
                    </p>
                </div>

                {/* Glass Card - Matched Styles */}
                <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-lg shadow-slate-300/60 dark:shadow-xl dark:shadow-black overflow-hidden">

                    <div className="p-6 md:p-12 space-y-8">

                        {/* Form */}
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
                                    Institutional Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="doctor@hospital.org"
                                    icon={<Mail className="w-4 h-4 text-slate-400" />}
                                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                        Password
                                    </label>
                                    <Link href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    icon={<Lock className="w-4 h-4 text-slate-400" />}
                                    className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600"
                                />
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 h-12 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]">
                                Sign In <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                <span className="bg-transparent px-3 text-slate-400 dark:text-slate-500">
                                    Or verify with
                                </span>
                            </div>
                        </div>

                        {/* Biometric Component Container */}
                        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 p-5">
                            <BiometricScanner />
                        </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="bg-slate-50/80 dark:bg-black/20 p-4 text-center border-t border-slate-100 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                            By logging in, you agree to NeuroScan&apos;s <Link href="#" className="underline hover:text-blue-500">Terms</Link> and <Link href="#" className="underline hover:text-blue-500">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="mt-8 flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        HIPAA Compliant v2.4.1
                    </div>
                </div>
            </main>
        </div>
    );
}