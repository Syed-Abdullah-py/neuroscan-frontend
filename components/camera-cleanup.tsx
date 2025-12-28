"use client";

import { useEffect } from "react";
import { forceStopAllCameraStreams } from "@/lib/camera-cleanup";

/**
 * Camera Cleanup Component
 * 
 * Add this component to any page where you want to ensure
 * all camera streams are stopped when the page loads.
 * 
 * Useful for handling edge cases where React component cleanup
 * doesn't complete before Next.js navigation.
 */
export function CameraCleanup() {
    useEffect(() => {
        // Run cleanup on mount
        forceStopAllCameraStreams();
    }, []);

    return null; // This component renders nothing
}
