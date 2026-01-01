import { getCurrentUser } from "@/actions/auth-actions"
import { redirect } from "next/navigation"
import { CreateCaseWizardWrapper } from "@/features/cases/components/create-case-wizard-wrapper"

export default async function NewCasePage() {
    const user = await getCurrentUser()
    if (!user?.workspaceId) redirect("/admin")

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Register New Case</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Create a new diagnostic case. Search for an existing patient or register a new one.
                </p>
            </div>

            <div className="flex justify-center">
                <CreateCaseWizardWrapper workspaceId={user.workspaceId} mode="case" />
            </div>
        </div>
    )
}
