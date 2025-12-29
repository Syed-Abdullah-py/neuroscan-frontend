import { getCurrentUser, getUserWorkspaces, getTeamMembers, getJoinRequests, getMyInvitations, getWorkspaceInvitations } from "@/actions/auth-actions"; // Added getJoinRequests
import { UnifiedWorkspace } from "@/features/workspaces/components/unified-workspace";

export default async function AdminWorkspacesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Fetch members if active workspace
    const members = user?.workspaceId ? await getTeamMembers() : [];



    // Fetch join requests if active workspace
    const joinRequests = user?.workspaceId ? await getJoinRequests() : [];
    const invitations = await getMyInvitations();
    const sentInvitations = user?.workspaceId ? await getWorkspaceInvitations() : [];
    // Get current workspace name
    const currentWorkspaceName = workspaces.find(w => w.id === user?.workspaceId)?.name;

    if (!user) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Center</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your organization, team, and settings.
                </p>
            </div>

            <UnifiedWorkspace
                user={user as any}
                workspaces={workspaces}
                currentWorkspaceName={currentWorkspaceName}
                members={members}
                joinRequests={joinRequests}
                invitations={invitations}
                sentInvitations={sentInvitations}
            />
        </div>
    );
}
