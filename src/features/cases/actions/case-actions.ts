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

    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized: Only Admins or Owners can create cases");
    }

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
        revalidatePath(`/admin/cases`);
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
            },
            cache: 'no-store'
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (error) {
        console.error("Get Assigned Cases Error:", error);
        return [];
    }
}

export async function getDoctorsForDropdown(workspaceId: string) {
    console.log(`[getDoctorsForDropdown] Fetching for workspace: ${workspaceId}`);
    const token = await getAuthToken();
    if (!token) {
        console.error("[getDoctorsForDropdown] No token");
        return [];
    }

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`[getDoctorsForDropdown] Fetch failed: ${response.status} ${response.statusText}`);
            return [];
        }

        const members = await response.json();
        console.log(`[getDoctorsForDropdown] Found ${members.length} total members`);

        // Filter: Allow DOCTOR, ADMIN, OWNER to be assigned cases?
        // Usually only doctors, but let's be permissive for now or check data.
        // If data has role="DOCTOR", it should work.

        const eligible = members.filter((m: any) => {
            const role = m.role?.toUpperCase();
            return role === 'DOCTOR' || role === 'ADMIN' || role === 'OWNER';
        });

        console.log(`[getDoctorsForDropdown] Eligible members: ${eligible.length}`);

        return eligible.map((m: any) => ({
            id: m.id,
            user: m.user,
            role: m.role, // Pass role to frontend for display if needed
            _count: { assignedCases: 0 }
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
            },
            cache: 'no-store'
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
            headers,
            cache: 'no-store'
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Get Case By ID Error:", error);
        return null;
    }
}
