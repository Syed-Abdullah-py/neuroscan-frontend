"use client";

import { useState, useActionState } from "react";
import { loginUser } from "@/features/auth/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    AlertCircle,
    Check,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const initialState = { message: "" };

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(
        loginUser,
        initialState
    );
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get("registered") === "true";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });

    const emailError =
        touched.email && !email
            ? "Email is required."
            : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? "Enter a valid email."
                : "";

    const passwordError =
        touched.password && !password
            ? "Password is required."
            : touched.password && password.length < 8
                ? "At least 8 characters."
                : "";

    return (
        <div className="space-y-6">
            {/* Success banner after registration */}
            {justRegistered && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white dark:text-black" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium">Account verified! Please log in.</span>
                </div>
            )}

            {/* Error from server action */}
            {state?.message && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="font-medium">{state.message}</span>
                </div>
            )}

            <form action={formAction} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 tracking-wider uppercase ml-1">
                        Email Address
                    </label>
                    <Input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        placeholder="doctor@hospital.org"
                        icon={<Mail className="w-4 h-4 text-neutral-400" strokeWidth={2} />}
                        className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-0"
                        required
                    />
                    {emailError && (
                        <p className="text-xs font-medium ml-1 text-red-500">{emailError}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-neutral-500 tracking-wider uppercase">
                            Password
                        </label>
                        <Link
                            href="#"
                            className="text-xs font-medium hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    <Input
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        placeholder="••••••••"
                        icon={<Lock className="w-4 h-4 text-neutral-400" strokeWidth={2} />}
                        className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-0"
                        required
                    />
                    {passwordError && (
                        <p className="text-xs font-medium ml-1 text-red-500">{passwordError}</p>
                    )}
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black h-12 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    )}
                    {isPending ? "Signing In..." : "Sign In"}
                    {!isPending && (
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    )}
                </Button>
            </form>
        </div>
    );
}