"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makePatientsClient } from "@/lib/api/patients.client";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Patient, PatientCreate, PatientUpdate } from "@/lib/types/patient.types";

export const patientKeys = {
    all: ["patients"] as const,
    list: (workspaceId: string) => [...patientKeys.all, workspaceId, "list"] as const,
    detail: (workspaceId: string, patientId: string) =>
        [...patientKeys.all, workspaceId, patientId] as const,
};

export function usePatients(initialData?: Patient[]) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: patientKeys.list(activeWorkspaceId ?? ""),
        queryFn: () => makePatientsClient(token, activeWorkspaceId!).list(),
        enabled: !!activeWorkspaceId && !!token,
        initialData: initialData,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
}

export function usePatient(patientId: string | undefined) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: patientKeys.detail(activeWorkspaceId ?? "", patientId ?? ""),
        queryFn: () =>
            makePatientsClient(token, activeWorkspaceId!).get(patientId!),
        enabled: !!activeWorkspaceId && !!patientId && !!token,
    });
}

export function useCreatePatient() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (data: PatientCreate) =>
            makePatientsClient(token, activeWorkspaceId!).create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: patientKeys.list(activeWorkspaceId!) });
        },
    });
}

export function useUpdatePatient() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: PatientUpdate }) =>
            makePatientsClient(token, activeWorkspaceId!).update(patientId, data),
        onSuccess: (updated) => {
            qc.invalidateQueries({ queryKey: patientKeys.list(activeWorkspaceId!) });
            qc.setQueryData(
                patientKeys.detail(activeWorkspaceId!, updated.id),
                updated
            );
        },
    });
}

export function useDeletePatient() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (patientId: string) =>
            makePatientsClient(token, activeWorkspaceId!).delete(patientId),
        onSuccess: (_, patientId) => {
            qc.invalidateQueries({ queryKey: patientKeys.list(activeWorkspaceId!) });
            qc.removeQueries({
                queryKey: patientKeys.detail(activeWorkspaceId!, patientId),
            });
        },
    });
}