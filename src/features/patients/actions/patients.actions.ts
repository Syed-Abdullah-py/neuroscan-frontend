"use server";

import { revalidatePath } from "next/cache";
import { patientsApi } from "@/lib/api/patients.api";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import type { PatientCreate, PatientUpdate } from "@/lib/types/patient.types";

export type PatientFormState = {
    message: string;
    success?: boolean;
    errors?: Record<string, string>;
};

// ── Create ─────────────────────────────────────────────────────────────────

export async function createPatientAction(
    prevState: PatientFormState,
    formData: FormData
): Promise<PatientFormState> {
    const user = await getCurrentUser();
    if (!user?.workspaceId) {
        return { message: "No active workspace." };
    }

    const firstName = (formData.get("first_name") as string)?.trim();
    const lastName = (formData.get("last_name") as string)?.trim();
    const dob = formData.get("dob") as string;
    const gender = formData.get("gender") as string;
    const phoneNumber = (formData.get("phone_number") as string)?.trim();
    const mrn = (formData.get("mrn") as string)?.trim() || undefined;
    const cnic = (formData.get("cnic") as string)?.trim() || undefined;
    const address = (formData.get("address") as string)?.trim() || undefined;
    const city = (formData.get("city") as string)?.trim() || undefined;

    // Validation
    const errors: Record<string, string> = {};
    if (!firstName) errors.first_name = "First name is required.";
    if (!lastName) errors.last_name = "Last name is required.";
    if (!dob) errors.dob = "Date of birth is required.";
    if (!gender) errors.gender = "Gender is required.";
    if (!phoneNumber) errors.phone_number = "Phone number is required.";

    if (Object.keys(errors).length > 0) {
        return { message: "Please fix the errors below.", errors };
    }

    const payload: PatientCreate = {
        first_name: firstName,
        last_name: lastName,
        dob,
        gender,
        phone_number: phoneNumber,
        mrn,
        cnic,
        address,
        city,
    };

    try {
        await patientsApi.create(payload, user.workspaceId);
    } catch (err) {
        if (err instanceof ApiError) {
            return { message: err.message };
        }
        return { message: "Failed to create patient. Please try again." };
    }

    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: true, message: "" };
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updatePatientAction(
    patientId: string,
    workspaceId: string,
    data: PatientUpdate
): Promise<{ success: boolean; message: string }> {
    try {
        await patientsApi.update(patientId, data, workspaceId);
        revalidatePath("/patients");
        revalidatePath("/dashboard");
        return { success: true, message: "Patient updated." };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, message: err.message };
        }
        return { success: false, message: "Failed to update patient." };
    }
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deletePatientAction(
    patientId: string,
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await patientsApi.delete(patientId, workspaceId);
        revalidatePath("/patients");
        revalidatePath("/dashboard");
        return { success: true, message: "Patient deleted." };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, message: err.message };
        }
        return { success: false, message: "Failed to delete patient." };
    }
}