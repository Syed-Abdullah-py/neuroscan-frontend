import { Users, FileText, Activity, AlertCircle, UserPlus } from "lucide-react";
import { getCurrentUser, getJoinRequests } from "@/actions/auth-actions";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { JoinRequestsList } from "@/features/admin/components/join-requests-list";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user?.workspaceId) {
        return <OnboardingWizard />;
    }

    // Only fetch requests if we have a workspace
    const joinRequests = await getJoinRequests();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, {user.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KpiCard title="Total Patients" value="1,284" change="+12%" icon={Users} />
                        <KpiCard title="Pending Cases" value="42" change="+5" icon={AlertCircle} alert />
                        <KpiCard title="Active Doctors" value="24" change="0%" icon={FileText} />
                    </div>
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-6">
                    {/* Join Requests Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-blue-500" />
                                Join Requests
                            </h3>
                            {joinRequests.length > 0 && (
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {joinRequests.length}
                                </span>
                            )}
                        </div>
                        <JoinRequestsList requests={joinRequests} currentUserEmail={user.email!} />
                    </div>
                </div>
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