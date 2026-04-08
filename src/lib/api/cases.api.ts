import { apiFetch, apiUpload } from "@/lib/api/client";
import type {
    Case,
    CaseStats,
    CaseUpdate,
} from "@/lib/types/case.types";

export const casesApi = {
    /** GET /cases/ — OWNER/ADMIN sees all; DOCTOR sees assigned only */
    list(workspaceId: string): Promise<Case[]> {
        return apiFetch<Case[]>("/cases/", { workspaceId });
    },

    /** GET /cases/stats */
    stats(workspaceId: string): Promise<CaseStats> {
        return apiFetch<CaseStats>("/cases/stats", { workspaceId });
    },

    /** GET /cases/recent — last 5 cases */
    recent(workspaceId: string): Promise<Case[]> {
        return apiFetch<Case[]>("/cases/recent", { workspaceId });
    },

    /** GET /cases/{id} */
    get(caseId: string, workspaceId: string): Promise<Case> {
        return apiFetch<Case>(`/cases/${caseId}`, { workspaceId });
    },

    /**
     * POST /cases/ — multipart/form-data
     * Sends exactly 4 MRI scan files plus case metadata.
     * Allowed file types: .nii, .nii.gz, .dcm, .nrrd, .mha, .mhd
     * Max size per file: 500MB
     */
    create(
        patientId: string,
        scans: File[],
        workspaceId: string,
        options: {
            priority?: string;
            assignedToMemberId?: string;
            notes?: string;
        } = {}
    ): Promise<Case> {
        const formData = new FormData();
        formData.append("patient_id", patientId);

        if (options.priority) formData.append("priority", options.priority);
        if (options.assignedToMemberId)
            formData.append("assigned_to_member_id", options.assignedToMemberId);
        if (options.notes) formData.append("notes", options.notes);

        // Backend expects exactly 4 files under the key "scans"
        scans.forEach((file) => formData.append("scans", file));

        return apiUpload<Case>("/cases/", formData, workspaceId);
    },

    /** PUT /cases/{id} */
    update(
        caseId: string,
        data: CaseUpdate,
        workspaceId: string
    ): Promise<Case> {
        return apiFetch<Case>(`/cases/${caseId}`, {
            method: "PUT",
            body: data,
            workspaceId,
        });
    },

    /** DELETE /cases/{id} — OWNER/ADMIN only */
    delete(caseId: string, workspaceId: string): Promise<void> {
        return apiFetch<void>(`/cases/${caseId}`, {
            method: "DELETE",
            workspaceId,
        });
    },
};