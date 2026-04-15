"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeWorkspacesClient } from "@/lib/api/workspaces.client";
import { useWorkspace } from "@/providers/workspace-provider";

export const workspaceKeys = {
    all: ["workspaces"] as const,
    lists: () => [...workspaceKeys.all, "list"] as const,
    members: (id: string) => [...workspaceKeys.all, id, "members"] as const,
    invitations: (id: string) => [...workspaceKeys.all, id, "invitations"] as const,
    myInvitations: () => [...workspaceKeys.all, "my-invitations"] as const,
    joinRequests: (id: string) => [...workspaceKeys.all, id, "join-requests"] as const,
    discover: () => [...workspaceKeys.all, "discover"] as const,
};

function useApi() {
    const { token, activeWorkspaceId } = useWorkspace();
    return makeWorkspacesClient(token, activeWorkspaceId);
}

export function useWorkspaces() {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.lists(),
        queryFn: () => makeWorkspacesClient(token).list(),
        enabled: !!token,
    });
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.members(workspaceId ?? ""),
        queryFn: () => makeWorkspacesClient(token).listMembers(workspaceId!),
        enabled: !!workspaceId && !!token,
    });
}

export function useRemoveMember() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            makeWorkspacesClient(token).removeMember(activeWorkspaceId!, userId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.members(activeWorkspaceId!) });
        },
    });
}

export function useCreateWorkspace() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: (name: string) => makeWorkspacesClient(token).create(name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useUpdateWorkspace() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: ({ workspaceId, name }: { workspaceId: string; name: string }) =>
            makeWorkspacesClient(token).update(workspaceId, name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useDeleteWorkspace() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: (workspaceId: string) =>
            makeWorkspacesClient(token).delete(workspaceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useWorkspaceInvitations(workspaceId: string | undefined) {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.invitations(workspaceId ?? ""),
        queryFn: () => makeWorkspacesClient(token).listInvitations(workspaceId!),
        enabled: !!workspaceId && !!token,
    });
}

export function useMyInvitations() {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.myInvitations(),
        queryFn: () => makeWorkspacesClient(token).myInvitations(),
        enabled: !!token,
        refetchInterval: 3_000,
    });
}

export function useInviteMember() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (email: string) =>
            makeWorkspacesClient(token).invite(activeWorkspaceId!, email),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.invitations(activeWorkspaceId!) });
        },
    });
}

export function useAcceptInvitation() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: (invitationId: string) =>
            makeWorkspacesClient(token).acceptInvitation(invitationId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.myInvitations() });
            qc.invalidateQueries({ queryKey: workspaceKeys.lists() });
        },
    });
}

export function useRejectInvitation() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: (invitationId: string) =>
            makeWorkspacesClient(token).rejectInvitation(invitationId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.myInvitations() });
        },
    });
}

export function useJoinRequests(workspaceId: string | undefined, initialData?: any[]) {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.joinRequests(workspaceId ?? ""),
        queryFn: () => makeWorkspacesClient(token).listJoinRequests(workspaceId!),
        enabled: !!workspaceId && !!token,
        initialData: initialData,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });
}

export function useApproveJoinRequest() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (requestId: string) =>
            makeWorkspacesClient(token).approveJoinRequest(requestId, activeWorkspaceId!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.joinRequests(activeWorkspaceId!) });
            qc.invalidateQueries({ queryKey: workspaceKeys.members(activeWorkspaceId!) });
        },
    });
}

export function useRejectJoinRequest() {
    const qc = useQueryClient();
    const { token, activeWorkspaceId } = useWorkspace();
    return useMutation({
        mutationFn: (requestId: string) =>
            makeWorkspacesClient(token).rejectJoinRequest(requestId, activeWorkspaceId!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.joinRequests(activeWorkspaceId!) });
        },
    });
}

export function useRequestJoin() {
    const qc = useQueryClient();
    const { token } = useWorkspace();
    return useMutation({
        mutationFn: (workspaceId: string) =>
            makeWorkspacesClient(token).requestJoin(workspaceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: workspaceKeys.discover() });
        },
    });
}

export function useDiscoverWorkspaces() {
    const { token } = useWorkspace();
    return useQuery({
        queryKey: workspaceKeys.discover(),
        queryFn: () => makeWorkspacesClient(token).discover(),
        enabled: !!token,
    });
}