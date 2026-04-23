import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/query-provider";
import { GoogleProvider } from "@/providers/google-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NeuroScan",
  description: "Professional Imaging Analytics Platform",
  icons: {
    icon: '/favicon.svg',
  },
};

/**
 * Root Layout Component.
 * 
 * Provides the global HTML structure and common providers for the application.
 * - Applies the `Inter` font globally.
 * - Wraps children in the `ThemeProvider` for dark/light mode support.
 * - Includes a global `ThemeToggle` button.
 *
 * @param children - The page content to be rendered within the layout.
 * @returns The root html and body structure.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("h-full bg-background font-sans antialiased", inter.variable)}>
        <QueryProvider>
          <GoogleProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </GoogleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}