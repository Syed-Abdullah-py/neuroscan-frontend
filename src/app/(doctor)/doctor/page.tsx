import { getCurrentUser, getUserWorkspaces, getMyInvitations } from "@/actions/auth-actions";
import { getDoctorDashboardStats, getRecentAssignedCases } from "@/actions/doctor-actions";
import { DoctorDashboardUI } from "@/features/doctor/doctor-dashboard-ui";

export default async function DoctorDashboard() {
    const user = await getCurrentUser();
    const invitations = await getMyInvitations();

    // Fetch dashboard data only if workspace exists
    let stats = null;
    let recentCases: any[] = [];

    // Always fetch workspaces
    const workspaces = await getUserWorkspaces();

    if (user?.workspaceId) {
        // Fetch dashboard data in parallel
        [stats, recentCases] = await Promise.all([
            getDoctorDashboardStats(),
            getRecentAssignedCases()
        ]);
    }

    return (
        <DoctorDashboardUI
            stats={stats}
            recentCases={recentCases}
            user={{
                name: user?.name ?? "Doctor",
                email: user?.email ?? "",
                role: user?.role ?? "DOCTOR",
                globalRole: user?.globalRole ?? null,
                workspaceId: user?.workspaceId
            }}
            workspaces={workspaces}
        />
    );
}
