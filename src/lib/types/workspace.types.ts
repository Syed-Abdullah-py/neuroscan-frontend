export type WorkspaceRole = "OWNER" | "ADMIN" | "DOCTOR";

/** Returned by POST /workspaces/ and GET /workspaces/discover */
export interface Workspace {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    created_at: string;
}

/**
 * One item from GET /workspaces/
 * Represents the current user's membership in a workspace.
 */
export interface WorkspaceMembership {
    id: string;            // membership UUID
    workspace_id: string;
    workspace_name: string;
    role: WorkspaceRole;
    joined_at: string;
    /** Frontend-enriched: true if this is the active workspace */
    active?: boolean;
}

/**
 * One item from GET /workspaces/{id}/members
 * Represents any member of a workspace, with user details.
 */
export interface WorkspaceMember {
    id: string;            // membership UUID
    workspace_id: string;
    role: WorkspaceRole;
    joined_at: string;
    workspace_name: string | null;
    user_id: string | null;
    user_name: string | null;
    user_email: string | null;
    user_avatar_url: string | null;
}

/** Returned by POST /workspaces/{id}/invitations */
export interface Invitation {
    id: string;
    email: string;
    workspace_id: string;
    workspace_name: string | null;
    expires_at: string;
}

/**
 * Returned by GET /workspaces/{id}/join-requests
 * and POST /workspaces/{id}/join-requests
 */
export interface JoinRequest {
    id: string;
    workspace_id: string;
    workspace_name: string | null;
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    created_at: string;
}

/** SSE event from GET /workspaces/{id}/events (via /api/events proxy) */
export interface WorkspaceSSEEvent {
    type:
    | "member.invited"
    | "member.joined"
    | "member.removed"
    | "patient.created"
    | "case.created"
    | "case.updated";
    payload: Record<string, unknown>;
}