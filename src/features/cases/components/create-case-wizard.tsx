"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Upload, User, UserPlus, FileText, CheckCircle2, AlertCircle, X, Stethoscope, ChevronRight, ChevronLeft } from "lucide-react"
import { checkPatientByPhone, createPatient } from "@/features/admin/actions/patient-actions"
import { createCase, getDoctorsForDropdown } from "@/features/cases/actions/case-actions"
import { cn } from "@/lib/utils"

export function CreateCaseWizard({ workspaceId, onSuccess, mode = 'case' }: { workspaceId: string, onSuccess: () => void, mode?: 'case' | 'patient' }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data State
    const [phoneNumber, setPhoneNumber] = useState("")
    const [patient, setPatient] = useState<any>(null)
    const [matchingPatients, setMatchingPatients] = useState<any[]>([])
    const [isNewPatient, setIsNewPatient] = useState(false)

    // New Patient Form
    const [patientForm, setPatientForm] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        mrn: "",
        cnic: "",
        address: "",
        city: ""
    })

    // Files
    const [files, setFiles] = useState<File[]>([])
    const [validationResult, setValidationResult] = useState<any>(null)

    // Case Details
    const [caseDetails, setCaseDetails] = useState({
        bodyPart: "BRAIN",
        priority: "normal",
        notes: ""
    })

    // Doctor Assignment
    const [doctors, setDoctors] = useState<any[]>([])
    const [assignedDoctorId, setAssignedDoctorId] = useState<string>("")

    // Step 1: Check Phone
    const handlePhoneSearch = async () => {
        setLoading(true)
        setError(null)
        try {
            // Now returns an array
            const results = await checkPatientByPhone(phoneNumber, workspaceId)

            if (results && results.length > 0) {
                setMatchingPatients(results)
                // Stay on step 1 but show list? Or move to a "1.5"?
                // Let's keep step 1 active but change view state internally or just append list below.
            } else {
                setMatchingPatients([])
                setPatient(null)
                setIsNewPatient(true)
                setStep(2) // Go to create patient immediately if none found
            }
        } catch (e) {
            setError("Failed to check phone number")
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Create Patient
    const handleCreatePatient = async () => {
        // Validation
        if (!patientForm.firstName || !patientForm.lastName || !patientForm.dob || !patientForm.address || !patientForm.city) {
            setError("Please fill in required fields (Name, DOB, Address, City)")
            return
        }

        // CNIC Validation (xxxxx-xxxxxxx-x)
        if (patientForm.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(patientForm.cnic)) {
            setError("Invalid CNIC format. Use xxxxx-xxxxxxx-x")
            return
        }

        // Phone Validation is implicitly handled by step 1 input, but let's double check format
        // User requested: +92 xxx-xxx-xxxx. Let's be lenient or Strict? 
        // My schema comment: +92 3xx-xxxxxxx
        // Let's enforce standard PK format loosely: starts with +92
        if (!phoneNumber.startsWith("+92")) {
            setError("Phone number must start with +92")
            return
        }

        setLoading(true)
        try {
            const newPatient = await createPatient({
                ...patientForm,
                dob: new Date(patientForm.dob),
                phoneNumber,
                workspaceId
            })

            if (mode === 'patient') {
                onSuccess()
            } else {
                setPatient(newPatient)
                setStep(3)
            }
        } catch (e) {
            setError("Failed to create patient. Check if phone already exists.")
        } finally {
            setLoading(false)
        }
    }

    // Step 3: File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(selectedFiles)

            // Validate
            setLoading(true)
            const formData = new FormData()
            selectedFiles.forEach(f => formData.append("files", f))

            try {
                // Call Python Backend
                const response = await fetch("http://127.0.0.1:8000/validate-case-files", {
                    method: "POST",
                    body: formData
                })
                const result = await response.json()
                setValidationResult(result)

                if (!result.valid) {
                    setError(result.message)
                } else {
                    setError(null)
                }
            } catch (err) {
                setError("Failed to validate files with backend")
            } finally {
                setLoading(false)
            }
        }
    }

    // Step 4: Assignment
    const fetchDoctors = async () => {
        const docs = await getDoctorsForDropdown(workspaceId)
        setDoctors(docs)
        if (docs.length > 0) {
            setAssignedDoctorId(docs[0].id) // Default to first (least busy)
        }
    }

    const handleSubmit = async () => {
        if (!validationResult?.valid) return

        setLoading(true)
        try {
            // "Upload logic" - Since we don't have cloud storage, we just mock the file references
            // In a real app we'd upload to S3 here.

            const fileRefs = JSON.stringify(files.map(f => ({ name: f.name, size: f.size })))

            await createCase({
                patientId: patient.id,
                workspaceId,
                ...caseDetails,
                fileReferences: fileRefs,
                assignedToMemberId: assignedDoctorId
            })

            onSuccess()
        } catch (e) {
            setError("Failed to create case")
        } finally {
            setLoading(false)
        }
    }

    // Effect to fetch doctors on mount for auto-assignment
    useEffect(() => {
        if (doctors.length === 0) {
            fetchDoctors()
        }
    }, [])

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden max-w-3xl w-full mx-auto relative">
            {/* Hero Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-to-r from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 relative">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => onSuccess()} // Treat cancel/back as success (closing wizard) or we can simply allow navigation back
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex gap-2">
                        {[1, 2].map(i => (
                            <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", step >= i ? "bg-blue-600 scale-110" : "bg-slate-200 dark:bg-slate-800")} />
                        ))}
                        {mode === 'case' && [3].map(i => (
                            <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", step >= i ? "bg-blue-600 scale-110" : "bg-slate-200 dark:bg-slate-800")} />
                        ))}
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {mode === 'patient' ? "Add New Patient" : "Create New Case"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    {mode === 'patient'
                        ? "Enter patient details to add them to your workspace registry."
                        : "Start a new diagnostic case by identifying the patient and uploading scans."}
                </p>
            </div>

            <div className="p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border border-red-100 dark:border-red-900/30 font-medium"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                    Patient Phone Number
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        placeholder="+92 300 1234567"
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handlePhoneSearch}
                                        disabled={loading || !phoneNumber}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-bold text-base disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? "Checking..." : "Next"}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Enter the phone number including country code (e.g., +92).
                                </p>
                            </div>

                            {matchingPatients.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <User size={16} className="text-blue-500" />
                                        Existing Patients Found
                                    </p>
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                        {matchingPatients.map(p => (
                                            <div key={p.id} className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors group">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-lg">{p.firstName} {p.lastName}</p>
                                                    <div className="flex gap-3 text-sm text-slate-500 mt-0.5">
                                                        <span>{p.gender}</span>
                                                        <span>•</span>
                                                        <span>{new Date(p.dob).getFullYear()}</span>
                                                        {p.city && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{p.city}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (mode === 'patient') {
                                                            onSuccess()
                                                        } else {
                                                            setPatient(p)
                                                            setIsNewPatient(false)
                                                            setStep(3)
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-2 rounded-lg font-bold text-sm"
                                                >
                                                    {mode === 'patient' ? "View Profile" : "Select Patient"}
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setMatchingPatients([])
                                                setPatient(null)
                                                setIsNewPatient(true)
                                                setStep(2)
                                            }}
                                            className="w-full py-4 bg-slate-50 dark:bg-slate-950 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <UserPlus size={18} />
                                            Ignore & Register New
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                                    <input
                                        value={patientForm.firstName}
                                        onChange={e => setPatientForm({ ...patientForm, firstName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                                    <input
                                        value={patientForm.lastName}
                                        onChange={e => setPatientForm({ ...patientForm, lastName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={patientForm.dob}
                                        onChange={e => setPatientForm({ ...patientForm, dob: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                                    <select
                                        value={patientForm.gender}
                                        onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">MRN (Optional)</label>
                                    <input
                                        value={patientForm.mrn}
                                        onChange={e => setPatientForm({ ...patientForm, mrn: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        placeholder="HOSP-123"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">CNIC (Optional)</label>
                                    <input
                                        value={patientForm.cnic}
                                        onChange={e => setPatientForm({ ...patientForm, cnic: e.target.value })}
                                        placeholder="xxxxx-xxxxxxx-x"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">City</label>
                                    <input
                                        value={patientForm.city}
                                        onChange={e => setPatientForm({ ...patientForm, city: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        placeholder="Lahore"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Address</label>
                                    <input
                                        value={patientForm.address}
                                        onChange={e => setPatientForm({ ...patientForm, address: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                        placeholder="Street 1, Block A"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleCreatePatient}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2"
                                >
                                    {loading ? "Processing..." : (mode === 'patient' ? "Register Patient" : "Continue to Case")}
                                    {!loading && <ChevronRight size={20} />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl flex items-center gap-4 border border-blue-100 dark:border-blue-900/30">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                                    <User size={24} className="text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">{patient?.firstName} {patient?.lastName}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: {patient?.id?.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                    Upload Scan Files
                                </label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900 relative group cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-105 duration-300">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                            <Upload className="text-slate-400 w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                Click to upload or drag & drop
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                DICOM, NIfTI (.nii.gz), or HDF5 (.h5)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg">
                                            <FileText size={18} className="text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{files.length} {files.length === 1 ? 'file' : 'files'} selected</p>
                                            <p className="text-xs text-slate-500">{files.map(f => f.name).join(", ")}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading && <p className="text-sm text-center text-blue-500 font-medium animate-pulse">Validating and processing files...</p>}

                            {validationResult && (
                                <div className={cn("p-5 rounded-2xl border text-sm flex items-start gap-3", validationResult.valid ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400")}>
                                    {validationResult.valid ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                                    <div className="flex-1">
                                        <p className="font-bold">{validationResult.valid ? "Validation Successful" : "Validation Failed"}</p>
                                        <p className="mt-1 opacity-90">{validationResult.message}</p>
                                    </div>
                                    {validationResult.valid && (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-600/20"
                                        >
                                            Submit Case
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
