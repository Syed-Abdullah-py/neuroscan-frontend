import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { getCurrentUser, getMyInvitations } from "@/actions/auth-actions";
import { getDoctorDashboardStats, getRecentAssignedCases } from "@/actions/doctor-actions";
import { DoctorDashboardUI } from "@/features/doctor/components/doctor-dashboard-ui";

export default async function DoctorDashboard() {
    const user = await getCurrentUser();
    const invitations = await getMyInvitations();

    if (!user?.workspaceId) {
        return <OnboardingWizard userRole={user?.globalRole?.toUpperCase()} invitations={invitations} />;
    }

    // Fetch dashboard data in parallel
    const [stats, recentCases] = await Promise.all([
        getDoctorDashboardStats(),
        getRecentAssignedCases()
    ]);

    return (
        <DoctorDashboardUI
            stats={stats}
            recentCases={recentCases}
            userName={user.name || "Doctor"}
        />
    );
}
