import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { getCurrentUser, getMyInvitations } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const user = await getCurrentUser();

    // If user is already in a workspace and NOT explicitly trying to create/join, redirect to dashboard?
    // Actually, if they are here, maybe they want to create another one?
    // Let's only redirect if they have a workspace AND no query param is set?
    // But usage is `?mode=create`.

    // Fetch invitations for user
    const invitations = await getMyInvitations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <OnboardingWizard userRole={user?.role?.toUpperCase()} invitations={invitations} />
        </div>
    );
}
