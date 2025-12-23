import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">NeuroScan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Contact Support
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button className="shadow-lg shadow-blue-500/20">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-secondary-foreground text-xs font-bold uppercase tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ShieldCheck className="w-3 h-3 text-primary" />
          FDA Approved v2.4
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          The Future of <span className="text-primary">Neuro-Imaging</span> Intelligence
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Empowering radiologists with real-time AI segmentation, volumetric analysis, and instant second opinions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-7 duration-1000">
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-600/20">
              Create Workspace
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background border-border text-foreground hover:bg-secondary">
              Admin Portal
            </Button>
          </Link>
        </div>

        {/* Decorative Abstract UI */}
        <div className="mt-20 relative w-full max-w-5xl aspect-video bg-card rounded-t-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-1000 opacity-0 fill-mode-forwards" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                [ Interactive Dashboard Preview Placeholder ]
            </div>
        </div>
      </main>
    </div>
  );
}