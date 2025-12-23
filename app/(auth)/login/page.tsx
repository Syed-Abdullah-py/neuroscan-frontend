import { Metadata } from "next";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BiometricScanner } from "@/features/auth/components/biometric-scanner";

export const metadata: Metadata = {
  title: "Login | NeuroScan Admin Portal",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background transition-colors duration-300">
      {/* LEFT: Hero Section (Kept Dark intentionally for visual weight, or switch to bg-secondary) */}
      <div className="relative hidden lg:flex flex-col justify-end p-12 bg-slate-950 text-white overflow-hidden dark:bg-black/40 dark:border-r dark:border-border">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex-1 flex items-center justify-center">
           <div className="w-96 h-96 rounded-full border border-blue-500/30 flex items-center justify-center bg-black/50 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
             <Activity className="w-32 h-32 text-blue-500 opacity-80" />
           </div>
        </div>

        <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-200 text-xs font-medium mb-6">
                <ShieldCheck className="w-3 h-3" />
                HIPAA Compliant v2.4.1
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
                AI-Powered Tumor Detection & Segmentation
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
                Secure access for administrators and specialists. Our deep learning models assist in rapid diagnosis with 99.8% accuracy.
            </p>
        </div>
      </div>

      {/* RIGHT: Login Form (Adapts to Theme) */}
      <div className="flex flex-col justify-center items-center p-8 bg-background text-foreground">
        <div className="w-full max-w-[440px] space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">N</div>
                    <span className="text-xl font-bold text-foreground">NeuroScan</span>
                </div>
                <h2 className="text-3xl font-semibold text-foreground">Admin Portal</h2>
                <p className="text-muted-foreground">
                    Please enter your credentials or use biometric verification to access patient data.
                </p>
            </div>

            {/* Form */}
            <form className="space-y-5">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Institutional Email</label>
                    <Input 
                        type="email" 
                        placeholder="doctor@hospital.org" 
                        icon={<Mail className="w-4 h-4" />}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <Link href="#" className="text-sm text-primary hover:underline">Forgot Password?</Link>
                    </div>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        icon={<Lock className="w-4 h-4" />}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <Button className="w-full text-base" size="lg">Sign In</Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or verify with</span></div>
            </div>

            <BiometricScanner />

            <p className="text-center text-xs text-muted-foreground mt-8">
                By logging in, you agree to NeuroScan&apos;s <Link href="#" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
        </div>
      </div>
    </div>
  );
}