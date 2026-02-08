import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser, getUserWorkspaces } from "@/actions/auth-actions";

export default async function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar
                role="doctor"
                user={user ? { ...user, workspaceId: activeWorkspaceId || undefined } : null}
                workspaces={workspaces}
            />
            <main className="md:pl-64 min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
