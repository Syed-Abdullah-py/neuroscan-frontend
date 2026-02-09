import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Brain, Check } from "lucide-react";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
    title: "Login | NeuroScan",
};

export default function LoginPage() {
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
                            Don't have an account?
                        </span>
                        <Link
                            href="/signup"
                            className="flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors group"
                        >
                            Create Workspace
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative min-h-screen flex items-center justify-center px-6 md:px-8">
                <div className="w-full max-w-md py-20">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                            Secure Access
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Neuroscan
                            <span className="italic text-neutral-500">- Login</span>
                        </h1>

                        <p className="text-base text-neutral-600 dark:text-neutral-400">
                            Enter your credentials to access patient data.
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="p-8">
                            <Suspense
                                fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <Loader2 className="animate-spin w-6 h-6" strokeWidth={2} />
                                    </div>
                                }
                            >
                                <LoginForm />
                            </Suspense>
                        </div>

                        {/* Footer */}
                        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 border-t border-neutral-200 dark:border-neutral-800">
                            <p className="text-xs text-neutral-500 text-center leading-relaxed">
                                By logging in, you agree to NeuroScan's{" "}
                                <Link href="#" className="underline hover:text-black dark:hover:text-white transition-colors">
                                    Terms
                                </Link>
                                {" "}and{" "}
                                <Link href="#" className="underline hover:text-black dark:hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                            HIPAA Compliant v2.4.1
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}