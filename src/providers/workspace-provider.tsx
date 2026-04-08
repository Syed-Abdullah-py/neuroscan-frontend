"use client";

import {
    createContext,
    useContext,
    useState,
    useTransition,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
    /** The currently active workspace ID, or undefined if none */
    activeWorkspaceId: string | undefined;
    /** Switch to a different workspace — updates cookie + invalidates all queries */
    switchWorkspace: (workspaceId: string) => void;
    isSwitching: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

interface WorkspaceProviderProps {
    children: ReactNode;
    /** Initial active workspace ID, resolved server-side and passed as prop */
    initialWorkspaceId?: string;
}

export function WorkspaceProvider({
    children,
    initialWorkspaceId,
}: WorkspaceProviderProps) {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>(initialWorkspaceId);
    const [isSwitching, startTransition] = useTransition();
    const router = useRouter();
    const queryClient = useQueryClient();

    const switchWorkspace = useCallback(
        (workspaceId: string) => {
            if (workspaceId === activeWorkspaceId) return;

            startTransition(async () => {
                // Update cookie via server action
                const { setActiveWorkspaceCookie } = await import(
                    "@/features/workspaces/actions/workspace.actions"
                );
                await setActiveWorkspaceCookie(workspaceId);

                // Update local state immediately for instant UI response
                setActiveWorkspaceId(workspaceId);

                // Invalidate all workspace-scoped queries so they refetch with new ID
                await queryClient.invalidateQueries();

                // Refresh server components (layouts, page.tsx) to pick up new cookie
                router.refresh();
            });
        },
        [activeWorkspaceId, queryClient, router]
    );

    return (
        <WorkspaceContext.Provider
            value={{ activeWorkspaceId, switchWorkspace, isSwitching }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) {
        throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
    }
    return ctx;
}