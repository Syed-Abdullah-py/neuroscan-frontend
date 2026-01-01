import { getCurrentUser } from "@/actions/auth-actions"
import { CreateCaseWizard } from "@/features/cases/components/create-case-wizard"
import { redirect } from "next/navigation"

export default async function NewPatientPage() {
    const user = await getCurrentUser()
    if (!user?.workspaceId) redirect("/admin")

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Register New Patient</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Add a new patient to your workspace. You can search by phone number first.
                </p>
            </div>

            <div className="flex justify-center">
                <CreateCaseWizardWrapper workspaceId={user.workspaceId} mode="patient" />
            </div>
        </div>
    )
}

// Wrapper for client-side navigation handling
import { CreateCaseWizardWrapper } from "@/features/cases/components/create-case-wizard-wrapper"
