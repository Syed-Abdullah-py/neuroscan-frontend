import { clientFetch } from "./client-fetch";
import type { Case, CaseStats, CaseUpdate } from "@/lib/types/case.types";

export function makeCasesClient(token: string, workspaceId: string) {
    return {
        list: () =>
            clientFetch<Case[]>("/cases/", { token, workspaceId }),

        stats: () =>
            clientFetch<CaseStats>("/cases/stats", { token, workspaceId }),

        recent: () =>
            clientFetch<Case[]>("/cases/recent", { token, workspaceId }),

        get: (caseId: string) =>
            clientFetch<Case>(`/cases/${caseId}`, { token, workspaceId }),

        update: (caseId: string, data: CaseUpdate) =>
            clientFetch<Case>(`/cases/${caseId}`, {
                token,
                workspaceId,
                method: "PUT",
                body: data,
            }),

        delete: (caseId: string) =>
            clientFetch<void>(`/cases/${caseId}`, {
                token,
                workspaceId,
                method: "DELETE",
            }),
    };
}