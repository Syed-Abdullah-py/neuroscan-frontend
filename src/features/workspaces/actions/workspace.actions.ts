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
}

// ── Workspace CRUD ─────────────────────────────────────────────────────────

export async function createWorkspaceAction(
    _prev: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const name = (formData.get("name") as string)?.trim();
    if (!name || name.length < 2) {
        return { success: false, message: "Workspace name must be at least 2 characters." };
    }

    try {
        const workspace = await workspacesApi.create(name);
        await setActiveWorkspaceCookie(workspace.id);
        revalidatePath("/dashboard", "layout");
        return { success: true, message: "Workspace created." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to create workspace." };
    }
}

export async function updateWorkspaceAction(
    workspaceId: string,
    name: string
): Promise<{ success: boolean; message: string }> {
    if (!name?.trim()) {
        return { success: false, message: "Name is required." };
    }
    try {
        await workspacesApi.update(workspaceId, name.trim());
        revalidatePath("/dashboard", "layout");
        return { success: true, message: "Workspace updated." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to update." };
    }
}

export async function deleteWorkspaceAction(
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.delete(workspaceId);

        // Clear active workspace cookie if it was this one
        const cookieStore = await cookies();
        if (cookieStore.get("active_workspace")?.value === workspaceId) {
            cookieStore.delete("active_workspace");
        }

        revalidatePath("/dashboard", "layout");
        return { success: true, message: "Workspace deleted." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to delete." };
    }
}

// ── Members ────────────────────────────────────────────────────────────────

export async function removeMemberAction(
    workspaceId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.removeMember(workspaceId, userId);
        revalidatePath("/dashboard/workspaces");
        return { success: true, message: "Member removed." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to remove member." };
    }
}

// ── Invitations ────────────────────────────────────────────────────────────

export async function inviteMemberAction(
    workspaceId: string,
    email: string
): Promise<{ success: boolean; message: string }> {
    if (!email?.includes("@")) {
        return { success: false, message: "Valid email required." };
    }
    try {
        await workspacesApi.invite(workspaceId, email.trim().toLowerCase());
        revalidatePath("/dashboard/workspaces");
        return { success: true, message: `Invitation sent to ${email}.` };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to send invitation." };
    }
}

export async function acceptInvitationAction(
    invitationId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.acceptInvitation(invitationId);
        revalidatePath("/dashboard", "layout");
        return { success: true, message: "Invitation accepted." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to accept." };
    }
}

export async function rejectInvitationAction(
    invitationId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.rejectInvitation(invitationId);
        revalidatePath("/dashboard/workspaces");
        return { success: true, message: "Invitation declined." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to reject." };
    }
}

// ── Join requests ──────────────────────────────────────────────────────────

export async function requestJoinAction(
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.requestJoin(workspaceId);
        return { success: true, message: "Join request sent." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to send request." };
    }
}

export async function approveJoinRequestAction(
    requestId: string,
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.approveJoinRequest(requestId, workspaceId);
        revalidatePath("/dashboard/workspaces");
        return { success: true, message: "Request approved." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to approve." };
    }
}

export async function rejectJoinRequestAction(
    requestId: string,
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await workspacesApi.rejectJoinRequest(requestId, workspaceId);
        revalidatePath("/dashboard/workspaces");
        return { success: true, message: "Request rejected." };
    } catch (err) {
        const e = err as ApiError;
        return { success: false, message: e.message || "Failed to reject." };
    }
}

// ── Shim for legacy imports in auth-actions.ts ─────────────────────────────

export async function switchWorkspace(
    workspaceId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await setActiveWorkspaceCookie(workspaceId);
        return { success: true };
    } catch {
        return { success: false, message: "Failed to switch workspace." };
    }
}