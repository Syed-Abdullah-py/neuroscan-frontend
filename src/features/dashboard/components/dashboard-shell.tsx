"use client";

import { useWorkspaceEvents, useInvitationPolling } from "@/features/workspaces/hooks/use-workspace-events";
import { AdminDashboard } from "./admin-dashboard";
import { DoctorDashboard } from "./doctor-dashboard";
import { NoWorkspaceState } from "./no-workspace-state";
import type { WorkspaceRole } from "@/lib/types/workspace.types";
import type { CaseStats } from "@/lib/types/case.types";

interface DashboardShellProps {
    user: {
        id: string;
        name: string;
        email: string;
        globalRole: "ADMIN" | "RADIOLOGIST";
        avatar: string;
        workspaceId?: string;
    };
    workspaceRole: WorkspaceRole | null;
    workspaceId: string | null;
    initialStats: CaseStats | null;
    initialRecentCases: any[];
    initialMembers: any[];
    initialJoinRequests: any[];
}

export function DashboardShell({
    user,
    workspaceRole,
    workspaceId,
    initialStats,
    initialRecentCases,
    initialMembers,
    initialJoinRequests,
}: DashboardShellProps) {
    useWorkspaceEvents(workspaceId ?? undefined);
    // Polls /workspaces/invitations/mine every 30s — SSE can't reach
    // users who aren't yet workspace members
    useInvitationPolling();

    if (!workspaceId) {
        return <NoWorkspaceState globalRole={user.globalRole} />;
    }

    const isAdminRole =
        workspaceRole === "OWNER" || workspaceRole === "ADMIN";

    if (isAdminRole) {
        return (
            <AdminDashboard
                user={user}
                workspaceId={workspaceId}
                workspaceRole={workspaceRole!}
                initialStats={initialStats}
                initialRecentCases={initialRecentCases}
                initialMembers={initialMembers}
                initialJoinRequests={initialJoinRequests}
            />
        );
    }

    return (
        <DoctorDashboard
            user={user}
            workspaceId={workspaceId}
            initialStats={initialStats}
            initialRecentCases={initialRecentCases}
        />
    );
}