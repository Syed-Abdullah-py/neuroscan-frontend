"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { casesApi } from "@/lib/api/cases.api";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import type { CaseUpdate } from "@/lib/types/case.types";

export type CaseFormState = {
    message: string;
    success?: boolean;
};

export async function createCaseAction(
    _prevState: CaseFormState,
    formData: FormData
): Promise<CaseFormState> {
    const user = await getCurrentUser();
    if (!user?.workspaceId) return { message: "No active workspace." };

    const patientId = formData.get("patient_id") as string;
    const priority = (formData.get("priority") as string) || "normal";
    const assignedTo = (formData.get("assigned_to_member_id") as string) || undefined;
    const notes = (formData.get("notes") as string) || undefined;
    const scanFiles = formData.getAll("scans") as File[];

    if (!patientId) return { message: "Patient is required." };
    if (scanFiles.length !== 4) {
        return { message: "Exactly 4 MRI scan files are required." };
    }

    const allowedExts = [".nii", ".dcm", ".nrrd", ".mha", ".mhd"];
    for (const file of scanFiles) {
        const name = file.name.toLowerCase();
        const allowed =
            allowedExts.some((ext) => name.endsWith(ext)) ||
            name.endsWith(".nii.gz");
        if (!allowed) {
            return {
                message: `Invalid file type: ${file.name}. Allowed: .nii, .nii.gz, .dcm, .nrrd, .mha, .mhd`,
            };
        }
    }

    try {
        await casesApi.create(patientId, scanFiles, user.workspaceId, {
            priority,
            assignedToMemberId: assignedTo,
            notes,
        });
    } catch (err) {
        if (err instanceof ApiError) return { message: err.message };
        return { message: "Failed to create case." };
    }

    revalidatePath("/cases");
    revalidatePath("/dashboard");
    redirect("/cases");
}

export async function updateCaseAction(
    caseId: string,
    workspaceId: string,
    data: CaseUpdate
): Promise<{ success: boolean; message: string }> {
    try {
        await casesApi.update(caseId, data, workspaceId);
        revalidatePath("/cases");
        revalidatePath(`/cases/${caseId}`);
        revalidatePath("/dashboard");
        return { success: true, message: "Case updated." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to update case." };
    }
}

export async function deleteCaseAction(
    caseId: string,
    workspaceId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await casesApi.delete(caseId, workspaceId);
        revalidatePath("/cases");
        revalidatePath("/dashboard");
        return { success: true, message: "Case deleted." };
    } catch (err) {
        if (err instanceof ApiError) return { success: false, message: err.message };
        return { success: false, message: "Failed to delete case." };
    }
}