import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { getCurrentUser } from "@/actions/auth-actions";

export default async function DoctorDashboard() {
    const user = await getCurrentUser();

    if (!user?.workspaceId) {
        return <OnboardingWizard />;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
            <p>Welcome to your workspace.</p>
        </div>
    );
}
