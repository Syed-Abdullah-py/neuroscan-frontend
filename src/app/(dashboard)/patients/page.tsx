import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { patientsApi } from "@/lib/api/patients.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { PatientsShell } from "@/features/patients/components/patients-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function PatientsPage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { workspaceId, workspaceRole } = ctx;

    const [patients, members] = await Promise.all([
        workspaceId
            ? patientsApi.list(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId
            ? workspacesApi.listMembers(workspaceId).catch(() => [])
            : Promise.resolve([]),
    ]);

    return (
        <PatientsShell
            workspaceId={workspaceId ?? null}
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
            initialPatients={patients as any[]}
            initialMembers={members as any[]}
        />
    );
}