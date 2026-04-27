"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function GooglePopupPage() {
    const [done, setDone] = useState(false);

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;
        setDone(true);
        window.opener?.postMessage(
            { type: "GOOGLE_AUTH_SUCCESS", idToken: credentialResponse.credential },
            "*"
        );
        window.close();
    };

    const handleError = () => {
        window.opener?.postMessage({ type: "GOOGLE_AUTH_ERROR" }, "*");
        window.close();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-semibold text-foreground">NeuroScan</h1>
                <p className="text-sm text-muted-foreground">Sign in with your Google account to continue</p>
            </div>
            {done ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing sign-in…
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                />
            )}
        </div>
    );
}
