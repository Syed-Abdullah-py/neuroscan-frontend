import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { workspacesApi } from "@/lib/api/workspaces.api";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import type { WorkspaceMembership } from "@/lib/types/workspace.types";
import type { ApiError } from "@/lib/api/client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch workspaces — fail gracefully if backend is down
    let memberships: WorkspaceMembership[] = [];
    try {
        memberships = await workspacesApi.list();
    } catch (err) {
        const apiErr = err as ApiError;
        // 401 means cookie is stale — send to login
        if (apiErr?.status === 401) {
            redirect("/login");
        }
        // Any other error (backend down, network) → continue with empty list
        // User will see "No Active Workspace" state, not a crash
    }

    // Resolve active workspace: cookie value → first membership → undefined
    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];
    const activeWorkspaceId = activeWorkspace?.workspace_id;

    // Shape memberships for the sidebar workspace switcher
    const workspacesForSidebar = memberships.map((m) => ({
        id: m.workspace_id,
        name: m.workspace_name,
        slug: "",           // not returned by list endpoint — switcher only needs id/name/role
        role: m.role,
        active: m.workspace_id === activeWorkspaceId,
    }));

    // Shape user for sidebar
    const sidebarUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        globalRole: user.globalRole,
        workspaceId: activeWorkspaceId,
    };

    return (
        <WorkspaceProvider initialWorkspaceId={activeWorkspaceId}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Sidebar
                    user={sidebarUser}
                    workspaces={workspacesForSidebar}
                />
                {/* Offset content by sidebar width (w-75 = 300px but sidebar uses w-64 effectively) */}
                <main className="md:pl-64 min-h-screen transition-all duration-300">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </WorkspaceProvider>
    );
}