export type GlobalRole = "ADMIN" | "RADIOLOGIST";

/** Returned by GET /auth/me */
export interface User {
    id: string;
    email: string;
    name: string | null;
    global_role: GlobalRole | null;
    avatar_url: string | null;
    is_verified: boolean;
}

/** Returned by POST /auth/login and POST /auth/verify-otp */
export interface TokenResponse {
    access_token: string;
    token_type: "bearer";
    user_id: string;
    email: string;
    name: string | null;
    global_role: GlobalRole | null;
}

/** Returned by POST /auth/register */
export interface RegisterResponse {
    id: string;
    email: string;
    name: string | null;
    global_role: GlobalRole | null;
    message: string;
}

/**
 * Frontend-only session user — decoded from the JWT cookie.
 * Never returned by the API directly.
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    globalRole: GlobalRole;
    /** First letter of name/email, used as avatar fallback */
    avatar: string;
    /** Currently active workspace ID, from active_workspace cookie */
    workspaceId?: string;
}