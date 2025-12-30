import { getCurrentUser } from "@/actions/auth-actions";
import { CasesView } from "@/features/cases/components/cases-view";

export default async function AdminCasesPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin' && user.role !== 'owner') {
        return <div>Unauthorized</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <CasesView workspaceId={user.workspaceId!} />
        </div>
    );
}
