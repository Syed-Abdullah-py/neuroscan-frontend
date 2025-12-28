import { getCurrentUser, getJoinRequests, getMyInvitations } from "@/actions/auth-actions";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { CameraCleanup } from "@/components/camera-cleanup";
import { AdminDashboardUI } from "@/features/admin/components/admin-dashboard-ui";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    // Fetch invitations for user (even if they have no workspace yet)
    const invitations = await getMyInvitations();

    if (!user?.workspaceId) {
        return <OnboardingWizard userRole={user?.globalRole?.toUpperCase()} invitations={invitations} />;
    }

    // Only fetch requests if we have a workspace
    const joinRequests = await getJoinRequests();

    return (
        <>
            <CameraCleanup />
            <AdminDashboardUI user={user} joinRequests={joinRequests} />
        </>
    );
}