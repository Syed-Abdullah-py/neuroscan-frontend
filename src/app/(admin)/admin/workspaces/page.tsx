import { getCurrentUser, getUserWorkspaces, getTeamMembers, getJoinRequests, getMyInvitations, getWorkspaceInvitations } from "@/actions/auth-actions";
import { UnifiedWorkspace } from "@/features/workspaces/components/unified-workspace";
import { cookies } from "next/headers";

export default async function AdminWorkspacesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    // Fetch members if active workspace
    const members = activeWorkspaceId ? await getTeamMembers(activeWorkspaceId) : [];

    // Fetch join requests if active workspace
    const joinRequests = activeWorkspaceId ? await getJoinRequests(activeWorkspaceId) : [];
    const invitations = await getMyInvitations();
    const sentInvitations = activeWorkspaceId ? await getWorkspaceInvitations(activeWorkspaceId) : [];
    // Get current workspace name
    const currentWorkspaceName = activeWorkspace?.name;

    if (!user) return null;

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto space-y-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Center</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your organization, team, and settings.
                </p>
            </div>

            {/* Existing Unified View */}
            <UnifiedWorkspace
                user={{
                    ...user,
                    workspaceId: activeWorkspaceId || undefined
                } as any}
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
