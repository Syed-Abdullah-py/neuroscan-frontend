import { clientFetch } from "./client-fetch";
import type { Patient, PatientCreate, PatientUpdate } from "@/lib/types/patient.types";

export function makePatientsClient(token: string, workspaceId: string) {
    return {
        list: () =>
            clientFetch<Patient[]>("/patients/", { token, workspaceId }),

        get: (patientId: string) =>
            clientFetch<Patient>(`/patients/${patientId}`, { token, workspaceId }),

        create: (data: PatientCreate) =>
            clientFetch<Patient>("/patients/", {
                token,
                workspaceId,
                method: "POST",
                body: data,
            }),

        update: (patientId: string, data: PatientUpdate) =>
            clientFetch<Patient>(`/patients/${patientId}`, {
                token,
                workspaceId,
                method: "PUT",
                body: data,
            }),

        delete: (patientId: string) =>
            clientFetch<void>(`/patients/${patientId}`, {
                token,
                workspaceId,
                method: "DELETE",
            }),
    };
}