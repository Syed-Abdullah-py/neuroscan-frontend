import { getCurrentUser, getTeamMembers } from "@/actions/auth-actions";
import { TeamManagement } from "@/features/admin/components/team-management";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma"; // Direct access since server component

export default async function ManagementPage() {
    const user = await getCurrentUser();
    const members = await getTeamMembers();

    // Fetch Workspace Details
    // We can infer workspace ID from user.workspaceId or fetch explicit workspace record
    // Since getTeamMembers fetches members, we assume we have access.
    // Let's create a helper "getCurrentWorkspace" or just use `user.workspaceId` and name from session/DB? 
    // `getCurrentUser` returns `workspaceId`. We need the name.
    // `getUserWorkspaces` returns list. 
    // Let's quickly fetch the name.

    // We can assume we have a workspace if we are here (middleware/layout checks).
    const workspace = await prisma.workspace.findUnique({
        where: { id: user?.workspaceId || "cx" }, // fallback to prevent crash if null (though validation handles it)
        select: { id: true, name: true }
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Team Management</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage workspace members and permissions.
                </p>
            </div>

            <TeamManagement
                initialMembers={members as any[]}
                currentUserEmail={user?.email || ""}
                currentUserRole={user?.role?.toUpperCase()}
                workspaceName={workspace?.name || "Workspace"}
                workspaceId={workspace?.id || ""}
            />
        </div>
    );
}
