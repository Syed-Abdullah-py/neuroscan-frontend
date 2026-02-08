import { getCurrentUser, getUserWorkspaces, getTeamMembers, getJoinRequests, getMyInvitations, getWorkspaceInvitations } from "@/actions/auth-actions";
import { UnifiedWorkspace } from "@/features/workspaces/components/unified-workspace";

export default async function DoctorWorkspacesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    // Fetch members if active workspace
    const members = activeWorkspaceId ? await getTeamMembers(activeWorkspaceId) : [];

    // Fetch join requests/invitations
    const joinRequests = activeWorkspaceId ? await getJoinRequests(activeWorkspaceId) : [];
    const invitations = await getMyInvitations();
    const sentInvitations = activeWorkspaceId ? await getWorkspaceInvitations(activeWorkspaceId) : [];

    const currentWorkspaceName = activeWorkspace?.name;

    if (!user) return null;

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workspaces</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your memberships.
                </p>
            </div>

            <UnifiedWorkspace
                user={{ ...user, workspaceId: activeWorkspaceId || undefined } as any}
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
