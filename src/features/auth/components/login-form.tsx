"use client";

import { useState, useActionState } from "react";
import { loginUser } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Check } from "lucide-react";
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
            {/* Success Message */}
            {isSuccess && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white dark:text-black" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium">Account created! Please log in.</span>
                </div>
            )}

            {/* Error Message */}
            {state?.message && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <span className="font-medium">{state.message}</span>
                </div>
            )}

            <form action={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 tracking-wider uppercase ml-1">
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
                        icon={<Mail className="w-4 h-4 text-neutral-400" strokeWidth={2} />}
                        className={`
                            bg-white dark:bg-neutral-950 
                            border-neutral-200 dark:border-neutral-800 
                            text-black dark:text-white 
                            placeholder:text-neutral-400 
                            h-12 rounded-xl 
                            focus-visible:ring-2 
                            focus-visible:ring-black dark:focus-visible:ring-white
                            focus-visible:ring-offset-0
                            transition-all
                            ${errors.email ? "border-neutral-900 dark:border-neutral-100" : ""}
                        `}
                        required
                    />
                    {errors.email && (
                        <p className="text-xs font-medium ml-1 text-neutral-600 dark:text-neutral-400">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password Field */}
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
                        onChange={(e) => {
                            const val = e.target.value;
                            setPassword(val);
                            validateField("password", val);
                        }}
                        placeholder="••••••••"
                        icon={<Lock className="w-4 h-4 text-neutral-400" strokeWidth={2} />}
                        className={`
                            bg-white dark:bg-neutral-950 
                            border-neutral-200 dark:border-neutral-800 
                            text-black dark:text-white 
                            placeholder:text-neutral-400 
                            h-12 rounded-xl 
                            focus-visible:ring-2 
                            focus-visible:ring-black dark:focus-visible:ring-white
                            focus-visible:ring-offset-0
                            transition-all
                            ${errors.password ? "border-neutral-900 dark:border-neutral-100" : ""}
                        `}
                        required
                    />
                    {errors.password && (
                        <p className="text-xs font-medium ml-1 text-neutral-600 dark:text-neutral-400">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="
                        w-full 
                        bg-black dark:bg-white 
                        hover:bg-neutral-800 dark:hover:bg-neutral-200
                        text-white dark:text-black 
                        h-12 
                        text-sm 
                        font-semibold 
                        rounded-xl 
                        transition-all 
                        active:scale-[0.98]
                        flex items-center justify-center gap-2
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
                    {isPending ? "Signing In..." : "Sign In"}
                    {!isPending && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                </Button>
            </form>
        </div>
    );
}