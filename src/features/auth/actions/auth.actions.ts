"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export type SignupState = {
    message: string;
    errors?: Record<string, string[]>;
    success?: boolean;
    step?: number;
    email?: string;
    timestamp?: number;
};

// ── Cookie helpers ─────────────────────────────────────────────────────────

async function setSessionCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days — matches backend ACCESS_TOKEN_EXPIRE_MINUTES
        path: "/",
        sameSite: "lax",
    });
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value || null;
}

export async function getCurrentUser() {
    const token = await getAuthToken();
    if (!token) return null;

    try {
        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString()
        );

        const cookieStore = await cookies();
        const activeWorkspaceId = cookieStore.get("active_workspace")?.value;

        const globalRole = payload.global_role || "";
        const name = payload.name || payload.email?.split("@")[0] || "User";

        return {
            id: payload.sub as string,
            email: payload.email as string,
            name,
            globalRole: globalRole as string,
            avatar: name.charAt(0).toUpperCase(),
            workspaceId: activeWorkspaceId || undefined,
        };
    } catch {
        return null;
    }
}

// ── Auth actions ───────────────────────────────────────────────────────────

export async function loginUser(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { message: "Email and password are required." };
    }

    let token: string | null = null;

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                message:
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Invalid email or password.",
            };
        }

        const data = await response.json();
        token = data.access_token;
        await setSessionCookie(token!);
    } catch {
        return { message: "Network error. Please try again." };
    }

    redirect("/dashboard");
}

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

    if (termsAccepted !== "on") {
        return { message: "You must accept the terms and conditions." };
    }

    if (!email || !password || !firstName || !lastName) {
        return { message: "All fields are required." };
    }

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password,
                name: `${firstName} ${lastName}`,
                global_role: role === "admin" ? "ADMIN" : "RADIOLOGIST",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                message:
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Registration failed. Please try again.",
            };
        }

        return {
            success: true,
            step: 3,
            email,
            message: "OTP sent to your email.",
            timestamp: Date.now(),
        };
    } catch {
        return { message: "Network error. Please try again." };
    }
}

export async function verifyOtp(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    if (!email || !otp || otp.length !== 6) {
        return { message: "Invalid OTP." };
    }

    let token: string | null = null;

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                message:
                    typeof errorData.detail === "string"
                        ? errorData.detail
                        : "Verification failed.",
            };
        }

        const data = await response.json();
        token = data.access_token;
        await setSessionCookie(token!);
    } catch {
        return { message: "Network error. Please try again." };
    }

    redirect("/dashboard");
}

export async function resendOtp(email: string): Promise<boolean> {
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/auth/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    cookieStore.delete("active_workspace");
    redirect("/login");
}