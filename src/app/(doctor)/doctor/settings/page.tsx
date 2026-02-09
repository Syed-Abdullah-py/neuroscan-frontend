import { getCurrentUser } from "@/actions/auth-actions";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
    const user = await getCurrentUser();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 max-w-5xl mx-auto">Workspace Settings</h1>
            </div>

            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">General Settings</h3>
                <p className="mb-4">Configure your workspace preferences here.</p>
                <p className="text-sm bg-slate-50 dark:bg-slate-950 inline-block px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    To manage team members, please visit the <span className="font-bold text-blue-600">Management</span> tab.
                </p>
            </div>
        </div>
    );
}
