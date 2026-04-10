import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { patientsApi } from "@/lib/api/patients.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { NewCaseShell } from "@/features/cases/components/new-case-shell";

export default async function NewCasePage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { workspaceId, workspaceRole } = ctx;

    if (workspaceRole !== "OWNER" && workspaceRole !== "ADMIN") {
        redirect("/cases");
    }

    if (!workspaceId) redirect("/workspaces");

    const [patients, members] = await Promise.all([
        patientsApi.list(workspaceId).catch(() => []),
        workspacesApi.listMembers(workspaceId).catch(() => []),
    ]);

    return (
        <NewCaseShell
            workspaceId={workspaceId}
            patients={patients as any[]}
            members={members as any[]}
        />
    );
}