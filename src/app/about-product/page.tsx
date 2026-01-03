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
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } } // Faster duration for snappier feel
  };

  const teamData = {
    supervisor: {
      initials: "FA",
      name: "Mr. Faizadullah",
      role: "Project Supervisor",
      bio: "Distinguished faculty member and project supervisor, guiding the team with expertise in medical imaging and AI applications in healthcare.",
      color: "from-blue-500 to-purple-600",
      image: "file.jpg"
    },
    developers: [
      {
        initials: "ZS",
        name: "Zainab Shakeel",
        role: "Full Stack Developer",
        bio: "Specialized in AI integration and frontend architecture, bringing cutting-edge technology to medical imaging workflows.",
        color: "from-pink-500 to-rose-600"
      },
      {
        initials: "HK",
        name: "Hafsa Khalil",
        role: "Full Stack Developer",
        bio: "Expert in backend systems and database architecture, ensuring reliable and scalable medical data management.",
        color: "from-cyan-500 to-blue-600"
      },
      {
        initials: "SA",
        name: "Syed Abdullah",
        role: "Full Stack Developer",
        bio: "Focused on UI/UX design and real-time visualization, creating intuitive interfaces for complex medical data.",
        color: "from-amber-500 to-orange-600"
      }
    ]
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 overflow-x-hidden">

      {/* 
        PERFORMANCE OPTIMIZATION:
        1. 'transform-gpu' and 'translate-z-0' force this layer to the GPU.
        2. No complex animations on this layer.
      */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu translate-z-0">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform will-change-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan</span>
          </Link>
        </div>

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
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 will-change-transform">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-20 pb-32 px-4 text-center max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-widest mb-8"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          FDA Approved v2.4
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mb-6 leading-[1.1]"
        >
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Neuro-Imaging</span> Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Empowering radiologists with real-time AI segmentation, volumetric analysis, and instant second opinions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
              Create Workspace
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:-translate-y-1">
              Admin Portal
            </Button>
          </Link>
        </motion.div>

        {/* Problem/Solution Showcase */}
        <div className="mt-20 w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* The Challenge */}
            <div className="p-8 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
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
                    <span>Accuracy varies with radiologist fatigue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span>Limited second opinions in remote areas</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* The Solution */}
            <div className="p-8 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-green-200 dark:border-green-900/30 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
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
                    <span>Instant AI-powered second opinions</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Accuracy", value: "98.7%", color: "text-blue-600 dark:text-blue-400" },
              { label: "Time", value: "<30s", color: "text-purple-600 dark:text-purple-400" },
              { label: "Scans", value: "10k+", color: "text-green-600 dark:text-green-400" },
              { label: "Uptime", value: "99.9%", color: "text-amber-600 dark:text-amber-400" },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:-translate-y-1 transition-transform duration-300">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Features Section - Removed Backdrop Blur for Performance */}
      <section className="relative z-10 py-24 px-4 bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Advanced AI technology meets seamless workflow integration
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Brain, title: "AI Analysis", desc: "Real-time segmentation and volumetric analysis.", color: "blue" },
              { icon: Zap, title: "Instant Results", desc: "Get diagnostic insights in seconds, not hours.", color: "purple" },
              { icon: Users, title: "Collaboration", desc: "Seamless workspace management and team access.", color: "green" },
            ].map((feature, i) => (
              <motion.div key={i} variants={item} className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all">
                <div className={`w-14 h-14 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your institution's needs
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
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
                {["Up to 5 team members", "100 scans per month", "Basic AI analysis", "Email support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Check className="w-5 h-5 text-green-600" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl h-12 font-semibold">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Professional Plan */}
            <motion.div variants={item} className="p-8 bg-linear-to-b from-blue-600 to-blue-700 rounded-2xl shadow-xl border-2 border-blue-500 relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$799</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Up to 20 team members", "Unlimited scans", "Advanced AI features", "Priority support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-blue-50">
                    <Check className="w-5 h-5 text-white" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
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
                {["Unlimited team members", "Unlimited scans", "White-label solution", "On-premise deployment"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Check className="w-5 h-5 text-green-600" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block">
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

          {/* Supervisor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="w-full p-8 md:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center gap-10">
              <div className={`shrink-0 w-40 h-40 md:w-48 md:h-48 bg-linear-to-br ${teamData.supervisor.color} rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl transform md:-rotate-3 transition-transform duration-500`}>
                <img
                  src={teamData.supervisor.image}
                  alt={teamData.supervisor.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="mb-6">
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{teamData.supervisor.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-sm tracking-widest">
                    {teamData.supervisor.role}
                  </p>
                </div>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl italic">
                  &ldquo;{teamData.supervisor.bio}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Developers Grid - Supervisor-style cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {teamData.developers.map((dev, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group p-8 bg-white dark:bg-slate-900 
                 rounded-3xl border border-slate-200 
                 dark:border-slate-800 shadow-lg 
                 hover:shadow-2xl transition-all duration-300"
              >
                {/* Avatar */}
                <div
                  className={`w-28 h-28 bg-linear-to-br ${dev.color} 
                    rounded-2xl mx-auto mb-6 
                    flex items-center justify-center 
                    text-white text-3xl font-bold 
                    shadow-xl transform group-hover:-rotate-3 
                    transition-transform duration-500`}
                >
                  {dev.initials}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {dev.name}
                  </h3>

                  <p className="text-purple-600 dark:text-purple-400 
                      font-bold uppercase text-xs tracking-widest mb-4">
                    {dev.role}
                  </p>

                  <p className="text-slate-600 dark:text-slate-400 
                      text-sm leading-relaxed italic">
                    &ldquo;{dev.bio}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroScan</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2025 NeuroScan. Empowering radiologists with AI-powered imaging intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}