import { Users, FileText, Activity, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back, Administrator.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Patients" value="1,284" change="+12%" icon={Users} />
                <KpiCard title="Pending Cases" value="42" change="+5" icon={AlertCircle} alert />
                <KpiCard title="Active Doctors" value="24" change="0%" icon={FileText} />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-96 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Case Activity Table will go here</span>
            </div>
        </div>
    );
}

function KpiCard({ title, value, change, icon: Icon, alert }: any) {
    return (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</span>
                <Icon className={`w-4 h-4 ${alert ? "text-amber-500" : "text-slate-400"}`} />
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
                <span className={`text-xs font-medium mb-1 ${change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-slate-500"
                    }`}>
                    {change}
                </span>
            </div>
        </div>
    );
}