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
        refetchInterval: 2000,
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
        refetchInterval: 2000,
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
        refetchInterval: 2000,
    });
}

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useCase(caseId: string | undefined, initialData?: Case) {
    const { token, activeWorkspaceId } = useWorkspace();
    return useQuery({
        queryKey: caseKeys.detail(activeWorkspaceId ?? "", caseId ?? ""),
        queryFn: () => makeCasesClient(token, activeWorkspaceId!).get(caseId!),
        enabled: !!activeWorkspaceId && !!caseId && !!token,
        initialData,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
        staleTime: THIRTY_MINUTES,
        gcTime: THIRTY_MINUTES,
    });
}

export function useCreateCase() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();
    // Case creation uses multipart - handled by server action, not clientFetch
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
        onMutate: async (caseId) => {
            // Cancel any in-flight list GET so it can't land and restore the deleted row.
            await qc.cancelQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
            const previous = qc.getQueryData<Case[]>(caseKeys.list(activeWorkspaceId!));
            qc.setQueryData<Case[]>(
                caseKeys.list(activeWorkspaceId!),
                (old = []) => old.filter((c) => c.id !== caseId)
            );
            return { previous };
        },
        onError: (_err, _caseId, context) => {
            // Roll back if the DELETE itself failed.
            if (context?.previous) {
                qc.setQueryData(caseKeys.list(activeWorkspaceId!), context.previous);
            }
        },
        onSuccess: (_, caseId) => {
            qc.removeQueries({ queryKey: caseKeys.detail(activeWorkspaceId!, caseId) });
            qc.invalidateQueries({ queryKey: caseKeys.stats(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: caseKeys.recent(activeWorkspaceId!) });
        },
        onSettled: () => {
            // Re-sync the list with the server after the mutation completes.
            qc.invalidateQueries({ queryKey: caseKeys.list(activeWorkspaceId!) });
        },
    });
}