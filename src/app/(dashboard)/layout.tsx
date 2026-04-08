import { redirect } from "next/navigation";
import { getCurrentUser, getAuthToken } from "@/features/auth/actions/auth.actions";
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
    const [user, token] = await Promise.all([
        getCurrentUser(),
        getAuthToken(),
    ]);

    if (!user || !token) redirect("/login");

    let memberships: WorkspaceMembership[] = [];
    try {
        memberships = await workspacesApi.list();
    } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr?.status === 401) redirect("/login");
    }

    const activeWorkspace =
        memberships.find((m) => m.workspace_id === user.workspaceId) ??
        memberships[0];
    const activeWorkspaceId = activeWorkspace?.workspace_id;

    const workspacesForSidebar = memberships.map((m) => ({
        id: m.workspace_id,
        name: m.workspace_name,
        slug: "",
        role: m.role,
        active: m.workspace_id === activeWorkspaceId,
    }));

    const sidebarUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        globalRole: user.globalRole,
        workspaceId: activeWorkspaceId,
    };

    return (
        <WorkspaceProvider
            initialWorkspaceId={activeWorkspaceId}
            token={token}
        >
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Sidebar user={sidebarUser} workspaces={workspacesForSidebar} />
                <main className="md:pl-64 min-h-screen transition-all duration-300">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </WorkspaceProvider>
    );
}