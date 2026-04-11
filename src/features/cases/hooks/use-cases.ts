"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeCasesClient } from "@/lib/api/cases.client";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Case, CaseStats, CaseUpdate } from "@/lib/types/case.types";

export const caseKeys = {
    all: ["cases"] as const,
    list: (workspaceId: string) => [...caseKeys.all, workspaceId, "list"] as const,
    stats: (workspaceId: string) => [...caseKeys.all, workspaceId, "stats"] as const,
    recent: (workspaceId: string) => [...caseKeys.all, workspaceId, "recent"] as const,
    detail: (workspaceId: string, caseId: string) =>
        [...caseKeys.all, workspaceId, caseId] as const,
};

export function useCases(initialData?: Case[]) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: caseKeys.list(activeWorkspaceId ?? ""),
        queryFn: () => makeCasesClient(token, activeWorkspaceId!).list(),
        enabled: !!activeWorkspaceId && !!token,
        // Seed the cache with server-fetched data so isLoading is false on first render
        initialData: initialData,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
}

export function useCaseStats(initialData?: CaseStats | null) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: caseKeys.stats(activeWorkspaceId ?? ""),
        queryFn: () => makeCasesClient(token, activeWorkspaceId!).stats(),
        enabled: !!activeWorkspaceId && !!token,
        initialData: initialData ?? undefined,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
}

export function useRecentCases(initialData?: any[]) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: caseKeys.recent(activeWorkspaceId ?? ""),
        queryFn: () => makeCasesClient(token, activeWorkspaceId!).recent(),
        enabled: !!activeWorkspaceId && !!token,
        initialData: initialData,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
}

export function useCase(caseId: string | undefined) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: caseKeys.detail(activeWorkspaceId ?? "", caseId ?? ""),
        queryFn: () => makeCasesClient(token, activeWorkspaceId!).get(caseId!),
        enabled: !!activeWorkspaceId && !!caseId && !!token,
    });
}

export function useCreateCase() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();
    // Case creation uses multipart — handled by server action, not clientFetch
    // This mutation just triggers cache invalidation after the action completes
    return useMutation({
        mutationFn: async (_: void) => { },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.stats(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.recent(activeWorkspaceId!) });
        },
    });
}

export function useUpdateCase() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: ({ caseId, data }: { caseId: string; data: CaseUpdate }) =>
            makeCasesClient(token, activeWorkspaceId!).update(caseId, data),
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
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (caseId: string) =>
            makeCasesClient(token, activeWorkspaceId!).delete(caseId),
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