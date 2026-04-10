import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { casesApi } from "@/lib/api/cases.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { CasesShell } from "@/features/cases/components/cases-shell";

export default async function CasesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;
    const workspaceRole = activeWorkspace?.role ?? null;

    const [cases, stats] = await Promise.all([
        workspaceId ? casesApi.list(workspaceId).catch(() => []) : [],
        workspaceId ? casesApi.stats(workspaceId).catch(() => null) : null,
    ]);

    return (
        <CasesShell
            workspaceId={workspaceId ?? null}
            workspaceRole={workspaceRole}
            initialCases={cases as any[]}
            initialStats={stats as any}
        />
    );
}