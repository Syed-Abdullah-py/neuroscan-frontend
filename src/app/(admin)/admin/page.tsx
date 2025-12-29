import { getCurrentUser, getJoinRequests, getUserWorkspaces } from "@/actions/auth-actions";
import { CameraCleanup } from "@/components/camera-cleanup";
import { AdminDashboardUI } from "@/features/admin/components/admin-dashboard-ui";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    // Fetch invitations for user (even if they have no workspace yet)
    // const invitations = await getMyInvitations(); // Moved to WorkspaceManager or handle differently? 
    // Actually we keep invitations logic but maybe we don't force wizard.

    // Fetch workspaces for the manager
    const workspaces = await getUserWorkspaces();

    // Only fetch requests if we have a workspace
    const joinRequests = user?.workspaceId ? await getJoinRequests() : [];

    return (
        <>
            <CameraCleanup />
            <AdminDashboardUI
                user={user}
                joinRequests={joinRequests}
                workspaces={workspaces}
            />
        </>
    );
}