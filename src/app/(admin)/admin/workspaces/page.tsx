import { getCurrentUser, getUserWorkspaces, getTeamMembers } from "@/actions/auth-actions";
import { UnifiedWorkspace } from "@/features/workspaces/components/unified-workspace";
import { CameraCleanup } from "@/components/camera-cleanup";

export default async function AdminWorkspacesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Fetch members if active workspace
    const members = user?.workspaceId ? await getTeamMembers() : [];

    // Get current workspace name
    const currentWorkspaceName = workspaces.find(w => w.id === user?.workspaceId)?.name;

    if (!user) return null;

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
            <CameraCleanup />
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workspace Center</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your organization, team, and settings.
                </p>
            </div>

            <UnifiedWorkspace
                user={user as any}
                workspaces={workspaces}
                currentWorkspaceName={currentWorkspaceName}
                members={members}
            />
        </div>
    );
}
