"use client";

import { cn } from "@/lib/utils";
import { Stethoscope, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ChevronDown, Upload, FileText, X } from "lucide-react";
import Link from "next/link";
import { useState, useActionState } from "react";
import { registerUser } from "@/actions/auth-actions";
import { FaceCapture } from "./face-capture";

// Types
type Step = 1 | 2 | 3;
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
        cnic: "",
        phoneNumber: "",
        city: "",
        medicalLicenseId: "",
        pin: "",
        gender: "",
        termsAccepted: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [faceFile, setFaceFile] = useState<File | null>(null);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    // Phone State
    const [countryCode, setCountryCode] = useState("+92");
    const [localNumber, setLocalNumber] = useState("");

    const COUNTRY_CODES = [
        { code: "+92", country: "PK", flag: "🇵🇰" },
        { code: "+1", country: "US", flag: "🇺🇸" },
        { code: "+44", country: "UK", flag: "🇬🇧" },
        { code: "+971", country: "AE", flag: "🇦🇪" },
        { code: "+91", country: "IN", flag: "🇮🇳" },
        { code: "+1", country: "CA", flag: "🇨🇦" },
        { code: "+61", country: "AU", flag: "🇦🇺" },
        { code: "+49", country: "DE", flag: "🇩🇪" },
    ];

    // Update formData phone number when components change
    const handlePhoneChange = (code: string, number: string) => {
        setCountryCode(code);
        setLocalNumber(number);
        const fullNumber = code + number;
        setFormData(prev => ({ ...prev, phoneNumber: fullNumber }));
        // Optional: Validate phone length here if needed
    };

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
            case "medicalLicenseId":
                if (selectedRole === "radiologist" && !value.trim()) error = "License ID is required";
                break;
            case "pin":
                if (faceFile && (!value || value.length < 4)) error = "PIN (4+ chars) required for Face Login";
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
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
        if (selectedRole === "radiologist" && !formData.medicalLicenseId) return false;
        if (faceFile && (!formData.pin || formData.pin.length < 4)) return false;
        if (formData.password.length < 8) return false;
        return true;
    };

    const handleStep2Next = () => {
        // Technically this is submit now, with the button directly submitting the form.
        // However, if we keep the "Next" logic for some reason, here it is.
        // But the button is type="submit" in the JSX below, so this function might not be called by the button directly
        // UNLESS the button is type="button" and calls this.
        // Looking at the JSX (step 2), the button is type="submit".
        // So this function is actually unused for submission in the current flow if the button submits the form.
        // BUT, wait... previous code called onNext()? 
        // Let's check logic. The form action handles the submission. 
        // The button is disabled if invalid.
        // IF the user hits enter, form submits.
        // So we really just need `wrappedAction` to handle the submission data.
        // `handleStep2Next` seems to have been legacy or for manual validation before strict form actions?
        // Use validation check here if called manually.

        if (!isFormValid()) return;

        // Perform strict validation feedback
        const fields = ["firstName", "lastName", "email", "password", "confirmPassword"];
        if (selectedRole === "radiologist") fields.push("medicalLicenseId");
        if (faceFile) fields.push("pin");

        let isValid = true;
        fields.forEach(field => {
            const valid = validateField(field, formData[field as keyof typeof formData] as string);
            if (!valid) isValid = false;
        });

        if (isValid) {
            // Because we use form action, we don't necessarily need onNext() unless it moves to a step 3 'confirmation'?
            // The original code had step 3 removed/commented out effectively.
            // If the button submits, we don't call this.
            // But if we want to support "Next" to a review step, we use this.
            // Let's assume the button is SUBMIT.
            // So this function might be dead code or used if we change button type.
            // I will keep it functional just in case.
            onNext();
        }
    };

    // Common Input Styles
    const inputClasses = "w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600";
    const errorInputClasses = "border-red-500 focus:ring-red-500";
    const labelClasses = "text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2 block";

    const wrappedAction = (formData: FormData) => {
        if (faceFile) {
            formData.append("faceImage", faceFile); // For Face Login encoding
        }
        if (profileImage) {
            formData.append("profileImage", profileImage); // For display Avatar
        }
        // Append all fields explicitly or ensure formData has them if they were plain objects
        // The form action receives FormData from the DOM form automatically for inputs with 'name'

        // Ensure role is passed
        formData.append("role", selectedRole || "");

        // Ensure phoneNumber is passed if using custom input that might not sync perfectly with native input logic (though we added hidden input)
        // Hidden input takes care of it.

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

            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* PROFILE PICTURE UPLOAD - Top of Step 2 */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <label className={cn(labelClasses, "text-center mb-3")}>Profile Picture</label>

                            {!profileImage ? (
                                <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setProfileImage(e.target.files[0]);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                        {/* Abstract Person/Avatar Placeholder */}
                                        <svg className="w-24 h-24 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-white text-[10px] uppercase font-bold text-center translate-y-full group-hover:translate-y-0 transition-transform">
                                        Upload
                                    </div>
                                    <Upload className="w-8 h-8 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 absolute mb-2" />
                                </div>
                            ) : (
                                <div className="relative w-40 h-40">
                                    <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl">
                                        <img src={URL.createObjectURL(profileImage)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setProfileImage(null)}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

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
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* SHARED EXTRA FIELDS */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className={cn(inputClasses, "appearance-none")}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className={labelClasses}>Phone Number</label>
                            <div className="flex bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 transition-all h-12">
                                {/* Country Code Dropdown */}
                                <div className="relative border-r border-slate-200 dark:border-slate-800 h-full">
                                    <select
                                        value={countryCode}
                                        onChange={e => handlePhoneChange(e.target.value, localNumber)}
                                        className="appearance-none h-full bg-slate-100 dark:bg-slate-900/50 pl-3 pr-8 outline-none text-sm font-medium cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white border-none focus:ring-0"
                                    >
                                        {COUNTRY_CODES.map((c, idx) => (
                                            <option key={`${c.code}-${c.country}-${idx}`} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-500">
                                        <ChevronDown size={12} />
                                    </div>
                                </div>

                                {/* Local Number Input */}
                                <input
                                    type="tel"
                                    value={localNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        handlePhoneChange(countryCode, val);
                                    }}
                                    className="flex-1 bg-transparent px-4 outline-none text-sm placeholder:text-slate-400 dark:text-white border-none focus:ring-0"
                                    placeholder="300 1234567"
                                />
                            </div>
                            {/* Hidden input to ensure it submits if needed, though we sync to formData state which is what matters if we were using purely controlled. But this is a form action. 
                                 Wait, the form action uses FormData(form). We need to ensure 'phoneNumber' is in there. 
                                 Either we use a hidden input with name="phoneNumber" value={formData.phoneNumber} 
                                 OR we manually append it in wrappedAction. 
                                 The current code for other fields relies on inputs having names. 
                                 Let's add a hidden input.
                             */}
                            <input type="hidden" name="phoneNumber" value={formData.phoneNumber} />
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClasses}>CNIC / ID</label>
                            <input
                                name="cnic"
                                value={formData.cnic}
                                onChange={handleInputChange}
                                className={cn(inputClasses)}
                                placeholder="ID Number"
                            />
                        </div>

                        {/* ADMIN: Show City */}
                        {selectedRole === "admin" && (
                            <div>
                                <label className={labelClasses}>City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className={cn(inputClasses)}
                                    placeholder="City"
                                />
                            </div>
                        )}

                        {/* DOCTOR: Show Medical License */}
                        {selectedRole === "radiologist" && (
                            <div>
                                <label className={labelClasses}>Medical License Number (Required)</label>
                                <input
                                    name="medicalLicenseId"
                                    value={formData.medicalLicenseId}
                                    onChange={handleInputChange}
                                    className={cn(inputClasses, errors.medicalLicenseId && errorInputClasses)}
                                    placeholder="License #"
                                    required
                                />
                                {errors.medicalLicenseId && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.medicalLicenseId}</p>}
                            </div>
                        )}
                    </div>


                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                        <label className={labelClasses}>Face Login Setup (Optional)</label>
                        <FaceCapture onCapture={(file) => {
                            setFaceFile(file);
                            if (!file) setFormData(prev => ({ ...prev, pin: "" }));
                        }} label="Scan Face for Easy Login" />
                    </div>

                    {/* PIN FIELD - CONDITIONAL */}
                    {faceFile && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                            <label className={labelClasses}>Security PIN (For Face Login)</label>
                            <input
                                name="pin"
                                type="password"
                                maxLength={6}
                                value={formData.pin}
                                onChange={handleInputChange}
                                className={cn(inputClasses, errors.pin && errorInputClasses)}
                                placeholder="Enter 4-6 digit PIN"
                            />
                            <p className="text-xs text-slate-400 mt-1">Required when face login is enabled.</p>
                            {errors.pin && <p className="text-xs text-red-500 mt-1 font-medium animate-in slide-in-from-top-1">{errors.pin}</p>}
                        </div>
                    )}

                    <div className="py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleInputChange}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                required
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                            </span>
                        </label>
                        {errors.termsAccepted && <p className="text-xs text-red-500 mt-1 font-medium pl-8 animate-in slide-in-from-top-1">{errors.termsAccepted}</p>}
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
                                disabled={isPending || !isFormValid()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:active:scale-100 disabled:hover:translate-y-0 flex items-center gap-2"
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