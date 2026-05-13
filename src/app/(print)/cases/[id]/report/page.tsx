import { redirect, notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { casesApi } from "@/lib/api/cases.api";
import { patientsApi } from "@/lib/api/patients.api";
import { CaseReportPage } from "@/features/cases/components/case-report-page";

export default async function ReportPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { workspaceId, workspaceRole, activeWorkspace } = ctx;
    if (!workspaceId) redirect("/workspaces");

    const caseItem = await casesApi.get(id, workspaceId).catch(() => null);
    if (!caseItem) notFound();

    const patient = await patientsApi.get(caseItem.patient_id, workspaceId).catch(() => null);

    // Doctors can only view their assigned cases
    const membershipId = activeWorkspace?.id ?? null;
    const isDoctor = workspaceRole === "DOCTOR";
    if (isDoctor && caseItem.assigned_to_member_id !== membershipId) {
        redirect("/cases");
    }

    return <CaseReportPage caseItem={caseItem} patient={patient} />;
}
