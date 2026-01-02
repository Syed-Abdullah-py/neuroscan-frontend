'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/actions/auth-actions"
import { revalidatePath } from "next/cache"

export async function createCase(data: {
    patientId: string
    notes?: string
    fileReferences: string // JSON string
    priority?: string
    workspaceId: string
    assignedToMemberId?: string // Optional, if manual override
}) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    let assignedDocId = data.assignedToMemberId

    // Auto-assign if not provided
    if (!assignedDocId) {
        // Find doctor with the least pending cases in this workspace
        const doctors = await prisma.workspaceMember.findMany({
            where: {
                workspaceId: data.workspaceId,
                role: 'DOCTOR'
            },
            include: {
                _count: {
                    select: { assignedCases: { where: { status: 'PENDING' } } }
                }
            }
        })

        if (doctors.length > 0) {
            // Sort by case count ascending
            doctors.sort((a, b) => a._count.assignedCases - b._count.assignedCases)
            assignedDocId = doctors[0].id
        }
    }

    const newCase = await prisma.case.create({
        data: {
            patientId: data.patientId,
            notes: data.notes,
            fileReferences: data.fileReferences,
            priority: data.priority || 'normal',
            assignedToMemberId: assignedDocId,
            status: 'PENDING'
        }
    })

    revalidatePath(`/admin`)
    revalidatePath(`/doctor`)
    return newCase
}

export async function updateCaseVerdict(caseId: string, verdict: string) {
    const user = await getCurrentUser()

    // Check if user is the assigned doctor or admin (but requirement says admin cannot give final verdict? 
    // "Only the admin/owner can do CRUD operations, however they cannot give the final verdict ... 
    // The doctors cannot perform CRUD operation ... but can update their verdict")

    // So we need to check if the user is a doctor and assigned to this case?
    // Or just any doctor in the workspace? Requirement says "view and give verdict of the ones assigned to them"

    const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: { assignedTo: true }
    })

    if (!caseItem) throw new Error("Case not found")

    // We verify the user is the assigned doctor
    // This requires fetching the user's workspace member record
    // Optimization: We can just check permission based on logic.

    // For now strict check: Must be the assigned member user.
    if (caseItem.assignedTo?.userId !== user?.id) {
        // Admins can VIEW, but not give final verdict.
        // So if admin tries this, it should fail? 
        // "Admin/owner ... cannot give the final verdict that the AI response is correct or incorrect."
        // So we explicitly block non-assigned doctors.
        throw new Error("Only the assigned doctor can submit a verdict.")
    }

    const updatedCase = await prisma.case.update({
        where: { id: caseId },
        data: {
            verdict,
            verdictUpdatedAt: new Date(),
            status: 'COMPLETED' // Assume verdict means completion
        }
    })

    revalidatePath(`/doctor`)
    revalidatePath(`/admin`)
    return updatedCase
}

export async function getAssignedCases() {
    const user = await getCurrentUser()
    if (!user) return []

    // Find the workspace member record for this user in the active context? 
    // The user object might not have workspaceId if not selected. 
    // Assuming user context has workspaceId or we find the member record.

    if (!user.workspaceId) return []

    const member = await prisma.workspaceMember.findFirst({
        where: {
            userId: user.id,
            workspaceId: user.workspaceId
        }
    })

    if (!member) return []

    return await prisma.case.findMany({
        where: {
            assignedToMemberId: member.id
        },
        include: {
            patient: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
}

export async function getDoctorsForDropdown(workspaceId: string) {
    const doctors = await prisma.workspaceMember.findMany({
        where: {
            workspaceId: workspaceId,
            role: 'DOCTOR'
        },
        include: {
            user: true,
            _count: {
                select: { assignedCases: { where: { status: 'PENDING' } } }
            }
        }
    })

    // Sort logic to put least busy first
    return doctors.sort((a, b) => a._count.assignedCases - b._count.assignedCases)
}

export async function getAllCasesForWorkspace(workspaceId: string) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    return await prisma.case.findMany({
        where: {
            patient: {
                workspaceId: workspaceId
            }
        },
        include: {
            patient: true,
            assignedTo: {
                include: {
                    user: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

