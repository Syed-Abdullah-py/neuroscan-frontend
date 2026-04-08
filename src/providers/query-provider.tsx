"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data is considered fresh for 30 seconds
                staleTime: 30 * 1000,
                // Keep unused data in cache for 5 minutes
                gcTime: 5 * 60 * 1000,
                // Don't retry on 4xx errors — they won't fix themselves
                retry: (failureCount, error: any) => {
                    if (error?.status >= 400 && error?.status < 500) return false;
                    return failureCount < 2;
                },
                // Don't refetch when window regains focus in a medical app
                // — doctors shouldn't see data flicker mid-read
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

// Singleton for server — prevents new client on every server render
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === "undefined") {
        // Server: always make a new client
        return makeQueryClient();
    }
    // Browser: reuse existing client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // useState ensures client isn't recreated on re-renders
    const [queryClient] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}