"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Brain, Zap, Users, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-blue-500/30">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" target="_blank" rel="noopener noreferrer" className="hidden md:inline-block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Contact Support
          </Link>
          <Link href="/login" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-block">
            <Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-transparent">
              Log In
            </Button>
          </Link>
          <Link href="/signup" target="_blank" rel="noopener noreferrer">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-32 px-4 text-center max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-8"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          FDA Approved v2.4
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mb-6 leading-[1.1]"
        >
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Neuro-Imaging</span> Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Empowering radiologists with real-time AI segmentation, volumetric analysis, and instant second opinions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/signup" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
              Create Workspace
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-sm transition-all hover:-translate-y-1">
              Admin Portal
            </Button>
          </Link>
        </motion.div>

        {/* Problem/Solution Showcase */}
        <div className="mt-20 w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* The Challenge */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-red-200 dark:border-red-900/30 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Challenge</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span>Manual MRI analysis takes <strong className="text-red-600 dark:text-red-400">2-3 hours</strong> per case</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span>Brain tumor detection accuracy varies with radiologist fatigue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span>Limited access to second opinions in remote areas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span>Volumetric measurements prone to human error</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-green-200 dark:border-green-900/30 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">NeuroScan Solution</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                    <span>AI segmentation in <strong className="text-green-600 dark:text-green-400">under 30 seconds</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                    <span><strong className="text-green-600 dark:text-green-400">98.7% accuracy</strong> in tumor detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                    <span>Instant AI-powered second opinions, anywhere</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                    <span>Precise volumetric analysis with sub-millimeter accuracy</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">98.7%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Detection Accuracy</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">&lt;30s</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Analysis Time</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">10,000+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Scans Analyzed</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">AI Availability</div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Modern Radiology
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Advanced AI technology meets seamless workflow integration
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time segmentation and volumetric analysis powered by state-of-the-art deep learning models.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Results</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Get diagnostic insights in seconds, not hours. Streamline your workflow and improve patient outcomes.
              </p>
            </motion.div>

            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Team Collaboration</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Seamless workspace management, role-based access, and real-time collaboration for your entire team.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your institution's needs
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Starter Plan */}
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">$299</span>
                <span className="text-slate-600 dark:text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Up to 5 team members
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  100 scans per month
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Basic AI analysis
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Email support
                </li>
              </ul>
              <Link href="/signup" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl h-12 font-semibold">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Professional Plan */}
            <motion.div variants={item} className="p-8 bg-linear-to-b from-blue-600 to-blue-700 rounded-2xl shadow-xl border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$799</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-blue-50">
                  <Check className="w-5 h-5 text-white" />
                  Up to 20 team members
                </li>
                <li className="flex items-center gap-2 text-blue-50">
                  <Check className="w-5 h-5 text-white" />
                  Unlimited scans
                </li>
                <li className="flex items-center gap-2 text-blue-50">
                  <Check className="w-5 h-5 text-white" />
                  Advanced AI features
                </li>
                <li className="flex items-center gap-2 text-blue-50">
                  <Check className="w-5 h-5 text-white" />
                  Priority support
                </li>
                <li className="flex items-center gap-2 text-blue-50">
                  <Check className="w-5 h-5 text-white" />
                  Custom integrations
                </li>
              </ul>
              <Link href="/signup" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-12 font-semibold">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Unlimited team members
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Unlimited scans
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  White-label solution
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Check className="w-5 h-5 text-green-600" />
                  On-premise deployment
                </li>
              </ul>
              <Link href="/login" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl h-12 font-semibold">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 py-24 px-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The brilliant minds behind NeuroScan
            </p>
          </motion.div>

          {/* Supervisor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
              <div className="w-32 h-32 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
                FA
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mr. Faizadullah</h3>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4 uppercase text-sm tracking-wider">Project Supervisor</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Distinguished faculty member and project supervisor, guiding the team with expertise in medical imaging and AI applications in healthcare.
              </p>
            </div>
          </motion.div>

          {/* Developers */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Zainab Shakeel */}
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-24 h-24 bg-linear-to-br from-pink-500 to-rose-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                ZS
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Zainab Shakeel</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold mb-4 uppercase text-xs tracking-wider">Full Stack Developer</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Specialized in AI integration and frontend architecture, bringing cutting-edge technology to medical imaging workflows.
              </p>
            </motion.div>

            {/* Hafsa Khalil */}
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-24 h-24 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                HK
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hafsa Khalil</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold mb-4 uppercase text-xs tracking-wider">Full Stack Developer</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Expert in backend systems and database architecture, ensuring reliable and scalable medical data management.
              </p>
            </motion.div>

            {/* Syed Abdullah */}
            <motion.div variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-24 h-24 bg-linear-to-br from-amber-500 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                SA
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Syed Abdullah</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold mb-4 uppercase text-xs tracking-wider">Full Stack Developer</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Focused on UI/UX design and real-time visualization, creating intuitive interfaces for complex medical data.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2024 NeuroScan. Empowering radiologists with AI-powered imaging intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}