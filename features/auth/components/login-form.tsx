"use client";

import { useActionState } from "react"; // <--- CHANGED
import { loginUser } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
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
    // <--- CHANGED: useActionState returns [state, action, isPending]
    const [state, formAction, isPending] = useActionState(loginUser, initialState);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";

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

            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
                        Institutional Email
                    </label>
                    <Input
                        name="email"
                        type="email"
                        placeholder="doctor@hospital.org"
                        icon={<Mail className="w-4 h-4 text-slate-400" />}
                        className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600"
                        required
                    />
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
                        placeholder="••••••••"
                        icon={<Lock className="w-4 h-4 text-slate-400" />}
                        className="bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 h-12 rounded-xl focus-visible:ring-blue-600"
                        required
                    />
                </div>

                {/* 
           We can now use the `isPending` from useActionState directly 
           instead of the complex separate component with useFormStatus 
        */}
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
        </div>
    );
}