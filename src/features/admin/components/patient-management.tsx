"use client"
import { useState, useEffect } from "react"
import { Search, User, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"
import { getAllPatients, deletePatient, updatePatient } from "@/features/admin/actions/patient-actions"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function PatientManagement({ workspaceId, headerActions }: { workspaceId: string, headerActions?: React.ReactNode }) {
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Actions State
    const [editingPatient, setEditingPatient] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        loadHeader()
    }, [workspaceId])

    const loadHeader = async () => {
        try {
            const data = await getAllPatients(workspaceId)
            setPatients(data)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this patient? This will also remove their cases.")) return
        setActionLoading(true)
        try {
            await deletePatient(id)
            setPatients(patients.filter(p => p.id !== id))
        } catch (e) {
            alert("Failed to delete patient")
        } finally {
            setActionLoading(false)
        }
    }

    const filtered = patients.filter(p =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.phoneNumber.includes(search)
    )

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
                        <User className="w-5 h-5 text-blue-500" />
                        Patient Directory
                    </h2>
                    {/* Header Actions (Buttons) */}
                    {headerActions && (
                        <div className="flex-1 md:flex-none">
                            {headerActions}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-950/50">
                        <tr>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">Name</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">Phone</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">DOB</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">City</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading directory...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No patients found.</td></tr>
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                                        {p.firstName} {p.lastName}
                                        {p.mrn && <span className="ml-2 text-xs text-slate-400">({p.mrn})</span>}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{p.phoneNumber}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(p.dob).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{p.city || "-"}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingPatient(p)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingPatient && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Edit Patient</h3>
                                <button onClick={() => setEditingPatient(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><X size={20} /></button>
                            </div>

                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault()
                                const fd = new FormData(e.currentTarget)
                                const data = {
                                    firstName: fd.get('firstName') as string,
                                    lastName: fd.get('lastName') as string,
                                    cnic: fd.get('cnic') as string,
                                    address: fd.get('address') as string,
                                    city: fd.get('city') as string
                                }

                                setActionLoading(true)
                                try {
                                    const updated = await updatePatient(editingPatient.id, data)
                                    setPatients(patients.map(p => p.id === updated.id ? updated : p))
                                    setEditingPatient(null)
                                } catch (err) {
                                    alert("Failed to update")
                                } finally {
                                    setActionLoading(false)
                                }
                            }}>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="firstName" defaultValue={editingPatient.firstName} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="First Name" required />
                                    <input name="lastName" defaultValue={editingPatient.lastName} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Last Name" required />
                                </div>
                                <input name="cnic" defaultValue={editingPatient.cnic || ""} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="CNIC" />
                                <input name="address" defaultValue={editingPatient.address || ""} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Address" />
                                <input name="city" defaultValue={editingPatient.city || ""} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="City" />

                                <button type="submit" disabled={actionLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold flex justify-center items-center">
                                    {actionLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
