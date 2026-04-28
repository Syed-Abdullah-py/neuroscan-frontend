"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Always stale - ensures invalidateQueries and polling always
                // trigger real fetches without a freshness window blocking them.
                staleTime: 0,
                // Disable caching completely
                gcTime: 0,
                // Don't retry 4xx - they won't self-heal
                retry: (failureCount, error: any) => {
                    if (error?.status >= 400 && error?.status < 500) return false;
                    return failureCount < 2;
                },
                // Medical app - don't refetch mid-read when user switches tabs
                refetchOnWindowFocus: false,
                // But do refetch when network comes back after being offline
                refetchOnReconnect: true,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
    if (typeof window === "undefined") return makeQueryClient();
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => getQueryClient());
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}