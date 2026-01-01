'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/actions/auth-actions"
import { revalidatePath } from "next/cache"

export async function checkPatientByPhone(phoneNumber: string, workspaceId: string) {
    if (!phoneNumber || !workspaceId) return []

    const patients = await prisma.patient.findMany({
        where: {
            phoneNumber,
            workspaceId
        },
        orderBy: { updatedAt: 'desc' }
    })

    return patients
}

export async function createPatient(data: {
    firstName: string
    lastName: string
    dob: Date
    gender: string
    phoneNumber: string
    mrn?: string
    cnic?: string
    address?: string
    city?: string
    workspaceId: string
}) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    const patient = await prisma.patient.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            gender: data.gender,
            phoneNumber: data.phoneNumber,
            mrn: data.mrn,
            cnic: data.cnic,
            address: data.address,
            city: data.city,
            workspaceId: data.workspaceId
        }
    })

    revalidatePath(`/admin`)
    return patient
}

export async function updatePatient(id: string, data: Partial<{
    firstName: string
    lastName: string
    dob: Date
    gender: string
    mrn: string
    cnic: string
    address: string
    city: string
}>) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    const patient = await prisma.patient.update({
        where: { id },
        data
    })

    revalidatePath(`/admin`)
    return patient
}

export async function getAllPatients(workspaceId: string) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    return await prisma.patient.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function deletePatient(id: string) {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    await prisma.patient.delete({
        where: { id }
    })

    revalidatePath(`/admin`)
}
