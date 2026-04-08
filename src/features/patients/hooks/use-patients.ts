"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { patientsApi } from "@/lib/api/patients.api";
import { useWorkspace } from "@/providers/workspace-provider";
import type { PatientCreate, PatientUpdate } from "@/lib/types/patient.types";

// ── Query keys ─────────────────────────────────────────────────────────────

export const patientKeys = {
    all: ["patients"] as const,
    list: (workspaceId: string) =>
        [...patientKeys.all, workspaceId, "list"] as const,
    detail: (workspaceId: string, patientId: string) =>
        [...patientKeys.all, workspaceId, patientId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function usePatients() {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: patientKeys.list(activeWorkspaceId ?? ""),
        queryFn: () => patientsApi.list(activeWorkspaceId!),
        enabled: !!activeWorkspaceId,
    });
}

export function usePatient(patientId: string | undefined) {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: patientKeys.detail(activeWorkspaceId ?? "", patientId ?? ""),
        queryFn: () => patientsApi.get(patientId!, activeWorkspaceId!),
        enabled: !!activeWorkspaceId && !!patientId,
    });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreatePatient() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (data: PatientCreate) =>
            patientsApi.create(data, activeWorkspaceId!),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: patientKeys.list(activeWorkspaceId!),
            });
        },
    });
}

export function useUpdatePatient() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: ({
            patientId,
            data,
        }: {
            patientId: string;
            data: PatientUpdate;
        }) => patientsApi.update(patientId, data, activeWorkspaceId!),
        onSuccess: (updated) => {
            // Update the list cache directly — no need to refetch
            qc.invalidateQueries({
                queryKey: patientKeys.list(activeWorkspaceId!),
            });
            // Also update the detail cache if it exists
            qc.setQueryData(
                patientKeys.detail(activeWorkspaceId!, updated.id),
                updated
            );
        },
    });
}

export function useDeletePatient() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (patientId: string) =>
            patientsApi.delete(patientId, activeWorkspaceId!),
        onSuccess: (_, patientId) => {
            qc.invalidateQueries({
                queryKey: patientKeys.list(activeWorkspaceId!),
            });
            qc.removeQueries({
                queryKey: patientKeys.detail(activeWorkspaceId!, patientId),
            });
        },
    });
}