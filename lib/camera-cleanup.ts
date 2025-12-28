"use client";

/**
 * Global Camera Cleanup Utility
 * 
 * This utility ensures that all camera streams are stopped, even if component cleanup fails.
 * Useful for handling edge cases where Next.js navigation happens before React cleanup.
 */

/**
 * Stops all active media streams globally.
 * Call this on page mount to ensure no lingering camera streams.
 */
export function forceStopAllCameraStreams() {
    console.log("[GlobalCameraCleanup] Checking for active media streams...");

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("[GlobalCameraCleanup] MediaDevices API not available");
        return;
    }

    // Get all video elements on the page
    const videoElements = document.querySelectorAll('video');
    let streamsStopped = 0;

    videoElements.forEach((video, index) => {
        if (video.srcObject && video.srcObject instanceof MediaStream) {
            console.log(`[GlobalCameraCleanup] Found active stream on video element ${index}`);
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
                console.log(`[GlobalCameraCleanup] Stopping track: ${track.label}, state: ${track.readyState}`);
                track.stop();
                streamsStopped++;
            });
            video.srcObject = null;
            video.src = "";
        }
    });

    console.log(`[GlobalCameraCleanup] Stopped ${streamsStopped} tracks across ${videoElements.length} video elements`);
}

/**
 * React hook to automatically cleanup camera streams on component mount.
 * Use this in pages where you want to ensure camera is stopped.
 */
export function useCameraCleanup() {
    if (typeof window !== 'undefined') {
        // Run cleanup on mount
        forceStopAllCameraStreams();
    }
}
