import { apiFetch } from "@/lib/api/client";
import type {
    User,
    TokenResponse,
    RegisterResponse,
} from "@/lib/types/auth.types";

export const authApi = {
    /** GET /auth/me */
    me(): Promise<User> {
        return apiFetch<User>("/auth/me", { noWorkspace: true });
    },

    /** POST /auth/login */
    login(email: string, password: string): Promise<TokenResponse> {
        return apiFetch<TokenResponse>("/auth/login", {
            method: "POST",
            body: { email, password },
            noAuth: true,
            noWorkspace: true,
        });
    },

    /** POST /auth/register */
    register(
        email: string,
        password: string,
        name: string,
        global_role: "ADMIN" | "RADIOLOGIST"
    ): Promise<RegisterResponse> {
        return apiFetch<RegisterResponse>("/auth/register", {
            method: "POST",
            body: { email, password, name, global_role },
            noAuth: true,
            noWorkspace: true,
        });
    },

    /** POST /auth/verify-otp */
    verifyOtp(email: string, otp: string): Promise<TokenResponse> {
        return apiFetch<TokenResponse>("/auth/verify-otp", {
            method: "POST",
            body: { email, otp },
            noAuth: true,
            noWorkspace: true,
        });
    },

    /** POST /auth/resend-otp */
    resendOtp(email: string): Promise<{ message: string }> {
        return apiFetch<{ message: string }>("/auth/resend-otp", {
            method: "POST",
            body: { email },
            noAuth: true,
            noWorkspace: true,
        });
    },

    /** POST /auth/google — verify Google id_token and sign in or create account */
    googleAuth(
        id_token: string,
        global_role?: "ADMIN" | "RADIOLOGIST"
    ): Promise<TokenResponse> {
        return apiFetch<TokenResponse>("/auth/google", {
            method: "POST",
            body: { id_token, global_role },
            noAuth: true,
            noWorkspace: true,
        });
    },
};