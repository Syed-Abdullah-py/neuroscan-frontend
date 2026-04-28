"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { ApiError } from "@/lib/api/client";

// ── Cookie ─────────────────────────────────────────────────────────────────

export async function setActiveWorkspaceCookie(workspaceId: string) {
    const cookieStore = await cookies();
    cookieStore.set("active_workspace", workspaceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
    });
    revalidatePath("/", "layout");
}

// ── Workspace CRUD ─────────────────────────────────────────────────────────

export async function createWorkspaceAction(name: string) {
    try {
        const ws = await workspacesApi.create(name);
        await setActiveWorkspaceCookie(ws.id);
        revalidatePath("/workspaces");
        revalidatePath("/dashboard");
        return { success: true, message: "" };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to create workspace." };
    }
}

export async function updateWorkspaceAction(workspaceId: string, name: string) {
    try {
        await workspacesApi.update(workspaceId, name);
        revalidatePath("/workspaces");
        return { success: true, message: "Workspace updated." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to update workspace." };
    }
}

export async function deleteWorkspaceAction(workspaceId: string) {
    try {
        await workspacesApi.delete(workspaceId);
        const cookieStore = await cookies();
        if (cookieStore.get("active_workspace")?.value === workspaceId) {
            cookieStore.delete("active_workspace");
        }
        revalidatePath("/workspaces");
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to delete workspace." };
    }
    redirect("/workspaces");
}

// ── Members ────────────────────────────────────────────────────────────────

export async function removeMemberAction(workspaceId: string, userId: string) {
    try {
        await workspacesApi.removeMember(workspaceId, userId);
        revalidatePath("/workspaces");
        return { success: true, message: "Member removed." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to remove member." };
    }
}

export async function leaveWorkspaceAction(workspaceId: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        if (!token) return { success: false, message: "Not authenticated." };

        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
        const userId = payload.sub as string;
        if (!userId) return { success: false, message: "Could not resolve user." };

        await workspacesApi.removeMember(workspaceId, userId);

        if (cookieStore.get("active_workspace")?.value === workspaceId) {
            cookieStore.delete("active_workspace");
        }

        revalidatePath("/", "layout");
        return { success: true, message: "Left workspace." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to leave workspace." };
    }
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function inviteMemberAction(workspaceId: string, email: string) {
    try {
        await workspacesApi.invite(workspaceId, email);
        revalidatePath("/workspaces");
        return { success: true, message: "Invitation sent." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to send invitation." };
    }
}

export async function acceptInvitationAction(invitationId: string) {
    try {
        const result = await workspacesApi.acceptInvitation(invitationId);
        revalidatePath("/workspaces");
        revalidatePath("/dashboard");
        return { success: true, message: result.message };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to accept invitation." };
    }
}

export async function rejectInvitationAction(invitationId: string) {
    try {
        const result = await workspacesApi.rejectInvitation(invitationId);
        revalidatePath("/workspaces");
        return { success: true, message: result.message };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to reject invitation." };
    }
}

// ── Join requests ──────────────────────────────────────────────────────────

export async function approveJoinRequestAction(
    requestId: string,
    workspaceId: string
) {
    try {
        await workspacesApi.approveJoinRequest(requestId, workspaceId);
        revalidatePath("/workspaces");
        return { success: true, message: "Request approved." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to approve request." };
    }
}

export async function rejectJoinRequestAction(
    requestId: string,
    workspaceId: string
) {
    try {
        await workspacesApi.rejectJoinRequest(requestId, workspaceId);
        revalidatePath("/workspaces");
        return { success: true, message: "Request rejected." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to reject request." };
    }
}

export async function requestJoinAction(workspaceId: string) {
    try {
        await workspacesApi.requestJoin(workspaceId);
        revalidatePath("/workspaces");
        return { success: true, message: "Join request sent." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to send join request." };
    }
}