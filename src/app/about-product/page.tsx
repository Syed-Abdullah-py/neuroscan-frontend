"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Moon, Sun, ArrowRight, Activity,
  ShieldCheck, Zap, BarChart3, Users,
  Globe, Play, Check, Menu
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// --- 🎨 DESIGN SYSTEM UTILITIES ---

const EASE_ELEGANT = [0.22, 1, 0.36, 1] as const;

// Custom FadeIn with Design System Easing
const FadeIn = ({ children, delay = 0, className, yOffset = 20 }: { children: React.ReactNode, delay?: number, className?: string, yOffset?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: yOffset }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, ease: EASE_ELEGANT }}
    className={className}
  >
    {children}
  </motion.div>
);

// 🔘 MAGNETIC BUTTON
const MagneticButton = ({ children, variant = "primary", className, onClick }: any) => {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative group h-12 px-8 rounded-lg font-medium transition-all duration-300 flex items-center justify-center overflow-hidden",
        isPrimary
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {isPrimary && (
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-500 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
      )}
      <span className="flex items-center gap-2 relative z-10">{children}</span>
    </motion.button>
  );
};

// 📦 GLASS FEATURE CARD
const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <FadeIn delay={delay}>
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: EASE_ELEGANT }}
      className="group relative h-full"
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-cyan-500/0 to-sky-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/10 group-hover:to-sky-500/10 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

      <div className="relative h-full p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500 hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-black/20 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
          <Icon className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
      </div>
    </motion.div>
  </FadeIn>
);

// 🖥️ RESTORED DASHBOARD VISUAL (Upgraded Style)
const DashboardMockup = () => {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-blue-900/10 dark:shadow-black/50 overflow-hidden flex flex-col h-[420px] md:h-[520px] transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
            <Brain className="w-4 h-4 text-white dark:text-slate-900" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">NeuroScan AI</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live Analysis</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 md:w-56 border-r border-slate-200/50 dark:border-slate-800/50 p-3 flex flex-col gap-1.5 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200 group",
                i === 1
                  ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                  : "hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                i === 1
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700"
              )}>
                {i}
              </div>
              <div className="hidden md:block overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Patient 00{i}</div>
                <div className="text-[10px] opacity-60 truncate">MRI Sequence T2</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 bg-slate-50/20 dark:bg-black/20 relative overflow-hidden">
          <div className="h-full rounded-xl bg-slate-900 dark:bg-black relative overflow-hidden shadow-inner border border-slate-800/50">
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Brain visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-48 h-48 text-slate-700 opacity-20" strokeWidth={0.5} />
            </div>

            {/* Animated pulse */}
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Brain className="w-48 h-48 text-blue-500 opacity-40 blur-md" strokeWidth={0.5} />
            </motion.div>

            {/* Scanning line */}
            <motion.div
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />

            {/* Detection label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-bold text-white">Analysis Complete</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Confidence: 98.7%</div>
            </motion.div>

            {/* Stats overlay */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-right"
            >
              <div className="text-[10px] text-slate-400 mb-0.5">Processing Time</div>
              <div className="text-sm font-bold text-white">0.8s</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- THEME MANAGEMENT ---
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
};

