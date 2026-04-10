import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { WorkspacesShell } from "@/features/workspaces/components/workspaces-shell";

export default async function WorkspacesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const memberships = await workspacesApi.list().catch(() => []);

    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];

    const workspaceId = activeWorkspace?.workspace_id;
    const workspaceRole = activeWorkspace?.role ?? null;

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
            memberships={memberships as any[]}
            workspaceId={workspaceId ?? null}
            workspaceRole={workspaceRole}
            initialMembers={members as any[]}
            initialJoinRequests={joinRequests as any[]}
            initialMyInvitations={myInvitations as any[]}
            initialSentInvitations={sentInvitations as any[]}
        />
    );
}