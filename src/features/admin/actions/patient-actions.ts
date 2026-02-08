'use server'

import { getAuthToken, getCurrentUser } from "@/actions/auth-actions"
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
    if (!phoneNumber || !workspaceId) return []

    const token = await getAuthToken();
    if (!token) return [];

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": workspaceId
        };

        const response = await fetch(`${AUTH_SERVICE_URL}/patients?phone_number=${encodeURIComponent(phoneNumber)}`, {
            headers
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

    if (!user || !token || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": data.workspaceId
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

    if (!user || !token || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    const workspaceId = user.workspaceId;

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
        return mapPatient(patient);
    } catch (error) {
        console.error("Update Patient Error:", error);
        throw error;
    }
}

export async function getAllPatients(workspaceId: string) {
    const user = await getCurrentUser()
    const token = await getAuthToken()

    if (!user || !token || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    try {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            "X-Workspace-Id": workspaceId
        };

        const response = await fetch(`${AUTH_SERVICE_URL}/patients`, {
            headers
        });

        if (!response.ok) throw new Error("Failed to fetch patients");

        const patients = await response.json();
        return Array.isArray(patients) ? patients.map(mapPatient) : [];
    } catch (error) {
        console.error("Get All Patients Error:", error);
        throw error;
    }
}

export async function deletePatient(id: string) {
    const user = await getCurrentUser()
    const token = await getAuthToken()

    if (!user || !token || (user.role !== 'admin' && user.role !== 'owner')) {
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
    } catch (error) {
        console.error("Delete Patient Error:", error);
        throw error;
    }
}
