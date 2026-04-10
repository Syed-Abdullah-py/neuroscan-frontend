import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { patientsApi } from "@/lib/api/patients.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { PatientsShell } from "@/features/patients/components/patients-shell";

export default async function PatientsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;
    const workspaceRole = activeWorkspace?.role ?? null;

    const patients = workspaceId
        ? await patientsApi.list(workspaceId).catch(() => [])
        : [];

    // Fetch members for the "assign case" dropdown — needed in create case wizard
    const members = workspaceId
        ? await workspacesApi.listMembers(workspaceId).catch(() => [])
        : [];

    return (
        <PatientsShell
            workspaceId={workspaceId ?? null}
            workspaceRole={workspaceRole}
            initialPatients={patients as any[]}
            initialMembers={members as any[]}
        />
    );
}