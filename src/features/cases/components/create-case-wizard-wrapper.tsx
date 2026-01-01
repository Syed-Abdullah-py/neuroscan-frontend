"use client"

import { CreateCaseWizard } from "./create-case-wizard"
import { useRouter } from "next/navigation"

export function CreateCaseWizardWrapper({ workspaceId, mode }: { workspaceId: string, mode: 'case' | 'patient' }) {
    const router = useRouter()

    return (
        <CreateCaseWizard
            workspaceId={workspaceId}
            mode={mode}
            onSuccess={() => {
                // Redirect based on mode
                if (mode === 'patient') {
                    router.push('/admin/patients')
                } else {
                    router.push('/admin/cases') // Assuming there is a cases list page
                }
            }}
        />
    )
}
