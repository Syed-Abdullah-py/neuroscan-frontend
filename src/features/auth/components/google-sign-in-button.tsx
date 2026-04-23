"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { googleAuthAction } from "@/features/auth/actions/auth.actions";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleSignInButtonProps {
    /** Provided on signup pages — signals role selection and triggers account creation.
     *  Omit on login pages (login-only, errors if no account exists). */
    global_role?: "ADMIN" | "RADIOLOGIST";
}

export function GoogleSignInButton({ global_role }: GoogleSignInButtonProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = useCallback(
        async (credentialResponse: CredentialResponse) => {
            if (!credentialResponse.credential) {
                setError("No credential received from Google.");
                return;
            }
            setIsPending(true);
            setError(null);
            const result = await googleAuthAction(
                credentialResponse.credential,
                global_role
            );
            setIsPending(false);
            if (result.error) {
                setError(result.error);
            } else if (result.redirectTo) {
                router.push(result.redirectTo);
            }
        },
        [global_role, router]
    );

    const handleError = useCallback(() => {
        setError("Google sign-in was cancelled or failed.");
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
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="outline"
                    size="large"
                    text={global_role ? "signup_with" : "signin_with"}
                    shape="rectangular"
                    width="400"
                />
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
