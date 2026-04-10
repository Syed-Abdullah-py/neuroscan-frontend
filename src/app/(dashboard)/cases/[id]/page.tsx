import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { casesApi } from "@/lib/api/cases.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { CaseDetailShell } from "@/features/cases/components/case-detail-shell";

export default async function CaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;
    const workspaceRole = activeWorkspace?.role ?? null;
    const membershipId = activeWorkspace?.id;

    if (!workspaceId) redirect("/workspaces");

    const caseItem = await casesApi.get(id, workspaceId).catch(() => null);
    if (!caseItem) notFound();

    const isDoctor = workspaceRole === "DOCTOR";
    const isAssigned = isDoctor && caseItem.assigned_to_member_id === membershipId;

    if (isDoctor && !isAssigned) redirect("/cases");

    return (
        <CaseDetailShell
            caseItem={caseItem}
            workspaceId={workspaceId}
            workspaceRole={workspaceRole}
            membershipId={membershipId ?? null}
            user={{ name: user.name, email: user.email, globalRole: user.globalRole }}
        />
    );
}