import { apiFetch } from "@/lib/api/client";
import type {
    Patient,
    PatientCreate,
    PatientUpdate,
} from "@/lib/types/patient.types";

export const patientsApi = {
    /** GET /patients/ */
    list(workspaceId: string): Promise<Patient[]> {
        return apiFetch<Patient[]>("/patients/", { workspaceId });
    },

    /** POST /patients/ - OWNER/ADMIN only */
    create(data: PatientCreate, workspaceId: string): Promise<Patient> {
        return apiFetch<Patient>("/patients/", {
            method: "POST",
            body: data,
            workspaceId,
        });
    },

    /** GET /patients/{id} */
    get(patientId: string, workspaceId: string): Promise<Patient> {
        return apiFetch<Patient>(`/patients/${patientId}`, { workspaceId });
    },

    /** PUT /patients/{id} - OWNER/ADMIN only */
    update(
        patientId: string,
        data: PatientUpdate,
        workspaceId: string
    ): Promise<Patient> {
        return apiFetch<Patient>(`/patients/${patientId}`, {
            method: "PUT",
            body: data,
            workspaceId,
        });
    },

    /** DELETE /patients/{id} - OWNER/ADMIN only */
    delete(patientId: string, workspaceId: string): Promise<void> {
        return apiFetch<void>(`/patients/${patientId}`, {
            method: "DELETE",
            workspaceId,
        });
    },
};