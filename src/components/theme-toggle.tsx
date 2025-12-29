"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="outline"
      size="default" // Using default to ensure square aspect if needed, or define specific h/w below
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "fixed bottom-5 left-5 z-50 h-10 w-10 rounded-full p-0",
        "bg-background/80 backdrop-blur-sm border-slate-200 dark:border-slate-800",
        "shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
      )}
      title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon (Visible in Dark Mode) */}
        <Sun
          className={cn(
            "absolute inset-0 h-5 w-5 text-yellow-500 transition-all duration-300 rotate-0 scale-100",
            resolvedTheme === "light" && "-rotate-90 scale-0 opacity-0"
          )}
        />
        {/* Moon Icon (Visible in Light Mode) */}
        <Moon
          className={cn(
            "absolute inset-0 h-5 w-5 text-slate-700 transition-all duration-300 rotate-0 scale-100",
            resolvedTheme === "dark" && "rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}