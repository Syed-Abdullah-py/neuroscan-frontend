import { getCurrentUser, getTeamMembers } from "@/actions/auth-actions";
import { TeamManagement } from "@/features/admin/components/team-management";
import { Users } from "lucide-react";

export default async function ManagementPage() {
    const user = await getCurrentUser();
    const members = await getTeamMembers();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Team Management</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage workspace members and permissions.
                </p>
            </div>

            <TeamManagement initialMembers={members} currentUserEmail={user?.email || ""} />
        </div>
    );
}
