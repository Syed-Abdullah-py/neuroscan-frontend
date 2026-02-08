import { getCurrentUser, getUserWorkspaces, getMyInvitations } from "@/actions/auth-actions";
import { getDoctorDashboardStats, getRecentAssignedCases } from "@/actions/doctor-actions";
import { DoctorDashboardUI } from "@/features/doctor/components/doctor-dashboard-ui";


export default async function DoctorDashboard() {
    const user = await getCurrentUser();
    const invitations = await getMyInvitations();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    // Fetch dashboard data only if workspace exists
    let stats = null;
    let recentCases: any[] = [];

    if (activeWorkspaceId) {
        // Fetch dashboard data in parallel
        [stats, recentCases] = await Promise.all([
            getDoctorDashboardStats(activeWorkspaceId),
            getRecentAssignedCases(activeWorkspaceId)
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
                globalRole: user?.role ?? null, // Use role from token as globalRole too for now
                workspaceId: activeWorkspaceId || undefined
            }}
            workspaces={workspaces}
        />
    );
}
