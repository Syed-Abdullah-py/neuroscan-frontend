import { cache } from "react";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

/**
 * React cache() deduplicates calls within a single server render.
 * Layout calls getWorkspaceContext() → page also calls it → only ONE fetch happens.
 * This eliminates the redundant workspacesApi.list() call in every page.
 */
export const getWorkspaceContext = cache(async () => {
    const user = await getCurrentUser();
    if (!user) return null;

    const memberships = await workspacesApi.list().catch(() => []);
    const activeWorkspace =
        memberships.find((m: any) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    return {
        user,
        memberships: memberships as any[],
        activeWorkspace: activeWorkspace as any,
        workspaceId: activeWorkspace?.workspace_id as string | undefined,
        workspaceRole: activeWorkspace?.role as WorkspaceRole | undefined,
    };
});