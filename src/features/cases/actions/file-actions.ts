'use server'

import { getAuthToken } from "@/actions/auth-actions"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export async function uploadFiles(formData: FormData) {
    const token = await getAuthToken();
    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to upload files");
        }

        const result = await response.json();
        return result.uploaded; // Expecting array of file details
    } catch (error) {
        console.error("Upload Files Error:", error);
        throw error;
    }
}
