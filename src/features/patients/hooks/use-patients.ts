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
        refetchInterval: 2000,
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
            qc.setQueryData<Patient[]>(
                patientKeys.list(activeWorkspaceId!),
                (old = []) => old.map((p) => (p.id === updated.id ? updated : p))
            );
            qc.setQueryData(patientKeys.detail(activeWorkspaceId!, updated.id), updated);
        },
    });
}

export function useDeletePatient() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (patientId: string) =>
            makePatientsClient(token, activeWorkspaceId!).delete(patientId),
        onMutate: async (patientId) => {
            await qc.cancelQueries({ queryKey: patientKeys.list(activeWorkspaceId!) });
            const previous = qc.getQueryData<Patient[]>(patientKeys.list(activeWorkspaceId!));
            qc.setQueryData<Patient[]>(
                patientKeys.list(activeWorkspaceId!),
                (old = []) => old.filter((p) => p.id !== patientId)
            );
            return { previous };
        },
        onError: (_err, _patientId, context) => {
            if (context?.previous) {
                qc.setQueryData(patientKeys.list(activeWorkspaceId!), context.previous);
            }
        },
        onSuccess: (_, patientId) => {
            qc.removeQueries({ queryKey: patientKeys.detail(activeWorkspaceId!, patientId) });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: patientKeys.list(activeWorkspaceId!) });
        },
    });
}