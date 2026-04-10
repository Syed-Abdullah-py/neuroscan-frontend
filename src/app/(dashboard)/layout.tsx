import { redirect } from "next/navigation";
import { getAuthToken } from "@/features/auth/actions/auth.actions";
import { getWorkspaceContext } from "@/lib/api/request-cache";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import type { ApiError } from "@/lib/api/client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [ctx, token] = await Promise.all([
        getWorkspaceContext(),
        getAuthToken(),
    ]);

    if (!ctx?.user || !token) redirect("/login");

    const { user, memberships, workspaceId: activeWorkspaceId } = ctx;

    const workspacesForSidebar = memberships.map((m: any) => ({
        id: m.workspace_id,
        name: m.workspace_name,
        slug: "",
        role: m.role,
        active: m.workspace_id === activeWorkspaceId,
    }));

    return (
        <WorkspaceProvider
            initialWorkspaceId={activeWorkspaceId}
            token={token}
        >
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Sidebar
                    user={{
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        globalRole: user.globalRole,
                        workspaceId: activeWorkspaceId,
                    }}
                    workspaces={workspacesForSidebar}
                />
                <main className="md:pl-64 min-h-screen">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </WorkspaceProvider>
    );
}