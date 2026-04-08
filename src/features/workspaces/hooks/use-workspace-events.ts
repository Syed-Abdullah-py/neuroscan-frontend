"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "./use-workspaces";
import { patientKeys } from "@/features/patients/hooks/use-patients";
import { caseKeys } from "@/features/cases/hooks/use-cases";
import type { WorkspaceSSEEvent } from "@/lib/types/workspace.types";

/**
 * Connects to the SSE proxy at /api/events and invalidates
 * the relevant React Query caches when workspace events arrive.
 *
 * The EventSource connects to our Next.js API route which injects
 * the Authorization header server-side — browsers can't set custom
 * headers on EventSource directly.
 */
export function useWorkspaceEvents(workspaceId: string | undefined) {
    const qc = useQueryClient();
    const esRef = useRef<EventSource | null>(null);
    // Track reconnect attempts to implement exponential backoff
    const reconnectDelay = useRef(1000);

    const connect = useCallback(() => {
        if (!workspaceId) return;

        // Close any existing connection before opening a new one
        esRef.current?.close();

        const url = `/api/events?workspaceId=${workspaceId}`;
        const es = new EventSource(url);
        esRef.current = es;

        es.onopen = () => {
            // Reset backoff on successful connection
            reconnectDelay.current = 1000;
        };

        es.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as WorkspaceSSEEvent;
                handleEvent(parsed);
            } catch {
                // Malformed event — ignore
            }
        };

        // Handle named events from the backend
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
                    const parsed = JSON.parse(event.data) as WorkspaceSSEEvent;
                    handleEvent({ ...parsed, type });
                } catch {
                    // Ignore
                }
            });
        });

        es.onerror = () => {
            es.close();
            esRef.current = null;

            // Exponential backoff: 1s → 2s → 4s → 8s → max 30s
            const delay = Math.min(reconnectDelay.current, 30000);
            reconnectDelay.current = delay * 2;

            setTimeout(connect, delay);
        };
    }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleEvent(event: WorkspaceSSEEvent) {
        switch (event.type) {
            case "member.invited":
            case "member.joined":
            case "member.removed":
                qc.invalidateQueries({
                    queryKey: workspaceKeys.members(workspaceId!),
                });
                qc.invalidateQueries({
                    queryKey: workspaceKeys.joinRequests(workspaceId!),
                });
                qc.invalidateQueries({
                    queryKey: workspaceKeys.invitations(workspaceId!),
                });
                break;

            case "patient.created":
                qc.invalidateQueries({
                    queryKey: patientKeys.list(workspaceId!),
                });
                break;

            case "case.created":
            case "case.updated":
                qc.invalidateQueries({
                    queryKey: caseKeys.list(workspaceId!),
                });
                qc.invalidateQueries({
                    queryKey: caseKeys.stats(workspaceId!),
                });
                qc.invalidateQueries({
                    queryKey: caseKeys.recent(workspaceId!),
                });
                break;
        }
    }

    useEffect(() => {
        connect();

        return () => {
            esRef.current?.close();
            esRef.current = null;
        };
    }, [connect]);
}