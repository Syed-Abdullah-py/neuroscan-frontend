import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-blue-500/30">

      {/* ========================================================================
          BACKGROUND LAYERS
         ======================================================================== */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* ========================================================================
          NAVBAR
         ======================================================================== */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan</span>
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:inline-block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Contact Support
          </Link>
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-transparent">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ========================================================================
          HERO SECTION
         ======================================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-32 px-4 text-center max-w-7xl mx-auto w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          FDA Approved v2.4
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mb-6 animate-in fade-in slide-in-from-bottom-5 duration-1000 leading-[1.1]">
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Neuro-Imaging</span> Intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          Empowering radiologists with real-time AI segmentation, volumetric analysis, and instant second opinions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
              Create Workspace
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-1">
              Admin Portal
            </Button>
          </Link>
        </div>

        {/* ========================================================================
            DASHBOARD PREVIEW
           ======================================================================== */}
        <div className="mt-20 relative w-full max-w-6xl aspect-video md:aspect-2/1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-t-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 opacity-0 fill-mode-forwards" style={{ animationFillMode: "forwards" }}>

          {/* Fake Browser Header */}
          <div className="h-12 border-b border-white/50 dark:border-white/5 flex items-center px-4 gap-2 bg-white/20 dark:bg-black/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
          </div>

          {/* Content Placeholder */}
          <div className="absolute inset-0 top-12 bg-linear-to-br from-slate-50/30 to-slate-100/30 dark:from-slate-900/30 dark:to-black/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <Activity className="w-16 h-16 text-slate-400 dark:text-slate-600 relative z-10 mx-auto" />
              </div>
              <span className="text-slate-500 dark:text-slate-500 font-mono text-sm tracking-widest uppercase block">
                [ Interactive Dashboard Preview Placeholder ]
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}