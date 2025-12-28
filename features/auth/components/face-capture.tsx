"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaceCaptureProps {
    onCapture: (file: File) => void;
    label?: string;
}

export function FaceCapture({ onCapture, label = "Capture Face" }: FaceCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError("");
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera access denied or unavailable.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
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

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "face.jpg", { type: "image/jpeg" });
                    onCapture(file);
                    setCapturedImage(canvas.toDataURL("image/jpeg"));
                }
            }, "image/jpeg", 0.9);
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
