'use server'

import { getAuthToken, getCurrentUser, getUserWorkspaces } from "@/actions/auth-actions"
import { revalidatePath } from "next/cache"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

/**
 * Maps backend snake_case patient to frontend camelCase.
 */
function mapPatient(p: any) {
    if (!p) return null;
    return {
        ...p,
        firstName: p.first_name,
        lastName: p.last_name,
        phoneNumber: p.phone_number,
        dob: p.dob,
        gender: p.gender,
        mrn: p.mrn,
        cnic: p.cnic,
        address: p.address,
        city: p.city
    };
}

export async function checkPatientByPhone(phoneNumber: string, workspaceId: string) {
    if (!phoneNumber) return []

    const token = await getAuthToken();
    if (!token) return [];

    let targetWorkspaceId = workspaceId;

    // Verify workspace validity
    const workspaces = await getUserWorkspaces();
    const valid = workspaces.find((w: any) => w.id === workspaceId);
    if (!valid && workspaces.length > 0) {
        targetWorkspaceId = workspaces[0].id;
    }

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": targetWorkspaceId
        };

        const response = await fetch(`${AUTH_SERVICE_URL}/patients?phone_number=${encodeURIComponent(phoneNumber)}`, {
            headers,
            cache: 'no-store'
        });

        if (!response.ok) return [];

        const results = await response.json();
        return Array.isArray(results) ? results.map(mapPatient) : [];
    } catch (error) {
        console.error("Check Patient Error:", error);
        return [];
    }
}

export async function createPatient(data: {
    firstName: string
    lastName: string
    dob: Date
    gender: string
    phoneNumber: string
    mrn?: string
    cnic?: string
    address?: string
    city?: string
    workspaceId: string
}) {
    const user = await getCurrentUser()
    const token = await getAuthToken()

    if (!user || !token) {
        throw new Error("Unauthorized")
    }

    // Validate request workspace ID against actual memberships
    const workspaces = await getUserWorkspaces();
    const validWorkspace = workspaces.find((w: any) => w.id === data.workspaceId);

    let finalWorkspaceId = data.workspaceId;

    if (!validWorkspace) {
        console.warn(`[createPatient] Stale workspace ID: ${data.workspaceId}. Switching to valid workspace.`);
        if (workspaces.length > 0) {
            finalWorkspaceId = workspaces[0].id;
        } else {
            throw new Error("User is not a member of any workspace.");
        }
    }

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": finalWorkspaceId
        };

        const response = await fetch(`${AUTH_SERVICE_URL}/patients`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                first_name: data.firstName,
                last_name: data.lastName,
                dob: data.dob.toISOString(),
                gender: data.gender,
                phone_number: data.phoneNumber,
                mrn: data.mrn,
                cnic: data.cnic,
                address: data.address,
                city: data.city
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to create patient");
        }

        const patient = await response.json();
        revalidatePath(`/admin`);
        revalidatePath(`/admin/patients`);
        return mapPatient(patient);
    } catch (error) {
        console.error("Create Patient Error:", error);
        throw error;
    }
}

export async function updatePatient(id: string, data: Partial<{
    firstName: string
    lastName: string
    dob: Date
    gender: string
    mrn: string
    cnic: string
    address: string
    city: string
}>) {
    const user = await getCurrentUser()
    const token = await getAuthToken()

    if (!user || !token) {
        throw new Error("Unauthorized")
    }

    let workspaceId = user.workspaceId;

    // Validate workspace
    const workspaces = await getUserWorkspaces();
    const valid = workspaces.find((w: any) => w.id === workspaceId);
    if (!valid && workspaces.length > 0) {
        workspaceId = workspaces[0].id;
    }

    try {
        const payload: any = {};
        if (data.firstName) payload.first_name = data.firstName;
        if (data.lastName) payload.last_name = data.lastName;
        if (data.dob) payload.dob = data.dob.toISOString();
        if (data.gender) payload.gender = data.gender;
        if (data.mrn) payload.mrn = data.mrn;
        if (data.cnic) payload.cnic = data.cnic;
        if (data.address) payload.address = data.address;
        if (data.city) payload.city = data.city;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
        if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

        const response = await fetch(`${AUTH_SERVICE_URL}/patients/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to update patient");
        }

        const patient = await response.json();
        revalidatePath(`/admin`);
        revalidatePath(`/admin/patients`);
        return mapPatient(patient);
    } catch (error) {
        console.error("Update Patient Error:", error);
        throw error;
    }
}

export async function getAllPatients(workspaceId: string) {
    console.log('[getAllPatients] Called with workspaceId:', workspaceId)
    const user = await getCurrentUser()
    const token = await getAuthToken()

    console.log('[getAllPatients] User:', user?.email, 'Role:', user?.role)

    if (!user || !token) {
        console.error('[getAllPatients] Unauthorized - no user or token')
        throw new Error("Unauthorized")
    }

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": workspaceId
        };

        console.log('[getAllPatients] Fetching from:', `${AUTH_SERVICE_URL}/patients`)
        console.log('[getAllPatients] Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' })

        const response = await fetch(`${AUTH_SERVICE_URL}/patients`, {
            headers,
            cache: 'no-store'
        });

        console.log('[getAllPatients] Response status:', response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[getAllPatients] Error response:', errorText)
            throw new Error("Failed to fetch patients");
        }

        const patients = await response.json();
        console.log('[getAllPatients] Raw response:', JSON.stringify(patients))
        console.log('[getAllPatients] Response type:', typeof patients, 'isArray:', Array.isArray(patients))
        console.log('[getAllPatients] Received', patients?.length, 'patients from backend')
        return Array.isArray(patients) ? patients.map(mapPatient) : [];
    } catch (error) {
        console.error("Get All Patients Error:", error);
        throw error;
    }
}

export async function deletePatient(id: string) {
    const user = await getCurrentUser()
    const token = await getAuthToken()

    if (!user || !token) {
        throw new Error("Unauthorized")
    }

    const workspaceId = user.workspaceId;

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
        };
        if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

        const response = await fetch(`${AUTH_SERVICE_URL}/patients/${id}`, {
            method: "DELETE",
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to delete patient");
        }

        revalidatePath(`/admin`);
        revalidatePath(`/admin/patients`);
    } catch (error) {
        console.error("Delete Patient Error:", error);
        throw error;
    }
}
