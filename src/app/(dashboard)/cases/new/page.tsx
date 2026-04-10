import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { patientsApi } from "@/lib/api/patients.api";
import { NewCaseShell } from "@/features/cases/components/new-case-shell";

export default async function NewCasePage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceRole = activeWorkspace?.role ?? null;
    const workspaceId = activeWorkspace?.workspace_id;

    if (workspaceRole !== "OWNER" && workspaceRole !== "ADMIN") {
        redirect("/cases");
    }

    const [patients, members] = await Promise.all([
        workspaceId ? patientsApi.list(workspaceId).catch(() => []) : [],
        workspaceId ? workspacesApi.listMembers(workspaceId).catch(() => []) : [],
    ]);

    return (
        <NewCaseShell
            workspaceId={workspaceId!}
            patients={patients as any[]}
            members={members as any[]}
        />
    );
}