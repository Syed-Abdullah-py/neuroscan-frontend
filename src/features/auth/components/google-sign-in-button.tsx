"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { googleAuthAction } from "@/features/auth/actions/auth.actions";
import { Loader2, AlertCircle } from "lucide-react";


interface GoogleSignInButtonProps {
    /** Provided on signup pages - signals role selection and triggers account creation.
     *  Omit on login pages (login-only, errors if no account exists). */
    global_role?: "ADMIN" | "RADIOLOGIST";
}

export function GoogleSignInButton({ global_role }: GoogleSignInButtonProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
                const idToken = event.data.idToken as string;
                setIsPending(true);
                setError(null);
                const result = await googleAuthAction(idToken, global_role);
                setIsPending(false);
                if (result.error) {
                    setError(result.error);
                } else if (result.redirectTo) {
                    router.push(result.redirectTo);
                }
            } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
                setError("Google sign-in was cancelled or failed.");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [global_role, router]);

    const handleClick = useCallback(() => {
        setError(null);
        const origin = process.env.NEXT_PUBLIC_GOOGLE_AUTH_POPUP_ORIGIN || window.location.origin;
        const popup = window.open(
            `${origin}/google-popup`,
            "google-oauth-popup",
            "width=500,height=600,left=200,top=100,scrollbars=no,resizable=no"
        );
        if (!popup) {
            setError("Popup was blocked. Please allow popups for this site and try again.");
        }
    }, []);

    if (isPending) {
        return (
            <div className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm font-medium text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Signing in with Google...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-center">
                <button
                    onClick={handleClick}
                    className="flex items-center justify-center gap-3 w-[400px] h-11 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.015 17.64 11.707 17.64 9.2z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.348 6.177 0 7.552 0 9s.348 2.823.957 4.038l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    {global_role ? "Sign up with Google" : "Sign in with Google"}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
