"use client";

import { cn } from "@/lib/utils";
import { Stethoscope, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useActionState } from "react";
import { registerUser } from "@/actions/auth-actions";
import { FaceCapture } from "./face-capture";

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
        password: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [faceFile, setFaceFile] = useState<File | null>(null);

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
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleStep2Next = () => {
        // Technically this is submit now, but we might have a review step? 
        // Let's just submit directly or show confirmation?
        // User flow: Role -> Details -> Submit.
        // Current code has Step 3 as confirmation? 
        // Let's keep 3 steps logic but simplified? 
        // Actually, let's keep it simple: Step 2 ends with "Create Account"
        // But the props use 'currentStep'. Let's assume parent controls step.
        // Let's keep the existing flow structure but remove fields.
        const fields = ["firstName", "lastName", "email", "password"];
        let isValid = true;
        fields.forEach(field => {
            const valid = validateField(field, formData[field as keyof typeof formData]);
            if (!valid) isValid = false;
        });

        if (isValid) {
            onNext(); // Go to confirmation/submit step
        }
    };

    // Common Input Styles
    const inputClasses = "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
    const errorInputClasses = "border-red-500 focus:ring-red-500";
    const labelClasses = "text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block";

    const wrappedAction = (formData: FormData) => {
        if (faceFile) {
            formData.append("faceImage", faceFile);
        }
        formAction(formData);
    };

    return (
        <form action={wrappedAction} className="relative">

            {/* STEP 1: Role Selection */}
            {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-center text-lg font-medium text-slate-900 dark:text-white mb-6">Select your primary role</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => onRoleSelect("radiologist")}
                            className={cn(
                                "cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300",
                                selectedRole === "radiologist"
                                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                                    : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-blue-300 dark:hover:border-blue-600"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    selectedRole === "radiologist"
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600"
                                )}>
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                {selectedRole === "radiologist" && <CheckCircle2 className="text-blue-600" size={24} />}
                            </div>
                            <h4 className={cn("font-bold text-sm mb-2", selectedRole === "radiologist" ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white")}>
                                Radiologist / Doctor
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Join a workspace to access scans, analysis tools, and patient reporting workflows.
                            </p>
                        </div>

                        <div
                            onClick={() => onRoleSelect("admin")}
                            className={cn(
                                "cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300",
                                selectedRole === "admin"
                                    ? "border-purple-600 bg-purple-50/50 dark:bg-purple-900/10"
                                    : "border-slate-200 dark:border-slate-800 bg-transparent hover:border-purple-300 dark:hover:border-purple-400"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    selectedRole === "admin"
                                        ? "bg-purple-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600"
                                )}>
                                    <Shield className="w-6 h-6" />
                                </div>
                                {selectedRole === "admin" && <CheckCircle2 className="text-purple-600" size={24} />}
                            </div>
                            <h4 className={cn("font-bold text-sm mb-2", selectedRole === "admin" ? "text-purple-700 dark:text-purple-400" : "text-slate-900 dark:text-white")}>
                                Administrator
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Create and manage workspaces, teams, permissions, and billing.
                            </p>
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end items-center border-t border-slate-100 dark:border-white/5 mt-8">
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!selectedRole}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: Identity & Credentials */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-2 gap-5">
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
                            {errors.firstName && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.firstName}</p>}
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
                            {errors.lastName && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.lastName}</p>}
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
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </div>
                        </div>
                        {errors.email && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.email}</p>}
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.password}</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                        <label className={labelClasses}>Face Login Setup (Optional)</label>
                        <FaceCapture onCapture={setFaceFile} label="Scan Face for Easy Login" />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-8">
                        <div className="flex gap-4 w-full justify-between items-center">
                            <button
                                type="button"
                                onClick={onBack}
                                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors"
                            >
                                Back
                            </button>

                            {/* NOTE: We removed Step 3 for simplicity. Step 2 Submit IS the signup. */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                            </button>
                        </div>
                    </div>
                    {/* Server Error Display */}
                    {state?.message && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {state.message}
                        </div>
                    )}

                    <input type="hidden" name="role" value={selectedRole || ""} />
                </div>
            )}
        </form>
    );
}