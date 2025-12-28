"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth-actions";

export async function getDoctorDashboardStats() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "doctor" || !user.workspaceId) {
            return null;
        }

        // Find the specific member record for this user in this workspace
        const member = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId: user.workspaceId
                }
            }
        });

        if (!member) return null;

        const [totalCases, pendingCases, completedCases] = await Promise.all([
            prisma.case.count({
                where: { assignedToMemberId: member.id }
            }),
            prisma.case.count({
                where: { assignedToMemberId: member.id, status: "PENDING" }
            }),
            prisma.case.count({
                where: { assignedToMemberId: member.id, status: "COMPLETED" }
            })
        ]);

        return {
            totalCases,
            pendingCases,
            completedCases
        };

    } catch (error) {
        console.error("Error fetching doctor stats:", error);
        return null;
    }
}

export async function getRecentAssignedCases() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "doctor" || !user.workspaceId) {
            return [];
        }

        const member = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId: user.workspaceId
                }
            }
        });

        if (!member) return [];

        const cases = await prisma.case.findMany({
            where: { assignedToMemberId: member.id },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                patient: true
            }
        });

        return cases;

    } catch (error) {
        console.error("Error fetching recent cases:", error);
        return [];
    }
}
