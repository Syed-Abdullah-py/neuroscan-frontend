import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { WorkspacesShell } from "@/features/workspaces/components/workspaces-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function WorkspacesPage() {
    const ctx = await getWorkspaceContext();
    if (!ctx?.user) redirect("/login");

    const { user, memberships, workspaceId, workspaceRole } = ctx;

    const [members, joinRequests, myInvitations, sentInvitations] =
        await Promise.all([
            workspaceId
                ? workspacesApi.listMembers(workspaceId).catch(() => [])
                : Promise.resolve([]),
            workspaceId &&
                (workspaceRole === "OWNER" || workspaceRole === "ADMIN")
                ? workspacesApi.listJoinRequests(workspaceId).catch(() => [])
                : Promise.resolve([]),
            workspacesApi.myInvitations().catch(() => []),
            workspaceId &&
                (workspaceRole === "OWNER" || workspaceRole === "ADMIN")
                ? workspacesApi.listInvitations(workspaceId).catch(() => [])
                : Promise.resolve([]),
        ]);

    return (
        <WorkspacesShell
            user={{
                id: user.id,
                email: user.email,
                name: user.name,
                globalRole: user.globalRole,
                workspaceId,
            }}
            memberships={memberships}
            workspaceId={workspaceId ?? null}
            workspaceRole={(workspaceRole ?? null) as WorkspaceRole | null}
            initialMembers={members as any[]}
            initialJoinRequests={joinRequests as any[]}
            initialMyInvitations={myInvitations as any[]}
            initialSentInvitations={sentInvitations as any[]}
        />
    );
}