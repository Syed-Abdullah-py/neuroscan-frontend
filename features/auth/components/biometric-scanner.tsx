"use client";

import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function BiometricScanner() {
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");

  useEffect(() => {
    const startScan = setTimeout(() => setStatus("scanning"), 500);
    const completeScan = setTimeout(() => setStatus("success"), 3500);
    return () => {
      clearTimeout(startScan);
      clearTimeout(completeScan);
    };
  }, []);

  return (
    <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30 p-8 transition-all hover:bg-muted/50 hover:border-blue-300 dark:hover:border-blue-800">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        
        {/* Scanner Visual */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <ScanFace className="h-10 w-10" />
          
          {status === "scanning" && (
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear",
                repeatType: "reverse" 
              }}
              className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            />
          )}

          {status === "success" && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full bg-green-400"
            />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground">Login with Face ID</h3>
          <p className="text-sm text-muted-foreground max-w-[200px] mx-auto mt-1">
            {status === "scanning" 
              ? "Scanning biometrics..." 
              : status === "success" 
                ? "Identity Verified" 
                : "Secure biometric scan required."}
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 text-border"><CornerIcon className="rotate-90" /></div>
      <div className="absolute bottom-3 left-3 text-border"><CornerIcon className="-rotate-90" /></div>
    </div>
  );
}

function CornerIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 15V4C1 2.34315 2.34315 1 4 1H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}