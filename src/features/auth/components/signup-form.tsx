"use client";

import { cn } from "@/lib/utils";
import { Stethoscope, Shield, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useActionState } from "react";
import { registerUser } from "@/actions/auth-actions";

// Types
type Step = 1 | 2;
type Role = "radiologist" | "admin";

interface SignupFormProps {
    currentStep: Step;
    onNext: () => void;
    onBack: () => void;
    onRoleSelect: (role: Role) => void;
    selectedRole: Role | null;
}

const initialState = {
    message: "",
    errors: {} as Record<string, string[]>,
};

export function SignupForm({ currentStep, onNext, onBack, onRoleSelect, selectedRole }: SignupFormProps) {
    const [showPass, setShowPass] = useState(false);
    const [state, formAction, isPending] = useActionState(registerUser, initialState);

    // Local state to persist data across wizard steps
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "firstName":
                if (!value.trim()) error = "First name is required";
                else if (value.length < 2) error = "Must be at least 2 chars";
                break;
            case "lastName":
                if (!value.trim()) error = "Last name is required";
                else if (value.length < 2) error = "Must be at least 2 chars";
                break;
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) error = "Email is required";
                else if (!emailRegex.test(value)) error = "Invalid email address";
                break;
            case "password":
                if (!value) error = "Password is required";
                else if (value.length < 8) error = "Must be at least 8 chars";
                break;
            case "confirmPassword":
                if (value !== formData.password) error = "Passwords do not match";
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFormData(prev => ({ ...prev, [name]: checked }));
            setErrors(prev => ({ ...prev, [name]: checked ? "" : "Must accept terms" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            validateField(name, value);
        }
    };

    // Computed Validity for Button
    const isFormValid = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) return false;
        if (formData.password !== formData.confirmPassword) return false;
        if (!formData.termsAccepted) return false;
        if (formData.password.length < 8) return false;
        return true;
    };

    // Common Input Styles
    const inputClasses = "w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl h-12 px-4 text-sm text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-0 focus:border-transparent outline-none transition-all placeholder:text-neutral-400";
    const errorInputClasses = "border-neutral-900 dark:border-neutral-100";
    const labelClasses = "text-xs font-bold text-neutral-500 tracking-wider uppercase mb-2 block";

    return (
        <form action={formAction} className="relative">

            {/* STEP 1: Role Selection */}
            {currentStep === 1 && (
                <div className="space-y-8">
                    <h3 className="text-center text-lg font-bold text-black dark:text-white">
                        Select your primary role
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Radiologist Card - BLUE */}
                        <div
                            onClick={() => onRoleSelect("radiologist")}
                            className={cn(
                                "cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === "radiologist"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-blue-300 dark:hover:border-blue-700"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    selectedRole === "radiologist"
                                        ? "bg-blue-500 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-blue-500"
                                )}>
                                    <Stethoscope className="w-6 h-6" strokeWidth={2} />
                                </div>
                                {selectedRole === "radiologist" && (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <h4 className={cn(
                                "font-bold text-sm mb-2",
                                selectedRole === "radiologist"
                                    ? "text-blue-700 dark:text-blue-400"
                                    : "text-black dark:text-white"
                            )}>
                                Radiologist / Doctor
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Join a workspace to access scans, analysis tools, and patient reporting workflows.
                            </p>
                        </div>

                        {/* Admin Card - PINK/PURPLE */}
                        <div
                            onClick={() => onRoleSelect("admin")}
                            className={cn(
                                "cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === "admin"
                                    ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-pink-300 dark:hover:border-pink-700"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    selectedRole === "admin"
                                        ? "bg-pink-500 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-pink-500"
                                )}>
                                    <Shield className="w-6 h-6" strokeWidth={2} />
                                </div>
                                {selectedRole === "admin" && (
                                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <h4 className={cn(
                                "font-bold text-sm mb-2",
                                selectedRole === "admin"
                                    ? "text-pink-700 dark:text-pink-400"
                                    : "text-black dark:text-white"
                            )}>
                                Administrator
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Create and manage workspaces, teams, permissions, and billing.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end items-center border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!selectedRole}
                            className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black dark:disabled:hover:bg-white text-white dark:text-black px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: Form Details */}
            {currentStep === 2 && (
                <div className="space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={cn(inputClasses, errors.firstName && errorInputClasses)}
                                placeholder="e.g. Jane"
                                required
                            />
                            {errors.firstName && (
                                <p className="text-xs font-medium mt-1 text-neutral-600 dark:text-neutral-400">
                                    {errors.firstName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelClasses}>Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={cn(inputClasses, errors.lastName && errorInputClasses)}
                                placeholder="e.g. Doe"
                                required
                            />
                            {errors.lastName && (
                                <p className="text-xs font-medium mt-1 text-neutral-600 dark:text-neutral-400">
                                    {errors.lastName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Work Email</label>
                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={cn(inputClasses, "pl-11", errors.email && errorInputClasses)}
                                placeholder="doctor@hospital.org"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                        </div>
                        {errors.email && (
                            <p className="text-xs font-medium mt-1 text-neutral-600 dark:text-neutral-400">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPass ? "text" : "password"}
                                value={formData.password}
                                onChange={handleInputChange}
                                className={cn(inputClasses, "pr-11", errors.password && errorInputClasses)}
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                {showPass ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs font-medium mt-1 text-neutral-600 dark:text-neutral-400">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClasses}>Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={cn(inputClasses, errors.confirmPassword && errorInputClasses)}
                            placeholder="••••••••"
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs font-medium mt-1 text-neutral-600 dark:text-neutral-400">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div className="py-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleInputChange}
                                className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-black dark:focus:ring-white cursor-pointer"
                                required
                            />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                I agree to the{" "}
                                <Link href="/terms" className="underline hover:text-black dark:hover:text-white">
                                    Terms of Service
                                </Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="underline hover:text-black dark:hover:text-white">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.termsAccepted && (
                            <p className="text-xs font-medium mt-1 pl-7 text-neutral-600 dark:text-neutral-400">
                                {errors.termsAccepted}
                            </p>
                        )}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 mt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm font-medium transition-colors"
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={isPending || !isFormValid()}
                            className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black dark:disabled:hover:bg-white text-white dark:text-black px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:active:scale-100 flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : "Create Account"}
                        </button>
                    </div>

                    {/* Server Error Display */}
                    {state?.message && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                            <span className="font-medium">{state.message}</span>
                        </div>
                    )}

                    <input type="hidden" name="role" value={selectedRole || ""} />
                </div>
            )}
        </form>
    );
}