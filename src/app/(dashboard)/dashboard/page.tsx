import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { casesApi } from "@/lib/api/cases.api";
import { patientsApi } from "@/lib/api/patients.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function DashboardPage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { user, workspaceId, workspaceRole } = ctx;

    const [stats, recentCases, members, patients] = await Promise.all([
        workspaceId
            ? casesApi.stats(workspaceId).catch(() => null)
            : Promise.resolve(null),
        workspaceId
            ? casesApi.recent(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId
            ? workspacesApi.listMembers(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId
            ? patientsApi.list(workspaceId).catch(() => [])
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
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
            workspaceId={workspaceId ?? null}
            initialStats={stats}
            initialRecentCases={recentCases as any[]}
            initialMembers={members as any[]}
            initialPatients={patients as any[]}
        />
    );
}