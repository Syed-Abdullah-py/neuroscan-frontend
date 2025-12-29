import { getCurrentUser, getUserWorkspaces, getTeamMembers, getJoinRequests, getMyInvitations, getWorkspaceInvitations } from "@/actions/auth-actions";
import { UnifiedWorkspace } from "@/features/workspaces/components/unified-workspace";

export default async function DoctorWorkspacesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Doctors might see members (read only) or just list. Component handles this.
    // We pass members so they see the count or list if allowed.
    const members = user?.workspaceId ? await getTeamMembers() : [];

    // Fetch join requests in case the doctor is an admin of this workspace
    // (A user can be Global Doctor but Workspace Admin)
    const joinRequests = user?.workspaceId ? await getJoinRequests() : [];
    const invitations = await getMyInvitations();
    const sentInvitations = user?.workspaceId ? await getWorkspaceInvitations() : [];

    const currentWorkspaceName = workspaces.find(w => w.id === user?.workspaceId)?.name;

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
