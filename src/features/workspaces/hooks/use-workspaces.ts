"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { useWorkspace } from "@/providers/workspace-provider";
import type {
    WorkspaceMembership,
    WorkspaceMember,
    Invitation,
    JoinRequest,
    Workspace,
} from "@/lib/types/workspace.types";

// ── Query keys ─────────────────────────────────────────────────────────────
// Centralised here so invalidations are consistent across the app

export const workspaceKeys = {
    all: ["workspaces"] as const,
    lists: () => [...workspaceKeys.all, "list"] as const,
    members: (id: string) => [...workspaceKeys.all, id, "members"] as const,
    invitations: (id: string) =>
        [...workspaceKeys.all, id, "invitations"] as const,
    myInvitations: () => [...workspaceKeys.all, "my-invitations"] as const,
    joinRequests: (id: string) =>
        [...workspaceKeys.all, id, "join-requests"] as const,
    discover: () => [...workspaceKeys.all, "discover"] as const,
};

// ── Workspace list ─────────────────────────────────────────────────────────

export function useWorkspaces() {
    return useQuery({
        queryKey: workspaceKeys.lists(),
        queryFn: () => workspacesApi.list(),
    });
}

// ── Members ────────────────────────────────────────────────────────────────

export function useWorkspaceMembers(workspaceId: string | undefined) {
    return useQuery({
        queryKey: workspaceKeys.members(workspaceId ?? ""),
        queryFn: () => workspacesApi.listMembers(workspaceId!),
        enabled: !!workspaceId,
    });
}

export function useRemoveMember() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            workspacesApi.removeMember(activeWorkspaceId!, userId),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: workspaceKeys.members(activeWorkspaceId!),
            });
        },
    });
}

// ── Create / Update / Delete workspace ────────────────────────────────────

export function useCreateWorkspace() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => workspacesApi.create(name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useUpdateWorkspace() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({
            workspaceId,
            name,
        }: {
            workspaceId: string;
            name: string;
        }) => workspacesApi.update(workspaceId, name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useDeleteWorkspace() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: string) => workspacesApi.delete(workspaceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

// ── Invitations ────────────────────────────────────────────────────────────

export function useWorkspaceInvitations(workspaceId: string | undefined) {
    return useQuery({
        queryKey: workspaceKeys.invitations(workspaceId ?? ""),
        queryFn: () => workspacesApi.listInvitations(workspaceId!),
        enabled: !!workspaceId,
    });
}

export function useMyInvitations() {
    return useQuery({
        queryKey: workspaceKeys.myInvitations(),
        queryFn: () => workspacesApi.myInvitations(),
    });
}

export function useInviteMember() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (email: string) =>
            workspacesApi.invite(activeWorkspaceId!, email),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: workspaceKeys.invitations(activeWorkspaceId!),
            });
        },
    });
}

export function useAcceptInvitation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) =>
            workspacesApi.acceptInvitation(invitationId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.myInvitations() });
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useRejectInvitation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) =>
            workspacesApi.rejectInvitation(invitationId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.myInvitations() });
        },
    });
}

// ── Join requests ──────────────────────────────────────────────────────────

export function useJoinRequests(workspaceId: string | undefined) {
    return useQuery({
        queryKey: workspaceKeys.joinRequests(workspaceId ?? ""),
        queryFn: () => workspacesApi.listJoinRequests(workspaceId!),
        enabled: !!workspaceId,
    });
}

export function useApproveJoinRequest() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (requestId: string) =>
            workspacesApi.approveJoinRequest(requestId, activeWorkspaceId!),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: workspaceKeys.joinRequests(activeWorkspaceId!),
            });
            qc.invalidateQueries({
                queryKey: workspaceKeys.members(activeWorkspaceId!),
            });
        },
    });
}

export function useRejectJoinRequest() {
    const qc = useQueryClient();
    const { activeWorkspaceId } = useWorkspace();

    return useMutation({
        mutationFn: (requestId: string) =>
            workspacesApi.rejectJoinRequest(requestId, activeWorkspaceId!),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: workspaceKeys.joinRequests(activeWorkspaceId!),
            });
        },
    });
}

export function useRequestJoin() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: string) =>
            workspacesApi.requestJoin(workspaceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.discover() });
        },
    });
}

export function useDiscoverWorkspaces() {
    return useQuery({
        queryKey: workspaceKeys.discover(),
        queryFn: () => workspacesApi.discover(),
    });
}