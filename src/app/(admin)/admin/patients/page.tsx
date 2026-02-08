import { PatientManagement } from "@/features/admin/components/patient-management";
import { getCurrentUser, getUserWorkspaces } from "@/actions/auth-actions";

export default async function AdminPatientsPage() {
    const user = await getCurrentUser();
    const workspaces = await getUserWorkspaces();

    // Determine active workspace from the list (which handles cookie + fallback)
    const activeWorkspace = workspaces.find((w: any) => w.active);
    const activeWorkspaceId = activeWorkspace?.id || null;

    if (!user || !activeWorkspaceId) {
        return <div>Please select or create a workspace first.</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Registry</h1>
            <PatientManagement workspaceId={activeWorkspaceId} />
        </div>
    );
}