// --- MAIN LANDING PAGE ---

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100">

      {/* 🌐 NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: EASE_ELEGANT }}
              className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center group-hover:shadow-xl transition-all duration-300"
            >
              <Brain className="w-5 h-5 text-white dark:text-slate-900" strokeWidth={2} />
            </motion.div>
            <span className="text-lg font-bold tracking-tight">NeuroScan</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-400">
            {['Technology', 'Features', 'Research', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-slate-900 dark:hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <MagneticButton className="h-10 px-6 text-sm">
                Get Started
              </MagneticButton>
            </div>
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-900/20 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            {/* Text Content */}
            <div className="flex-1 max-w-3xl">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-8">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  FDA Cleared Technology
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-[0.95]">
                  Radiology,
                  <br />
                  {/* CHANGED: Gradient is now Blue/Sky/Cyan */}
                  <span className="italic font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-sky-500 to-cyan-400">
                    reimagined.
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl font-medium">
                  AI-powered diagnostic intelligence for neuro-oncology.
                  Real-time segmentation and volumetric analysis with
                  millisecond precision.
                </p>
              </FadeIn>

              <FadeIn delay={0.4} className="flex flex-wrap gap-4">
                <MagneticButton>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" strokeWidth={2} />
                </MagneticButton>
                <MagneticButton variant="secondary">
                  <Play className="mr-2 w-4 h-4" strokeWidth={2} />
                  Watch Demo
                </MagneticButton>
              </FadeIn>

              {/* Trust Indicators */}
              <FadeIn delay={0.6} className="mt-12 flex flex-wrap gap-8 text-sm text-slate-500 font-medium">
                {['HIPAA Compliant', 'SOC2 Certified', '99.9% Uptime'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                    {text}
                  </div>
                ))}
              </FadeIn>
            </div>

            {/* Visual Content - CHANGED: Restored original dashboard mockup with new styling */}
            <div className="flex-1 w-full">
              <FadeIn delay={0.5}>
                <DashboardMockup />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 STATS BAR */}
      <section className="py-20 border-y border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "98.7%", label: "Accuracy" },
              { val: "<30s", label: "Analysis Time" },
              { val: "10k+", label: "Radiologists" },
              { val: "500k", label: "Scans Processed" }
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1} className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:scale-110 transition-transform duration-500 ease-out">{stat.val}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ FEATURES SECTION */}
      <section id="features" className="py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mb-24">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                Precision tools for
                <br />
                <span className="text-slate-400">modern radiology.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Enterprise-grade AI infrastructure designed specifically for neuro-imaging workflows, seamlessly integrated into your PACS.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Real-Time Processing", desc: "Sub-30 second analysis with cloud GPU acceleration and parallel pipelines." },
              { icon: Activity, title: "Clinical Validation", desc: "98.7% accuracy validated against biopsy results across multiple institutions." },
              { icon: BarChart3, title: "Automated Reports", desc: "Generate comprehensive PDF reports with volumetric data and recommendations." },
              { icon: ShieldCheck, title: "Security First", desc: "HIPAA-compliant infrastructure with end-to-end encryption and SOC 2 Type II." },
              { icon: Users, title: "Expert Network", desc: "Connect with global specialists for second opinions and collaborative reviews." },
              { icon: Globe, title: "PACS Integration", desc: "Seamless connectivity with existing hospital systems via DICOM and HL7 standards." },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* 👥 TEAM SECTION */}
      <section id="team" className="py-32 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[0.95]">
                Led by experts in
                <br />
                <span className="italic font-semibold text-slate-500">Medicine & AI</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <MagneticButton variant="secondary">See Open Roles</MagneticButton>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Supervisor Card */}
            <FadeIn className="col-span-1 md:col-span-3 lg:col-span-1">
              <div className="h-full p-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-white/20 dark:bg-slate-900/10 flex items-center justify-center text-xl font-bold mb-6">FA</div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Supervisor</div>
                  <div className="text-2xl font-bold">Mr. Faizadullah</div>
                </div>
                <p className="mt-8 text-sm opacity-80 font-medium italic">"Bridging the gap between academic research and clinical reality."</p>
              </div>
            </FadeIn>

            {/* Team Members */}
            {[
              { name: "Zainab Shakeel", role: "AI & Frontend", init: "ZS" },
              { name: "Hafsa Khalil", role: "Backend Systems", init: "HK" },
              { name: "Syed Abdullah", role: "UI/UX Design", init: "SA" }
            ].map((m, i) => (
              <FadeIn key={i} delay={0.2 + (i * 0.1)}>
                <div className="group h-full p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold mb-6 group-hover:scale-110 transition-transform">
                    {m.init}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{m.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 📣 CTA SECTION */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-50 dark:to-slate-900/50 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
              Ready to transform your
              <br />
              <span className="italic font-semibold">diagnostic workflow?</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 font-medium max-w-2xl mx-auto">
              Join thousands of radiologists improving patient outcomes with AI-powered insights. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <MagneticButton>Start Free Trial</MagneticButton>
              <MagneticButton variant="secondary">Schedule Demo</MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="py-20 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white dark:text-slate-900" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold tracking-tight">NeuroScan</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs font-medium">
                Next-generation diagnostic intelligence for the modern medical facility.
              </p>
            </div>
            {['Product', 'Company', 'Legal'].map((col) => (
              <div key={col}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6">{col}</h4>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {[1, 2, 3].map(i => <li key={i}><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Link Item {i}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <p>© 2025 NeuroScan AI Inc.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}