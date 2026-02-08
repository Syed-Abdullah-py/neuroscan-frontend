'use server'

import { getAuthToken, getCurrentUser } from "@/actions/auth-actions"
import { revalidatePath } from "next/cache"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export async function createCase(data: {
    patientId: string
    notes?: string
    fileReferences: string // JSON string
    priority?: string
    workspaceId: string
    assignedToMemberId?: string // Optional, if manual override
}) {
    const token = await getAuthToken();
    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/cases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-Workspace-Id": data.workspaceId
            },
            body: JSON.stringify({
                patient_id: data.patientId,
                notes: data.notes,
                file_references: data.fileReferences,
                priority: data.priority,
                assigned_to_member_id: data.assignedToMemberId
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to create case");
        }

        const newCase = await response.json();
        revalidatePath(`/admin`);
        revalidatePath(`/doctor`);
        return newCase;
    } catch (error) {
        console.error("Create Case Error:", error);
        throw error;
    }
}

export async function updateCaseVerdict(caseId: string, verdict: string) {
    const token = await getAuthToken();
    const user = await getCurrentUser();

    if (!token || !user) throw new Error("Unauthorized");

    // We need workspaceId for the header. Ideally passed in or derived.
    // However, the backend update endpoint checks if user has access.
    // If we don't pass workspaceId, backend might fail strict check if validation logic requires it.
    // Logic in cases.py: `if workspace_id and case.patient.workspace_id != workspace_id: ...`
    // So if we DON'T pass workspaceId, it might skip that check or rely on db access?
    // Let's passed user.workspaceId if available.

    const workspaceId = user?.workspaceId;

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

        const response = await fetch(`${AUTH_SERVICE_URL}/cases/${caseId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                verdict: verdict,
                status: 'COMPLETED'
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to update verdict");
        }

        const updatedCase = await response.json();
        revalidatePath(`/doctor`);
        revalidatePath(`/admin`);
        return updatedCase;
    } catch (error) {
        console.error("Update Verdict Error:", error);
        throw error;
    }
}

export async function getAssignedCases() {
    const token = await getAuthToken();
    const user = await getCurrentUser();

    if (!token || !user?.workspaceId) return [];

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/cases?assigned_to=me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Workspace-Id": user.workspaceId
            }
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (error) {
        console.error("Get Assigned Cases Error:", error);
        return [];
    }
}

export async function getDoctorsForDropdown(workspaceId: string) {
    const token = await getAuthToken();
    if (!token) return [];

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return [];

        const members = await response.json();
        // Filter for DOCTORS and transform
        // Note: Backend MemberSchema now includes 'user' object.
        // We need to map it to what frontend expects.
        // Frontend likely expects objects with 'user' property.

        return members
            .filter((m: any) => m.role === 'DOCTOR')
            .map((m: any) => ({
                id: m.id,
                user: m.user,
                _count: { assignedCases: 0 } // Stats not yet available in members list. 
                // TODO: Add stats to members endpoint or separate stats call.
                // For now, sorting might break if we rely on _count.
                // Let's mock _count or return 0.
            }));
    } catch (error) {
        console.error("Get Doctors Error:", error);
        return [];
    }
}

export async function getAllCasesForWorkspace(workspaceId: string) {
    const token = await getAuthToken();
    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/cases`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Workspace-Id": workspaceId
            }
        });

        if (!response.ok) throw new Error("Failed to fetch cases");

        return await response.json();
    } catch (error) {
        console.error("Get All Cases Error:", error);
        throw error;
    }
}

export async function getCaseById(caseId: string) {
    const token = await getAuthToken();
    const user = await getCurrentUser();

    if (!token) return null;

    const workspaceId = user?.workspaceId;

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
        };
        if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

        const response = await fetch(`${AUTH_SERVICE_URL}/cases/${caseId}`, {
            headers
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Get Case By ID Error:", error);
        return null;
    }
}
