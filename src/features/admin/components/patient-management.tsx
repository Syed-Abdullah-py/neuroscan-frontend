"use client"
import { useState, useEffect } from "react"
import { getAllPatients } from "@/features/admin/actions/patient-actions"
import { Search, User, FileText, ChevronRight } from "lucide-react"

export function PatientManagement({ workspaceId }: { workspaceId: string }) {
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAllPatients(workspaceId)
                setPatients(data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [workspaceId])

    const filtered = patients.filter(p =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.phoneNumber.includes(search)
    )

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Patient Directory
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search patients..."
                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm w-64"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-950/50">
                        <tr>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">Name</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">Phone</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">DOB</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase p-4">Gender</th>
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
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                                        {p.firstName} {p.lastName}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{p.phoneNumber}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(p.dob).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">{p.gender}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">View History</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
