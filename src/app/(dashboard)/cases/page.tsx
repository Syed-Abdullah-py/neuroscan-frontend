import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { casesApi } from "@/lib/api/cases.api";
import { CasesShell } from "@/features/cases/components/cases-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function CasesPage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { workspaceId, workspaceRole } = ctx;

    const [cases, stats] = await Promise.all([
        workspaceId
            ? casesApi.list(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId
            ? casesApi.stats(workspaceId).catch(() => null)
            : Promise.resolve(null),
    ]);

    return (
        <CasesShell
            workspaceId={workspaceId ?? null}
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
            initialCases={cases as any[]}
            initialStats={stats as any}
        />
    );
}