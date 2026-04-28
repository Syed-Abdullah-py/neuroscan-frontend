"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "./use-workspaces";
import { patientKeys } from "@/features/patients/hooks/use-patients";
import { caseKeys } from "@/features/cases/hooks/use-cases";
import type { WorkspaceSSEEvent } from "@/lib/types/workspace.types";

export function useWorkspaceEvents(workspaceId: string | undefined) {
    const qc = useQueryClient();
    const esRef = useRef<EventSource | null>(null);
    const reconnectDelay = useRef(1000);

    const handleEvent = useCallback(
        (event: WorkspaceSSEEvent) => {
            if (!workspaceId) return;

            switch (event.type) {
                case "member.invited":
                    // Invalidate the workspace's sent invitations list (admin sees this)
                    qc.invalidateQueries({
                        queryKey: workspaceKeys.invitations(workspaceId),
                    });
                    break;

                case "member.joined":
                    qc.invalidateQueries({
                        queryKey: workspaceKeys.members(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: workspaceKeys.joinRequests(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: workspaceKeys.lists(),
                    });
                    break;

                case "member.removed":
                    qc.invalidateQueries({
                        queryKey: workspaceKeys.members(workspaceId),
                    });
                    break;

                case "patient.created":
                    qc.invalidateQueries({
                        queryKey: patientKeys.list(workspaceId),
                    });
                    break;

                case "case.created":
                    qc.invalidateQueries({
                        queryKey: caseKeys.list(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: caseKeys.stats(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: caseKeys.recent(workspaceId),
                    });
                    break;

                case "case.updated":
                    qc.invalidateQueries({
                        queryKey: caseKeys.list(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: caseKeys.stats(workspaceId),
                    });
                    qc.invalidateQueries({
                        queryKey: caseKeys.recent(workspaceId),
                    });
                    break;
            }
        },
        [workspaceId, qc]
    );

    const connect = useCallback(() => {
        if (!workspaceId) return;

        esRef.current?.close();

        const es = new EventSource(`/api/events?workspaceId=${workspaceId}`);
        esRef.current = es;

        es.onopen = () => {
            reconnectDelay.current = 1000;
        };

        // Handle both generic messages and named events
        es.onmessage = (event) => {
            // Skip keepalive comments
            if (!event.data || event.data.trim() === "") return;
            try {
                const parsed = JSON.parse(event.data) as WorkspaceSSEEvent;
                handleEvent(parsed);
            } catch {
                // Not JSON - ignore (heartbeat comments come through here too)
            }
        };

        const eventTypes: WorkspaceSSEEvent["type"][] = [
            "member.invited",
            "member.joined",
            "member.removed",
            "patient.created",
            "case.created",
            "case.updated",
        ];

        eventTypes.forEach((type) => {
            es.addEventListener(type, (event: MessageEvent) => {
                try {
                    const parsed = JSON.parse(event.data);
                    handleEvent({ ...parsed, type });
                } catch {
                    handleEvent({ type, payload: {} });
                }
            });
        });

        es.onerror = () => {
            es.close();
            esRef.current = null;
            const delay = Math.min(reconnectDelay.current, 30000);
            reconnectDelay.current = delay * 2;
            setTimeout(connect, delay);
        };
    }, [workspaceId, handleEvent]);

    useEffect(() => {
        connect();
        return () => {
            esRef.current?.close();
            esRef.current = null;
        };
    }, [connect]);
}
