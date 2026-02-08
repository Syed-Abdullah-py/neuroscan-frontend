"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Moon, Sun, ArrowRight, Activity,
  ShieldCheck, Zap, BarChart3, Users,
  Globe, Play, Check, Menu, Sparkles
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils"

// --- 🎨 PERFORMANCE-OPTIMIZED DESIGN SYSTEM ---

const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94] as const;


// Optimized FadeIn - reduced complexity
const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5, delay, ease: EASE_SMOOTH }}
    className={className}
  >
    {children}
  </motion.div>
);

// Simplified Button - supports href for navigation
const Button = ({
  children,
  variant = "primary",
  className,
  onClick,
  href
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  href?: string;
}) => {
  const isPrimary = variant === "primary";
  const buttonClasses = cn(
    "relative h-12 px-8 rounded-full font-semibold transition-all duration-200 flex items-center justify-center",
    isPrimary
      ? "bg-black dark:bg-white text-white dark:text-black"
      : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-300 dark:border-neutral-700",
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        <span className="flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={buttonClasses}
    >
      <span className="flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

// Simplified Feature Card - no blur effects or complex animations
const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <FadeIn delay={delay}>
    <div className="group h-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors duration-200">
      <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-white dark:text-black" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-bold text-black dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {desc}
      </p>
    </div>
  </FadeIn>
);

const MRIBrainScanVisual = () => {
  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto flex items-center justify-center">

      {/* Main scan display frame */}
      <div className="relative w-full h-full border-2 border-black dark:border-white rounded-3xl overflow-hidden bg-white dark:bg-black">

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(0 0 0 / 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(0 0 0 / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* CENTER AREA - EMPTY FOR YOUR BRAIN IMAGE */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          {/* Place your brain image here */}
          <div className="w-full h-full flex items-center justify-center">
            {/* Your brain image goes here - example: */}
            <img src="/brain.png" alt="Brain MRI" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Scanning line sweep */}
        <motion.div
          className="absolute inset-0"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1
          }}
        >
          <div className="w-full h-px bg-linear-to-r from-transparent via-black dark:via-white to-transparent opacity-50" />
          <div className="w-full h-8 bg-linear-to-b from-black/10 to-transparent dark:from-white/10" />
        </motion.div>

        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start m-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          >
            <div className="text-[10px] font-bold text-neutral-500 mb-0.5">PATIENT ID</div>
            <div className="text-sm font-bold">MRI-2025-001</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 bg-white/90 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="w-2 h-2 rounded-full bg-black dark:bg-white"
            />
            <span className="text-xs font-bold">LIVE</span>
          </motion.div>
        </div>

        {/* Data visualization bars on the right */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2">
          {[65, 85, 45, 95, 70].map((height, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${height}%` }}
              transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
              className="h-1.5 bg-black dark:bg-white rounded-full"
              style={{ maxWidth: '60px' }}
            />
          ))}
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end m-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/90 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          >
            <div className="text-[10px] font-bold text-neutral-500 mb-0.5">SEQUENCE</div>
            <div className="text-xs font-bold">T2-FLAIR</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/90 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          >
            <div className="text-[10px] font-bold text-neutral-500 mb-0.5">CONFIDENCE</div>
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-sm font-bold"
            >
              98.7%
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-white/90 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm"
          >
            <div className="text-[10px] font-bold text-neutral-500 mb-0.5">SLICE</div>
            <div className="text-xs font-bold">24/128</div>
          </motion.div>
        </div>

        {/* Corner brackets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-black dark:border-white"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-black dark:border-white"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-black dark:border-white"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-black dark:border-white"
        />

        {/* Crosshair in center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          className="absolute top-1/2 left-0 right-0 h-px bg-black dark:bg-white"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.5 }}
          className="absolute left-1/2 top-0 bottom-0 w-px bg-black dark:bg-white"
        />
      </div>
    </div>
  );
};

// --- THEME MANAGEMENT ---
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  return { theme, toggleTheme, mounted };
};

// --- MAIN LANDING PAGE ---

export default function LandingPage() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">

      {/* 🌐 MINIMAL NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <Brain className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold">NeuroScan</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {['Technology', 'Features', 'Research', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <Button variant="secondary" className="h-10 px-6 text-sm" href="/login">
                Log In
              </Button>
            </div>
            <div className="hidden sm:block">
              <Button className="h-10 px-6 text-sm" href="/signup">
                Sign Up
              </Button>
            </div>
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

            {/* Text Content */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                  FDA Cleared Technology
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Radiology,
                  <br />
                  <span className="italic">reimagined.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  AI-powered diagnostic intelligence for neuro-oncology. Real-time segmentation and volumetric analysis with millisecond precision.
                </p>
              </FadeIn>

              <FadeIn delay={0.3} className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" strokeWidth={2} />
                </Button>
                <Button variant="secondary">
                  <Play className="mr-2 w-4 h-4" strokeWidth={2} />
                  Watch Demo
                </Button>
              </FadeIn>

              {/* Trust Indicators */}
              <FadeIn delay={0.4} className="mt-12 flex flex-wrap gap-6 text-sm font-medium text-neutral-500 justify-center lg:justify-start">
                {['HIPAA Compliant', 'SOC2 Certified', '99.9% Uptime'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4" strokeWidth={2} />
                    {text}
                  </div>
                ))}
              </FadeIn>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 w-full">
              <FadeIn delay={0.2}>
                <MRIBrainScanVisual />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 STATS BAR */}
      <section className="py-20 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "98.7%", label: "Accuracy" },
              { val: "<30s", label: "Analysis Time" },
              { val: "10k+", label: "Radiologists" },
              { val: "500k", label: "Scans Processed" }
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.05} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.val}
                </div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ FEATURES SECTION */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-20">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Precision tools for
                <br />
                <span className="text-neutral-500">modern radiology.</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Enterprise-grade AI infrastructure designed specifically for neuro-imaging workflows, seamlessly integrated into your PACS.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Real-Time Processing",
                desc: "Sub-30 second analysis with cloud GPU acceleration and parallel pipelines for instant diagnostic insights."
              },
              {
                icon: Activity,
                title: "Clinical Validation",
                desc: "98.7% accuracy validated against biopsy results across multiple institutions and peer-reviewed studies."
              },
              {
                icon: BarChart3,
                title: "Automated Reports",
                desc: "Generate comprehensive PDF reports with volumetric data, comparisons, and clinical recommendations."
              },
              {
                icon: ShieldCheck,
                title: "Security First",
                desc: "HIPAA-compliant infrastructure with end-to-end encryption, SOC 2 Type II certification, and audit logs."
              },
              {
                icon: Users,
                title: "Expert Network",
                desc: "Connect with global specialists for second opinions, collaborative reviews, and continuous learning."
              },
              {
                icon: Globe,
                title: "PACS Integration",
                desc: "Seamless connectivity with existing hospital systems via DICOM and HL7 standards with zero downtime."
              },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* 👥 TEAM SECTION */}
      <section id="team" className="py-28 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Led by experts in
                <br />
                <span className="italic text-neutral-500">Medicine & AI</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Button variant="secondary" className="h-11 px-6">
                See Open Roles
              </Button>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Supervisor Card */}
            <FadeIn className="col-span-1 md:col-span-3 lg:col-span-1">
              <div className="h-full p-8 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 dark:bg-black/10 flex items-center justify-center text-xl font-bold mb-6">
                    FA
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                    Supervisor
                  </div>
                  <div className="text-2xl font-bold">Mr. Faizadullah</div>
                </div>
                <p className="mt-8 text-sm opacity-80 italic">
                  "Bridging the gap between academic research and clinical reality."
                </p>
              </div>
            </FadeIn>

            {/* Team Members */}
            {[
              { name: "Zainab Shakeel", role: "AI & Frontend", init: "ZS" },
              { name: "Hafsa Khalil", role: "Backend Systems", init: "HK" },
              { name: "Syed Abdullah", role: "UI/UX Design", init: "SA" }
            ].map((m, i) => (
              <FadeIn key={i} delay={0.1 + (i * 0.05)}>
                <div className="h-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-bold mb-6">
                    {m.init}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{m.name}</h3>
                  <p className="text-sm text-neutral-500">{m.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 📣 CTA SECTION */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Ready to transform your
              <br />
              <span className="italic">diagnostic workflow?</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of radiologists improving patient outcomes with AI-powered insights. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" strokeWidth={2} />
              </Button>
              <Button variant="secondary">
                Schedule Demo
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer className="py-16 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold">NeuroScan</span>
              </Link>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Next-generation diagnostic intelligence for the modern medical facility.
              </p>
            </div>
            {['Product', 'Company', 'Legal'].map((col) => (
              <div key={col}>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
                  {col}
                </h4>
                <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {[1, 2, 3].map(i => (
                    <li key={i}>
                      <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                        Link Item {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>© 2025 NeuroScan AI Inc.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Twitter'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}