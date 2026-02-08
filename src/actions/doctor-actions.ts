"use server";

import { getCurrentUser, getAuthToken } from "@/actions/auth-actions";

// Auth service URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

export async function getDoctorDashboardStats(workspaceId?: string) {
    try {
        const user = await getCurrentUser();
        const token = await getAuthToken();

        const activeWorkspaceId = workspaceId;

        if (!user || user.role !== "doctor" || !activeWorkspaceId || !token) {
            return null;
        }

        const response = await fetch(`${AUTH_SERVICE_URL}/cases/stats`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Workspace-Id": activeWorkspaceId
            },
            cache: "no-store"
        });

        if (!response.ok) {
            console.error("Failed to fetch doctor stats:", response.status);
            return null;
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching doctor stats:", error);
        return null;
    }
}

export async function getRecentAssignedCases(workspaceId?: string) {
    try {
        const user = await getCurrentUser();
        const token = await getAuthToken();

        const activeWorkspaceId = workspaceId;

        if (!user || user.role !== "doctor" || !activeWorkspaceId || !token) {
            return [];
        }

        const response = await fetch(`${AUTH_SERVICE_URL}/cases/recent`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Workspace-Id": activeWorkspaceId
            },
            cache: "no-store"
        });

        if (!response.ok) {
            console.error("Failed to fetch recent cases:", response.status);
            return [];
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching recent cases:", error);
        return [];
    }
}
