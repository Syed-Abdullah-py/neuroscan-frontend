"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases.api";
import { useWorkspace } from "@/providers/workspace-provider";
import type { CaseUpdate } from "@/lib/types/case.types";

// ── Query keys ─────────────────────────────────────────────────────────────

export const caseKeys = {
    all: ["cases"] as const,
    list: (workspaceId: string) =>
        [...caseKeys.all, workspaceId, "list"] as const,
    stats: (workspaceId: string) =>
        [...caseKeys.all, workspaceId, "stats"] as const,
    recent: (workspaceId: string) =>
        [...caseKeys.all, workspaceId, "recent"] as const,
    detail: (workspaceId: string, caseId: string) =>
        [...caseKeys.all, workspaceId, caseId] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────

export function useCases() {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: caseKeys.list(activeWorkspaceId ?? ""),
        queryFn: () => casesApi.list(activeWorkspaceId!),
        enabled: !!activeWorkspaceId,
    });
}

export function useCaseStats() {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: caseKeys.stats(activeWorkspaceId ?? ""),
        queryFn: () => casesApi.stats(activeWorkspaceId!),
        enabled: !!activeWorkspaceId,
    });
}

export function useRecentCases() {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: caseKeys.recent(activeWorkspaceId ?? ""),
        queryFn: () => casesApi.recent(activeWorkspaceId!),
        enabled: !!activeWorkspaceId,
    });
}

export function useCase(caseId: string | undefined) {
    const { activeWorkspaceId } = useWorkspace();

    return useQuery({
        queryKey: caseKeys.detail(activeWorkspaceId ?? "", caseId ?? ""),
        queryFn: () => casesApi.get(caseId!, activeWorkspaceId!),
        enabled: !!activeWorkspaceId && !!caseId,
    });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useCreateCase() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: ({
            patientId,
            scans,
            options,
        }: {
            patientId: string;
            scans: File[];
            options?: {
                priority?: string;
                assignedToMemberId?: string;
                notes?: string;
            };
        }) => casesApi.create(patientId, scans, activeWorkspaceId!, options),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.stats(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.recent(activeWorkspaceId!) });
        },
    });
}

export function useUpdateCase() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: ({
            caseId,
            data,
        }: {
            caseId: string;
            data: CaseUpdate;
        }) => casesApi.update(caseId, data, activeWorkspaceId!),
        onSuccess: (updated) => {
            qc.invalidateQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.stats(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.recent(activeWorkspaceId!) });
            qc.setQueryData(
                caseKeys.detail(activeWorkspaceId!, updated.id),
                updated
            );
        },
    });
}

export function useDeleteCase() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (caseId: string) =>
            casesApi.delete(caseId, activeWorkspaceId!),
        onSuccess: (_, caseId) => {
            qc.invalidateQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.stats(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.recent(activeWorkspaceId!) });
            qc.removeQueries({
                queryKey: caseKeys.detail(activeWorkspaceId!, caseId),
            });
        },
    });
}