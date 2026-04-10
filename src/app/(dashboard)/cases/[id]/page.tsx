import { redirect, notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { casesApi } from "@/lib/api/cases.api";
import { CaseDetailShell } from "@/features/cases/components/case-detail-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function CaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { user, workspaceId, workspaceRole, activeWorkspace } = ctx;

    if (!workspaceId) redirect("/workspaces");

    const caseItem = await casesApi.get(id, workspaceId).catch(() => null);
    if (!caseItem) notFound();

    // membershipId is the workspace_members.id — used to check if doctor is assigned
    const membershipId = activeWorkspace?.id ?? null;

    const isDoctor = workspaceRole === "DOCTOR";
    const isAssigned =
        isDoctor && caseItem.assigned_to_member_id === membershipId;

    // Doctor can only see their assigned cases
    if (isDoctor && !isAssigned) redirect("/cases");

    return (
        <CaseDetailShell
            caseItem={caseItem}
            workspaceId={workspaceId}
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
            membershipId={membershipId}
            user={{
                name: user.name,
                email: user.email,
                globalRole: user.globalRole,
            }}
        />
    );
}