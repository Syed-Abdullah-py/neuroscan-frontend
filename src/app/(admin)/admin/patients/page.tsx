import { PatientManagement } from "@/features/admin/components/patient-management";
import { getCurrentUser } from "@/actions/auth-actions";

export default async function AdminPatientsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin' && user.role !== 'owner') {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Registry</h1>
            <PatientManagement workspaceId={user.workspaceId!} />
        </div>
    );
}
