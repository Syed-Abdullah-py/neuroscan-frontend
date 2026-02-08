import { getCurrentUser, getJoinRequests, getUserWorkspaces, getTeamMembers } from "@/actions/auth-actions";
import { AdminDashboardUI } from "@/features/admin/components/admin-dashboard-ui";

export default async function AdminDashboard() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    // Fetch data for the resolved active workspace
    const joinRequests = activeWorkspaceId ? await getJoinRequests(activeWorkspaceId) : [];
    const members = activeWorkspaceId ? await getTeamMembers(activeWorkspaceId) : [];

    return (
        <>
            <AdminDashboardUI
                user={user ? { ...user, workspaceId: activeWorkspaceId || undefined } : null}
                joinRequests={joinRequests}
                workspaces={workspaces}
                members={members}
            />
        </>
    );
}