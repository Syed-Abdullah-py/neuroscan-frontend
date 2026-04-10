import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { NewPatientShell } from "@/features/patients/components/new-patient-shell";

export default async function NewPatientPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceRole = activeWorkspace?.role ?? null;

    // Only OWNER/ADMIN can create patients
    if (workspaceRole !== "OWNER" && workspaceRole !== "ADMIN") {
        redirect("/patients");
    }

    return <NewPatientShell workspaceRole={workspaceRole} />;
}