import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { ApiError } from "@/lib/api/client";
import { WorkspacesShell } from "@/features/workspaces/components/workspaces-shell";

export default async function WorkspacesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [memberships, myInvitations, discoverableWorkspaces] =
        await Promise.all([
            workspacesApi.list().catch(() => []),
            workspacesApi.myInvitations().catch(() => []),
            workspacesApi.discover().catch(() => []),
        ]);

    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;
    const workspaceRole = activeWorkspace?.role ?? null;

    // Load members + invitations + join requests only if in a workspace
    const [members, sentInvitations, joinRequests] = await Promise.all([
        workspaceId
            ? workspacesApi.listMembers(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId &&
            (workspaceRole === "OWNER" || workspaceRole === "ADMIN")
            ? workspacesApi.listInvitations(workspaceId).catch(() => [])
            : Promise.resolve([]),
        workspaceId &&
            (workspaceRole === "OWNER" || workspaceRole === "ADMIN")
            ? workspacesApi.listJoinRequests(workspaceId).catch(() => [])
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
            workspaceRole={workspaceRole}
            activeWorkspaceName={activeWorkspace?.workspace_name ?? null}
            memberships={memberships}
            members={members}
            sentInvitations={sentInvitations}
            myInvitations={myInvitations}
            joinRequests={joinRequests}
            discoverableWorkspaces={discoverableWorkspaces}
        />
    );
}