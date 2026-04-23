"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { ApiError } from "@/lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type SignupState = {
    message: string;
    errors?: Record<string, string[]>;
    success?: boolean;
    step?: number;
    email?: string;
    timestamp?: number;
};

export type LoginState = {
    message: string;
};

// ── Cookie helpers ─────────────────────────────────────────────────────────

async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // Match backend ACCESS_TOKEN_EXPIRE_MINUTES (43200 min = 30 days)
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
    });
}

async function seedActiveWorkspaceCookie() {
    const cookieStore = await cookies();
    if (cookieStore.get("active_workspace")) return;
    const memberships = await workspacesApi.list().catch(() => []);
    if (memberships.length > 0) {
        cookieStore.set("active_workspace", memberships[0].workspace_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
            sameSite: "lax",
        });
    }
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value ?? null;
}

// ── Session user ───────────────────────────────────────────────────────────

/**
 * Decodes the JWT from the session cookie WITHOUT a network call.
 * Used in layouts and server components where we only need basic
 * user info (id, email, name, globalRole).
 * JWT signature is verified by middleware — we trust it here.
 */
export async function getCurrentUser() {
    const token = await getAuthToken();
    if (!token) return null;

    try {
        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString()
        );

        // Check expiry manually
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        const cookieStore = await cookies();
        const activeWorkspaceId = cookieStore.get("active_workspace")?.value;

        const globalRole = (payload.global_role as string) || "RADIOLOGIST";
        const name =
            (payload.name as string) ||
            (payload.email as string)?.split("@")[0] ||
            "User";

        return {
            id: payload.sub as string,
            email: payload.email as string,
            name,
            globalRole: globalRole as "ADMIN" | "RADIOLOGIST",
            avatar: name.charAt(0).toUpperCase(),
            workspaceId: activeWorkspaceId,
        };
    } catch {
        return null;
    }
}

// ── Login ──────────────────────────────────────────────────────────────────

export async function loginUser(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { message: "Email and password are required." };
    }

    try {
        const data = await authApi.login(email, password);
        await setSessionCookie(data.access_token);
        await seedActiveWorkspaceCookie();
    } catch (err) {
        if (err instanceof ApiError) {
            return { message: err.message };
        }
        return { message: "Network error. Is the backend running?" };
    }

    redirect("/dashboard");
}

// ── Register ───────────────────────────────────────────────────────────────

export async function registerUser(
    prevState: SignupState,
    formData: FormData
): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const role = formData.get("role") as string;
    const termsAccepted = formData.get("termsAccepted");
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!email || !password || !firstName || !lastName) {
        return { message: "All fields are required." };
    }

    if (password !== confirmPassword) {
        return { message: "Passwords do not match." };
    }

    if (password.length < 8) {
        return { message: "Password must be at least 8 characters." };
    }

    if (termsAccepted !== "on") {
        return { message: "You must accept the terms and conditions." };
    }

    if (!role || !["radiologist", "admin"].includes(role)) {
        return { message: "Please select a valid role." };
    }

    try {
        await authApi.register(
            email,
            password,
            `${firstName} ${lastName}`.trim(),
            role === "admin" ? "ADMIN" : "RADIOLOGIST"
        );

        return {
            success: true,
            step: 3,
            email,
            message: "OTP sent to your email.",
            timestamp: Date.now(),
        };
    } catch (err) {
        if (err instanceof ApiError) {
            return { message: err.message };
        }
        return { message: "Network error. Is the backend running?" };
    }
}

// ── OTP ────────────────────────────────────────────────────────────────────

export async function verifyOtp(
    prevState: any,
    formData: FormData
): Promise<{ message: string }> {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    if (!email || !otp || otp.length !== 6) {
        return { message: "Please enter the 6-digit code." };
    }

    try {
        const data = await authApi.verifyOtp(email, otp);
        await setSessionCookie(data.access_token);
        await seedActiveWorkspaceCookie();
    } catch (err) {
        if (err instanceof ApiError) {
            return { message: err.message };
        }
        return { message: "Network error. Is the backend running?" };
    }

    redirect("/dashboard");
}

export async function resendOtp(email: string): Promise<boolean> {
    try {
        await authApi.resendOtp(email);
        return true;
    } catch {
        return false;
    }
}

// ── Google OAuth ───────────────────────────────────────────────────────────

export async function googleAuthAction(
    id_token: string,
    global_role?: "ADMIN" | "RADIOLOGIST"
): Promise<{ error?: string; redirectTo?: string }> {
    try {
        const data = await authApi.googleAuth(id_token, global_role);
        await setSessionCookie(data.access_token);
        await seedActiveWorkspaceCookie();
        return { redirectTo: "/dashboard" };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.message === "GOOGLE_USER_NOT_FOUND") {
                return { error: "No account found. Please sign up first." };
            }
            return { error: err.message };
        }
        return { error: "Network error. Is the backend running?" };
    }
}

// ── Logout ─────────────────────────────────────────────────────────────────

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("active_workspace");
    redirect("/login");
}