"use client";

import { cn } from "@/lib/utils";
import {
    Stethoscope,
    Shield,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import Link from "next/link";
import { useState, useActionState, useEffect, useRef } from "react";
import {
    verifyOtp,
    resendOtp,
    registerUser,
    type SignupState,
} from "@/features/auth/actions/auth.actions";

type Step = 1 | 2 | 3;
type Role = "radiologist" | "admin";

interface SignupFormProps {
    currentStep: Step;
    onNext: () => void;
    onBack: () => void;
    onRoleSelect: (role: Role) => void;
    selectedRole: Role | null;
}

const initialState: SignupState = {
    message: "",
    success: false,
    step: 1,
    email: "",
    timestamp: 0,
};

export function SignupForm({
    currentStep,
    onNext,
    onBack,
    onRoleSelect,
    selectedRole,
}: SignupFormProps) {
    const [showPass, setShowPass] = useState(false);
    const [state, formAction, isPending] = useActionState(
        registerUser,
        initialState
    );
    const [otpState, verifyAction, isVerifying] = useActionState(verifyOtp, {
        message: "",
    });
    const [otp, setOtp] = useState("");
    const [resendStatus, setResendStatus] = useState("");
    const lastTimestamp = useRef<number>(0);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Advance to OTP step when registration succeeds
    useEffect(() => {
        if (
            state?.success &&
            state?.step === 3 &&
            state.timestamp &&
            state.timestamp !== lastTimestamp.current
        ) {
            lastTimestamp.current = state.timestamp;
            onNext();
        }
    }, [state, onNext]);

    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "firstName":
                if (!value.trim()) error = "Required";
                else if (value.length < 2) error = "At least 2 characters";
                break;
            case "lastName":
                if (!value.trim()) error = "Required";
                else if (value.length < 2) error = "At least 2 characters";
                break;
            case "email":
                if (!value.trim()) error = "Required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    error = "Invalid email";
                break;
            case "password":
                if (!value) error = "Required";
                else if (value.length < 8) error = "At least 8 characters";
                break;
            case "confirmPassword":
                if (value !== formData.password) error = "Passwords do not match";
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: checked }));
            setErrors((prev) => ({
                ...prev,
                [name]: checked ? "" : "Required",
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.firstName.length >= 2 &&
            formData.lastName.length >= 2 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
            formData.password.length >= 8 &&
            formData.password === formData.confirmPassword &&
            formData.termsAccepted
        );
    };

    const handleResendOtp = async () => {
        setResendStatus("Sending...");
        const ok = await resendOtp(state.email || formData.email);
        setResendStatus(ok ? "Sent!" : "Failed");
        setTimeout(() => setResendStatus(""), 3000);
    };

    const inputClasses =
        "w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl h-12 px-4 text-sm text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-0 focus:border-transparent outline-none transition-all placeholder:text-neutral-400";
    const errorInputClasses = "border-red-400 dark:border-red-600";
    const labelClasses =
        "text-xs font-bold text-neutral-500 tracking-wider uppercase mb-2 block";

    return (
        <div className="relative">
            {/* ── Step 1: Role selection ─────────────────────────────────────── */}
            {currentStep === 1 && (
                <div className="space-y-8">
                    <h3 className="text-center text-lg font-bold text-black dark:text-white">
                        Select your primary role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Radiologist */}
                        <div
                            onClick={() => onRoleSelect("radiologist")}
                            className={cn(
                                "cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === "radiologist"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-blue-300 dark:hover:border-blue-700"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        selectedRole === "radiologist"
                                            ? "bg-blue-500 text-white"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-blue-500"
                                    )}
                                >
                                    <Stethoscope className="w-6 h-6" strokeWidth={2} />
                                </div>
                                {selectedRole === "radiologist" && (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <h4
                                className={cn(
                                    "font-bold text-sm mb-2",
                                    selectedRole === "radiologist"
                                        ? "text-blue-700 dark:text-blue-400"
                                        : "text-black dark:text-white"
                                )}
                            >
                                Radiologist / Doctor
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Join a workspace to access scans, analysis tools, and patient
                                reporting workflows.
                            </p>
                        </div>

                        {/* Admin */}
                        <div
                            onClick={() => onRoleSelect("admin")}
                            className={cn(
                                "cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200",
                                selectedRole === "admin"
                                    ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-pink-300 dark:hover:border-pink-700"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        selectedRole === "admin"
                                            ? "bg-pink-500 text-white"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-pink-500"
                                    )}
                                >
                                    <Shield className="w-6 h-6" strokeWidth={2} />
                                </div>
                                {selectedRole === "admin" && (
                                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <h4
                                className={cn(
                                    "font-bold text-sm mb-2",
                                    selectedRole === "admin"
                                        ? "text-pink-700 dark:text-pink-400"
                                        : "text-black dark:text-white"
                                )}
                            >
                                Administrator
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Create and manage workspaces, teams, permissions, and billing.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!selectedRole}
                            className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Details form ───────────────────────────────────────── */}
            {currentStep === 2 && (
                <div className="space-y-5">
                    {/* Google signup - role already selected in Step 1 */}
                    <GoogleSignInButton
                        global_role={selectedRole === "admin" ? "ADMIN" : "RADIOLOGIST"}
                    />

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white dark:bg-neutral-900 px-3 text-neutral-400 font-medium uppercase tracking-wider">
                                or fill in your details
                            </span>
                        </div>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>First Name</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className={cn(
                                        inputClasses,
                                        errors.firstName && errorInputClasses
                                    )}
                                    placeholder="Jane"
                                    required
                                />
                                {errors.firstName && (
                                    <p className="text-xs font-medium mt-1 text-red-500">
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
                                    className={cn(
                                        inputClasses,
                                        errors.lastName && errorInputClasses
                                    )}
                                    placeholder="Doe"
                                    required
                                />
                                {errors.lastName && (
                                    <p className="text-xs font-medium mt-1 text-red-500">
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>Work Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={cn(inputClasses, errors.email && errorInputClasses)}
                                placeholder="doctor@hospital.org"
                                required
                            />
                            {errors.email && (
                                <p className="text-xs font-medium mt-1 text-red-500">
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
                                    className={cn(
                                        inputClasses,
                                        "pr-11",
                                        errors.password && errorInputClasses
                                    )}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {showPass ? (
                                        <EyeOff size={18} strokeWidth={2} />
                                    ) : (
                                        <Eye size={18} strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium mt-1 text-red-500">
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
                                className={cn(
                                    inputClasses,
                                    errors.confirmPassword && errorInputClasses
                                )}
                                placeholder="••••••••"
                                required
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs font-medium mt-1 text-red-500">
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
                                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 cursor-pointer"
                                    required
                                />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    I agree to the{" "}
                                    <Link href="/terms" className="underline hover:text-black dark:hover:text-white">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="underline hover:text-black dark:hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
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
                                className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black px-8 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
                            >
                                {isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                )}
                                {isPending ? "Creating..." : "Create Account"}
                            </button>
                        </div>

                        {/* Server error */}
                        {state?.message && !state.success && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                                <span className="font-medium">{state.message}</span>
                            </div>
                        )}

                        {/* Hidden role field */}
                        <input type="hidden" name="role" value={selectedRole || ""} />
                    </form>
                </div>
            )}

            {/* ── Step 3: OTP verification ───────────────────────────────────── */}
            {currentStep === 3 && (
                <form action={verifyAction} className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                            <Check className="w-6 h-6" strokeWidth={3} />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">
                            Verify your email
                        </h3>
                        <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                            We&apos;ve sent a 6-digit code to{" "}
                            <span className="font-semibold text-black dark:text-white">
                                {state?.email || formData.email}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <input
                            name="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl h-14 px-4 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-0 focus:border-transparent outline-none transition-all placeholder:text-neutral-300"
                            placeholder="000000"
                            required
                            autoFocus
                        />
                        <input
                            type="hidden"
                            name="email"
                            value={state?.email || formData.email}
                        />
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-neutral-500">Didn&apos;t receive code?</span>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!!resendStatus}
                                className="font-semibold text-black dark:text-white hover:underline disabled:opacity-50"
                            >
                                {resendStatus || "Resend OTP"}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-1/3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-black dark:text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isVerifying || otp.length !== 6}
                            className="w-2/3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isVerifying && (
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                            )}
                            {isVerifying ? "Verifying..." : "Verify & Continue"}
                        </button>
                    </div>

                    {otpState?.message && (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                            <span className="font-medium">{otpState.message}</span>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}