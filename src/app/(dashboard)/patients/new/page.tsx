import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { NewPatientShell } from "@/features/patients/components/new-patient-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function NewPatientPage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { workspaceRole } = ctx;

    if (workspaceRole !== "OWNER" && workspaceRole !== "ADMIN") {
        redirect("/patients");
    }

    return (
        <NewPatientShell
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
        />
    );
}