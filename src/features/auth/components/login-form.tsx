"use client";

import { useState, useActionState, startTransition } from "react";
import { loginUser, loginUserWithFace, verifyPinAndLogin } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ScanFace, KeyRound } from "lucide-react";
import { FaceCapture } from "./face-capture";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const initialState = {
    message: "",
};

/**
 * Login Form Component.
 * 
 * Provides a user interface for users to sign in.
 * Utilizes `useActionState` to handle the `loginUser` server action.
 * Displays success messages after registration and error messages for invalid credentials.
 * Includes fields for email and password.
 *
 * @returns A form element with email and password inputs and a submit button.
 */

export function LoginForm() {
    // Standard Login
    const [state, formAction, isPending] = useActionState(loginUser, initialState);
    // Face Login (Step 1: Identify)
    const [faceState, faceAction, isFacePending] = useActionState(loginUserWithFace, initialState);
    // Face Login (Step 2: Verify PIN)
    const [pinState, pinAction, isPinPending] = useActionState(verifyPinAndLogin, initialState);

    // Toggle Mode
    const [mode, setMode] = useState<"email" | "face">("email");

    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";

    // Client-side state for validation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState(""); // For Step 2
    const [errors, setErrors] = useState({ email: "", password: "" });

    // Real-time validation function
    const validateField = (name: string, value: string) => {
        let error = "";

        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = "Email is required.";
            else if (!emailRegex.test(value)) error = "Please enter a valid email address.";
        }

        if (name === "password") {
            if (!value) error = "Password is required.";
            else if (value.length < 8) error = "Password must be at least 8 characters.";
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    // Form-level validation for submission
    const validateForm = () => {
        const emailValid = validateField("email", email);
        const passwordValid = validateField("password", password);
        return emailValid && passwordValid;
    };

    const handleSubmit = (formData: FormData) => {
        // Only submit if no errors exist
        if (!errors.email && !errors.password && email && password) {
            formAction(formData);
        } else {
            // Trigger full validation if user tries to submit empty/invalid form
            validateForm();
        }
    };

    // Derived state: Are we waiting for PIN?
    // Check both faceState (initial identify) and pinState (tried pin but failed)
    // Note: Our modified server action returns `pendingPin: true` along with userId/userName
    const isPinStep = (faceState as any)?.pendingPin || (pinState as any)?.pendingPin;
    const identifiedUser = (pinState as any)?.userId ? { userId: (pinState as any).userId, userName: (pinState as any).userName } : (faceState as any)?.userId ? { userId: (faceState as any).userId, userName: (faceState as any).userName } : null;

    return (
        <div className="space-y-6">
            {isSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm text-center">
                    Account created! Please log in.
                </div>
            )}

            {state?.message && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.message}
                </div>
            )}

            {/* Show errors from Face or PIN actions */}
            {(faceState?.message || pinState?.message) && mode === "face" && (
                <div className={`p-3 border rounded-lg text-sm flex items-center gap-2 ${
                    // If it's a "success" message (like "Please enter PIN"), show blue/info style
                    (faceState as any)?.pendingPin && !pinState?.message
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-red-500/10 dark:text-red-400"
                    }`}>
                    <AlertCircle className="w-4 h-4" />
                    {pinState?.message || faceState?.message}
                </div>
            )}

            {/* Mode Toggles - Hide when in PIN step to prevent confusion */}
            {!isPinStep && (
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setMode("email")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${mode === "email"
                            ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            }`}
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Email Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("face")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${mode === "face"
                            ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            }`}
                    >
                        <ScanFace className="w-3.5 h-3.5" />
                        Face Login
                    </button>
                </div>
            )}

            {mode === "email" ? (
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
                            Institutional Email
                        </label>
                        <Input
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEmail(val);
                                validateField("email", val);
                            }}
                            placeholder="doctor@hospital.org"
                            icon={<Mail className="w-4 h-4 text-slate-400" />}
                            className={`bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                Password
                            </label>
                            <Link
                                href="#"
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <Input
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                const val = e.target.value;
                                setPassword(val);
                                validateField("password", val);
                            }}
                            placeholder="••••••••"
                            icon={<Lock className="w-4 h-4 text-slate-400" />}
                            className={`bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                            required
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 font-medium ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 h-12 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? "Signing In..." : "Sign In"}
                        {!isPending && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </form>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {!isPinStep ? (
                        // Step 1: Face Scan
                        <>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Authenticate with Face ID</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Look at the camera to verify your identity.
                                </p>
                            </div>

                            {!isFacePending ? (
                                <FaceCapture
                                    label="Scan Face to Login"
                                    shouldStop={isFacePending}
                                    onCapture={(file) => {
                                        const fd = new FormData();
                                        fd.append("faceImage", file);
                                        startTransition(() => {
                                            faceAction(fd);
                                        });
                                    }}
                                />
                            ) : null}

                            {isFacePending && (
                                <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying Biometrics...
                                </div>
                            )}
                        </>
                    ) : (
                        // Step 2: PIN Verification
                        <form action={pinAction} className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                            <div className="text-center space-y-2 mb-6">
                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                                    <ScanFace className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    Welcome back, {identifiedUser?.userName}!
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Please enter your security PIN to continue.
                                </p>
                            </div>

                            <input type="hidden" name="userId" value={identifiedUser?.userId} />

                            <div className="space-y-2">
                                <div className="flex items-center justify-center">
                                    <Input
                                        name="pin"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => {
                                            // Only allow numbers
                                            if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                                setPin(e.target.value);
                                            }
                                        }}
                                        style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties}
                                        className="text-center text-3xl tracking-[0.5em] font-bold h-16 w-60 mx-auto bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 rounded-xl"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        // Reset everything to start over
                                        window.location.reload();
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPinPending || pin.length < 4}
                                    className="flex-2 bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    {isPinPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    Verify & Login
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}