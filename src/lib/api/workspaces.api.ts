import { apiFetch } from "@/lib/api/client";
import type {
    Workspace,
    WorkspaceMembership,
    WorkspaceMember,
    Invitation,
    JoinRequest,
} from "@/lib/types/workspace.types";

export const workspacesApi = {
    // ── Workspace CRUD ───────────────────────────────────────────────────────

    /** GET /workspaces/ - list caller's memberships */
    list(): Promise<WorkspaceMembership[]> {
        return apiFetch<WorkspaceMembership[]>("/workspaces/", {
            noWorkspace: true,
        });
    },

    /** POST /workspaces/ - Global ADMIN only */
    create(name: string): Promise<Workspace> {
        return apiFetch<Workspace>("/workspaces/", {
            method: "POST",
            body: { name },
            noWorkspace: true,
        });
    },

    /** PUT /workspaces/{id} - OWNER only */
    update(workspaceId: string, name: string): Promise<Workspace> {
        return apiFetch<Workspace>(`/workspaces/${workspaceId}`, {
            method: "PUT",
            body: { name },
            workspaceId,
        });
    },

    /** DELETE /workspaces/{id} - OWNER only */
    delete(workspaceId: string): Promise<void> {
        return apiFetch<void>(`/workspaces/${workspaceId}`, {
            method: "DELETE",
            workspaceId,
        });
    },

    /** GET /workspaces/discover - workspaces the caller hasn't joined */
    discover(): Promise<Workspace[]> {
        return apiFetch<Workspace[]>("/workspaces/discover", {
            noWorkspace: true,
        });
    },

    // ── Members ──────────────────────────────────────────────────────────────

    /** GET /workspaces/{id}/members */
    listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
        return apiFetch<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`, {
            workspaceId,
        });
    },

    /** DELETE /workspaces/{id}/members/{userId} */
    removeMember(workspaceId: string, userId: string): Promise<void> {
        return apiFetch<void>(`/workspaces/${workspaceId}/members/${userId}`, {
            method: "DELETE",
            workspaceId,
        });
    },

    // ── Invitations ──────────────────────────────────────────────────────────

    /** POST /workspaces/{id}/invitations */
    invite(workspaceId: string, email: string): Promise<Invitation> {
        return apiFetch<Invitation>(`/workspaces/${workspaceId}/invitations`, {
            method: "POST",
            body: { email },
            workspaceId,
        });
    },

    /** GET /workspaces/{id}/invitations - OWNER/ADMIN only */
    listInvitations(workspaceId: string): Promise<Invitation[]> {
        return apiFetch<Invitation[]>(`/workspaces/${workspaceId}/invitations`, {
            workspaceId,
        });
    },

    /** GET /workspaces/invitations/mine */
    myInvitations(): Promise<Invitation[]> {
        return apiFetch<Invitation[]>("/workspaces/invitations/mine", {
            noWorkspace: true,
        });
    },

    /** POST /workspaces/invitations/{id}/accept */
    acceptInvitation(invitationId: string): Promise<{ message: string }> {
        return apiFetch<{ message: string }>(
            `/workspaces/invitations/${invitationId}/accept`,
            {
                method: "POST",
                noWorkspace: true,
            }
        );
    },

    /** POST /workspaces/invitations/{id}/reject */
    rejectInvitation(invitationId: string): Promise<{ message: string }> {
        return apiFetch<{ message: string }>(
            `/workspaces/invitations/${invitationId}/reject`,
            {
                method: "POST",
                noWorkspace: true,
            }
        );
    },

    // ── Join Requests ────────────────────────────────────────────────────────

    /** POST /workspaces/{id}/join-requests */
    requestJoin(workspaceId: string): Promise<JoinRequest> {
        return apiFetch<JoinRequest>(`/workspaces/${workspaceId}/join-requests`, {
            method: "POST",
            noWorkspace: true,
        });
    },

    /** GET /workspaces/{id}/join-requests - OWNER/ADMIN only */
    listJoinRequests(workspaceId: string): Promise<JoinRequest[]> {
        return apiFetch<JoinRequest[]>(
            `/workspaces/${workspaceId}/join-requests`,
            { workspaceId }
        );
    },

    /** POST /workspaces/join-requests/{id}/approve */
    approveJoinRequest(
        requestId: string,
        workspaceId: string
    ): Promise<{ message: string }> {
        return apiFetch<{ message: string }>(
            `/workspaces/join-requests/${requestId}/approve`,
            {
                method: "POST",
                workspaceId,
            }
        );
    },

    /** POST /workspaces/join-requests/{id}/reject */
    rejectJoinRequest(
        requestId: string,
        workspaceId: string
    ): Promise<{ message: string }> {
        return apiFetch<{ message: string }>(
            `/workspaces/join-requests/${requestId}/reject`,
            {
                method: "POST",
                workspaceId,
            }
        );
    },
};