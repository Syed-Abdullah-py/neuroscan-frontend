import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { casesApi } from "@/lib/api/cases.api";
import { patientsApi } from "@/lib/api/patients.api";
import { ApiError } from "@/lib/api/client";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Resolve active workspace
    let memberships: any[] = [];
    try {
        memberships = await workspacesApi.list();
    } catch (err) {
        const e = err as ApiError;
        if (e?.status === 401) redirect("/login");
    }

    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;

    // Prefetch data server-side so the page renders with content immediately
    // All errors are caught — the client hooks will retry if needed
    const [stats, recentCases, members, joinRequests] = await Promise.all([
        workspaceId
            ? casesApi.stats(workspaceId).catch(() => null)
            : Promise.resolve(null),
        workspaceId
            ? casesApi.recent(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId
            ? workspacesApi.listMembers(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId && (activeWorkspace?.role === "OWNER" || activeWorkspace?.role === "ADMIN")
            ? workspacesApi.listJoinRequests(workspaceId).catch(() => [])
            : Promise.resolve([]),
    ]);

    return (
        <DashboardShell
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                globalRole: user.globalRole,
                avatar: user.avatar,
                workspaceId,
            }}
            workspaceRole={activeWorkspace?.role ?? null}
            workspaceId={workspaceId ?? null}
            initialStats={stats}
            initialRecentCases={recentCases as any[]}
            initialMembers={members as any[]}
            initialJoinRequests={joinRequests as any[]}
        />
    );
}