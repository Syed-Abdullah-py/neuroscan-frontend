"use client";

import {
    createContext,
    useContext,
    useState,
    useTransition,
    useCallback,
    type ReactNode,
} from "react";

interface WorkspaceContextValue {
    activeWorkspaceId: string | undefined;
    token: string;
    switchWorkspace: (workspaceId: string) => void;
    isSwitching: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

interface WorkspaceProviderProps {
    children: ReactNode;
    initialWorkspaceId?: string;
    token: string;
}

export function WorkspaceProvider({
    children,
    initialWorkspaceId,
    token,
}: WorkspaceProviderProps) {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | undefined>(initialWorkspaceId);
    const [isSwitching, startTransition] = useTransition();

    const switchWorkspace = useCallback(
        (workspaceId: string) => {
            if (workspaceId === activeWorkspaceId) return;

            startTransition(async () => {
                const { setActiveWorkspaceCookie } = await import(
                    "@/features/workspaces/actions/workspace.actions"
                );
                await setActiveWorkspaceCookie(workspaceId);
                window.location.reload();
            });
        },
        [activeWorkspaceId]
    );

    return (
        <WorkspaceContext.Provider
            value={{ activeWorkspaceId, token, switchWorkspace, isSwitching }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) {
        throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
    }
    return ctx;
}