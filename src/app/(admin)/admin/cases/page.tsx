import { getCurrentUser, getUserWorkspaces } from "@/actions/auth-actions";
import { CasesView } from "@/features/cases/components/cases-view";

export default async function AdminCasesPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    if (!user || !activeWorkspaceId) {
        return <div>Please select or create a workspace first.</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <CasesView workspaceId={activeWorkspaceId} />
        </div>
    );
}
