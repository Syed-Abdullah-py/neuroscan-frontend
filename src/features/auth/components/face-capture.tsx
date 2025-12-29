"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaceCaptureProps {
    onCapture: (file: File) => void;
    label?: string;
    shouldStop?: boolean; // Signal from parent to stop camera
}

export function FaceCapture({ onCapture, label = "Capture Face", shouldStop = false }: FaceCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        startCamera();

        // Add event listeners to ensure camera stops on navigation
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopCamera();
            }
        };

        const handleBeforeUnload = () => {
            stopCamera();
        };

        // Handle Next.js route changes
        const handleRouteChange = () => {
            stopCamera();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload);
        // Listen for Next.js navigation events
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            console.log("[FaceCapture] Component unmounting - cleanup running");
            stopCamera();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleBeforeUnload);
            window.removeEventListener('popstate', handleRouteChange);
            console.log("[FaceCapture] Cleanup complete");
        };
    }, []);

    // Stop camera when parent signals via shouldStop prop
    useEffect(() => {
        if (shouldStop) {
            stopCamera();
        }
    }, [shouldStop]);

    const startCamera = async () => {
        console.log("[FaceCapture] Starting camera");
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            console.log(`[FaceCapture] Camera started, tracks: ${mediaStream.getTracks().length}`);
            streamRef.current = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError("");
        } catch (err) {
            console.error("[FaceCapt ure] Error accessing camera:", err);
            setError("Camera access denied or unavailable.");
        }
    };

    const stopCamera = () => {
        console.log("[FaceCapture] ==== stopCamera called ====");
        let tracksStopped = 0;

        // Stop all tracks from streamRef
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            console.log(`[FaceCapture] StreamRef has ${tracks.length} tracks`);
            tracks.forEach(track => {
                console.log(`[FaceCapture] Stopping track: ${track.label}, state: ${track.readyState}`);
                track.stop();
                console.log(`[FaceCapture] Track after stop: ${track.readyState}`);
                tracksStopped++;
            });
            streamRef.current = null;
        } else {
            console.log("[FaceCapture] streamRef.current is null");
        }

        // More aggressive video element cleanup
        if (videoRef.current) {
            console.log("[FaceCapture] Cleaning video element");

            // Pause the video first
            videoRef.current.pause();

            // Stop tracks from srcObject if present
            if (videoRef.current.srcObject) {
                const videoStream = videoRef.current.srcObject as MediaStream;
                const tracks = videoStream.getTracks();
                console.log(`[FaceCapture] Video has ${tracks.length} tracks`);
                tracks.forEach(track => {
                    console.log(`[FaceCapture] Stopping video track: ${track.label}, state: ${track.readyState}`);
                    track.stop();
                    console.log(`[FaceCapture] Video track after stop: ${track.readyState}`);
                    tracksStopped++;
                });
            }

            // Clear srcObject
            videoRef.current.srcObject = null;

            // Also clear src attribute and reload to force cleanup
            videoRef.current.src = "";
            videoRef.current.load();

            console.log("[FaceCapture] Video element fully cleaned");
        } else {
            console.log("[FaceCapture] videoRef.current is null");
        }

        console.log(`[FaceCapture] ==== Total tracks stopped: ${tracksStopped} ====`);
        setStream(null);
    };

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Create image data URL synchronously
            const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(imageDataUrl);

            // *** STOP CAMERA IMMEDIATELY AND SYNCHRONOUSLY ***
            // This must happen BEFORE any async operations
            console.log("[FaceCapture] Stopping camera IMMEDIATELY on capture");
            stopCamera();

            // Convert dataURL to blob and file (async, but camera is already stopped)
            fetch(imageDataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "face.jpg", { type: "image/jpeg" });
                    // Small delay to ensure cleanup completes before triggering navigation
                    setTimeout(() => {
                        onCapture(file);
                    }, 50);
                });
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="relative overflow-hidden rounded-lg aspect-video w-full max-w-[320px] bg-black">
                {!capturedImage ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
                {!capturedImage ? (
                    <Button type="button" onClick={capture} disabled={!!error} className="gap-2">
                        <Camera className="w-4 h-4" />
                        {label}
                    </Button>
                ) : (
                    <Button type="button" onClick={retake} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Retake
                    </Button>
                )}

                {capturedImage && (
                    <div className="flex items-center text-green-600 text-sm font-medium gap-1">
                        <Check className="w-4 h-4" /> Ready
                    </div>
                )}
            </div>
        </div>
    );
}
