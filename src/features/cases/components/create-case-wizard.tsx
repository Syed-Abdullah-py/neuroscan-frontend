"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Upload, User, FileText, CheckCircle2, AlertCircle, X, Stethoscope, ChevronRight, ChevronLeft } from "lucide-react"
import { checkPatientByPhone, createPatient } from "@/features/admin/actions/patient-actions"
import { createCase, getDoctorsForDropdown } from "@/features/cases/actions/case-actions"
import { cn } from "@/lib/utils"

export function CreateCaseWizard({ workspaceId, onSuccess }: { workspaceId: string, onSuccess: () => void }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Data State
    const [phoneNumber, setPhoneNumber] = useState("")
    const [patient, setPatient] = useState<any>(null)
    const [isNewPatient, setIsNewPatient] = useState(false)

    // New Patient Form
    const [patientForm, setPatientForm] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        mrn: ""
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
            const result = await checkPatientByPhone(phoneNumber, workspaceId)
            if (result) {
                setPatient(result)
                setIsNewPatient(false)
                setStep(3) // Skip to files if patient exists
            } else {
                setPatient(null)
                setIsNewPatient(true)
                setStep(2) // Go to create patient
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
        if (!patientForm.firstName || !patientForm.lastName || !patientForm.dob) {
            setError("Please fill in required fields")
            return
        }

        // We don't save yet, just move to next step, we save everything at the end? 
        // Or save patient now? Plan says "Create Patient" action.
        // Let's create patient now to get ID.
        setLoading(true)
        try {
            const newPatient = await createPatient({
                ...patientForm,
                dob: new Date(patientForm.dob),
                phoneNumber,
                workspaceId
            })
            setPatient(newPatient)
            setStep(3)
        } catch (e) {
            setError("Failed to create patient")
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

    // Effect to fetch doctors when entering step 4
    if (step === 4 && doctors.length === 0) {
        fetchDoctors()
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Case</h2>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={cn("w-2 h-2 rounded-full transition-colors", step >= i ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700")} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Patient Phone Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    placeholder="+1 234 567 890"
                                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handlePhoneSearch}
                                    disabled={loading || !phoneNumber}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-medium disabled:opacity-50"
                                >
                                    {loading ? "Checking..." : "Next"}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                We'll check if the patient already exists in the system.
                            </p>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">New Patient Registration</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">First Name</label>
                                    <input
                                        value={patientForm.firstName}
                                        onChange={e => setPatientForm({ ...patientForm, firstName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">Last Name</label>
                                    <input
                                        value={patientForm.lastName}
                                        onChange={e => setPatientForm({ ...patientForm, lastName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">DOB</label>
                                    <input
                                        type="date"
                                        value={patientForm.dob}
                                        onChange={e => setPatientForm({ ...patientForm, dob: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">Gender</label>
                                    <select
                                        value={patientForm.gender}
                                        onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">MRN (Optional)</label>
                                <input
                                    value={patientForm.mrn}
                                    onChange={e => setPatientForm({ ...patientForm, mrn: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleCreatePatient}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium"
                                >
                                    {loading ? "Creating..." : "Create & Continue"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                    <User size={20} className="text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{patient?.firstName} {patient?.lastName}</p>
                                    <p className="text-xs text-slate-500">Patient ID: {patient?.id}</p>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center transition-colors hover:border-blue-500 dark:hover:border-blue-500 relative">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <Upload className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Drag & drop files or click to browse
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Supported: .h5 (155 slices), .nii.gz (4 volumes), or .zip/.tar archives.
                                    </p>
                                </div>
                            </div>

                            {loading && <p className="text-sm text-center text-blue-500 animate-pulse">Validating files...</p>}

                            {validationResult && (
                                <div className={cn("p-4 rounded-xl border", validationResult.valid ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700")}>
                                    <div className="flex items-center gap-2">
                                        {validationResult.valid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <span className="font-medium text-sm">{validationResult.message}</span>
                                    </div>
                                    {validationResult.valid && (
                                        <div className="flex justify-end mt-2">
                                            <button onClick={() => setStep(4)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold">
                                                Continue
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Final Details & Assignment</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">Body Part</label>
                                    <select
                                        value={caseDetails.bodyPart}
                                        onChange={e => setCaseDetails({ ...caseDetails, bodyPart: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    >
                                        <option value="BRAIN">Brain</option>
                                        <option value="SPINE">Spine</option>
                                        <option value="ABDOMEN">Abdomen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">Priority</label>
                                    <select
                                        value={caseDetails.priority}
                                        onChange={e => setCaseDetails({ ...caseDetails, priority: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Clinical Notes</label>
                                <textarea
                                    value={caseDetails.notes}
                                    onChange={e => setCaseDetails({ ...caseDetails, notes: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Assign To Doctor</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        value={assignedDoctorId}
                                        onChange={e => setAssignedDoctorId(e.target.value)}
                                        className="w-full pl-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 appearance-none"
                                    >
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                                Dr. {doc.user?.name} — {doc._count.assignedCases} pending cases
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                        Auto-selected optimal
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/25"
                                >
                                    {loading ? "Creating..." : "Create Case"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
