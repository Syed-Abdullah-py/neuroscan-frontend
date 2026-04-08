import { clientFetch } from "./client-fetch";
import type {
    Workspace,
    WorkspaceMembership,
    WorkspaceMember,
    Invitation,
    JoinRequest,
} from "@/lib/types/workspace.types";

export function makeWorkspacesClient(token: string, workspaceId?: string) {
    const f = <T>(path: string, init?: Omit<Parameters<typeof clientFetch>[1], "token" | "workspaceId">) =>
        clientFetch<T>(path, { token, workspaceId, ...init });

    return {
        list: () =>
            clientFetch<WorkspaceMembership[]>("/workspaces/", { token }),

        create: (name: string) =>
            clientFetch<Workspace>("/workspaces/", {
                token,
                method: "POST",
                body: { name },
            }),

        update: (wsId: string, name: string) =>
            clientFetch<Workspace>(`/workspaces/${wsId}`, {
                token,
                workspaceId: wsId,
                method: "PUT",
                body: { name },
            }),

        delete: (wsId: string) =>
            clientFetch<void>(`/workspaces/${wsId}`, {
                token,
                workspaceId: wsId,
                method: "DELETE",
            }),

        discover: () =>
            clientFetch<Workspace[]>("/workspaces/discover", { token }),

        listMembers: (wsId: string) =>
            clientFetch<WorkspaceMember[]>(`/workspaces/${wsId}/members`, {
                token,
                workspaceId: wsId,
            }),

        removeMember: (wsId: string, userId: string) =>
            clientFetch<void>(`/workspaces/${wsId}/members/${userId}`, {
                token,
                workspaceId: wsId,
                method: "DELETE",
            }),

        invite: (wsId: string, email: string) =>
            clientFetch<Invitation>(`/workspaces/${wsId}/invitations`, {
                token,
                workspaceId: wsId,
                method: "POST",
                body: { email },
            }),

        listInvitations: (wsId: string) =>
            clientFetch<Invitation[]>(`/workspaces/${wsId}/invitations`, {
                token,
                workspaceId: wsId,
            }),

        myInvitations: () =>
            clientFetch<Invitation[]>("/workspaces/invitations/mine", { token }),

        acceptInvitation: (id: string) =>
            clientFetch<{ message: string }>(
                `/workspaces/invitations/${id}/accept`,
                { token, method: "POST" }
            ),

        rejectInvitation: (id: string) =>
            clientFetch<{ message: string }>(
                `/workspaces/invitations/${id}/reject`,
                { token, method: "POST" }
            ),

        requestJoin: (wsId: string) =>
            clientFetch<JoinRequest>(`/workspaces/${wsId}/join-requests`, {
                token,
                method: "POST",
            }),

        listJoinRequests: (wsId: string) =>
            clientFetch<JoinRequest[]>(`/workspaces/${wsId}/join-requests`, {
                token,
                workspaceId: wsId,
            }),

        approveJoinRequest: (requestId: string, wsId: string) =>
            clientFetch<{ message: string }>(
                `/workspaces/join-requests/${requestId}/approve`,
                { token, workspaceId: wsId, method: "POST" }
            ),

        rejectJoinRequest: (requestId: string, wsId: string) =>
            clientFetch<{ message: string }>(
                `/workspaces/join-requests/${requestId}/reject`,
                { token, workspaceId: wsId, method: "POST" }
            ),
    };
}