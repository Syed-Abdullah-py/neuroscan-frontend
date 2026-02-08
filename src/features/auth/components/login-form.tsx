"use client";

import { useState, useActionState } from "react";
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
 * Provides a user interface for users to sign in via the auth-service API.
 * Displays success messages after registration and error messages for invalid credentials.
 * Includes fields for email and password.
 *
 * @returns A form element with email and password inputs and a submit button.
 */

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginUser, initialState);

    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";

    // Client-side state for validation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
                        Email Address
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
        </div>
    );
}