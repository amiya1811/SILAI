"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  TryOnDesign,
  CameraState,
  TryOnMode,
} from "@/lib/tryon/types";
import { DecartRealtimeVtoSession } from "@/lib/tryon/providers/decart";
import {
  Sparkles,
  Camera,
  CameraOff,
  Video,
  Upload,
  Trash2,
  RefreshCw,
  Scissors,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowRight,
  Info,
  Maximize2,
  X,
  Plus,
  SwitchCamera,
  Layers,
  ShoppingBag,
  Shield,
  Eye,
  Radio,
} from "lucide-react";

/**
 * Honest Fitting Lifecycle States:
 * idle -> camera-starting -> camera-ready -> connecting -> applying-design -> live-tryon-ready -> error
 */
export type FittingLifecycleState =
  | "idle"
  | "camera-starting"
  | "camera-ready"
  | "connecting"
  | "applying-design"
  | "live-tryon-ready"
  | "error";

export default function VirtualTryOnStudio() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // -------------------------------------------------------------
  // 1. Designs Workspace State (Empty by default: Requirement 7)
  // -------------------------------------------------------------
  const [designs, setDesigns] = useState<TryOnDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<TryOnDesign | null>(null);
  const [appliedDesign, setAppliedDesign] = useState<TryOnDesign | null>(null);
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);
  const designFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // 2. Camera & Video Stream State (Strict Privacy: OFF by default)
  // -------------------------------------------------------------
  const [cameraState, setCameraState] = useState<CameraState>("CAMERA_OFF");
  const [fittingState, setFittingState] = useState<FittingLifecycleState>("idle");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [showOriginalCamera, setShowOriginalCamera] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // -------------------------------------------------------------
  // 3. Decart Real-Time VTO Session & Stale Request Protection
  // -------------------------------------------------------------
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [isSwitchingGarment, setIsSwitchingGarment] = useState(false);
  const [vtoConnectionState, setVtoConnectionState] = useState<string>("disconnected");
  const decartSessionRef = useRef<DecartRealtimeVtoSession | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const currentRequestIdRef = useRef<number>(0);

  // -------------------------------------------------------------
  // 4. Fallback Customer Photo State (When camera is unavailable)
  // -------------------------------------------------------------
  const [tryOnMode, setTryOnMode] = useState<TryOnMode>("LIVE_VTO");
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [isPhotoGenerating, setIsPhotoGenerating] = useState(false);
  const [photoPreviewResult, setPhotoPreviewResult] = useState<string | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // 5. Drag and Drop State
  // -------------------------------------------------------------
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedDesign, setDraggedDesign] = useState<TryOnDesign | null>(null);

  // -------------------------------------------------------------
  // 6. UI Status & Notices
  // -------------------------------------------------------------
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Development-only diagnostic logger (Safe: never logs keys or images)
  const logDiagnostic = useCallback((event: string, details?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[SILAI VTO Diagnostics] ${event}`, details !== undefined ? details : "");
    }
  }, []);

  // -------------------------------------------------------------
  // 7. Initial Fetch of Saved Garments on Mount (Requirement 7)
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    fetch("/api/tryon/garments")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.garments)) {
          setDesigns(data.garments);
          // Keep selectedDesign and appliedDesign strictly null until user explicitly chooses
        }
      })
      .catch((err) => {
        logDiagnostic("Failed to fetch initial saved garments", err);
      });

    return () => {
      isMounted = false;
    };
  }, [logDiagnostic]);

  // -------------------------------------------------------------
  // 8. Reliable Camera Lifecycle & Element Binding (Root Cause Fix)
  // -------------------------------------------------------------
  const stopCameraStream = useCallback(() => {
    logDiagnostic("stopCameraStream triggered");

    // 1. Terminate Decart Realtime WebRTC Session
    if (decartSessionRef.current) {
      try {
        decartSessionRef.current.disconnect();
      } catch (e) {}
      decartSessionRef.current = null;
    }

    // 2. Stop camera hardware tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    remoteStreamRef.current = null;

    // 3. Clear video elements explicitly
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 4. Notify server to mark session STOPPED
    if (activeSessionIdRef.current) {
      fetch("/api/tryon/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionIdRef.current }),
      }).catch(() => {});
      activeSessionIdRef.current = null;
    }

    setCameraState("CAMERA_OFF");
    setFittingState("idle");
    setIsRealtimeActive(false);
    setIsSwitchingGarment(false);
    setAppliedDesign(null);
    setShowOriginalCamera(false);
  }, [logDiagnostic]);

  // Cleanup on unmount or navigate away (Requirement 3 & 8)
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Check multiple cameras for flip button
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Callback ref binding for local video: Guarantees stream attachment immediately upon DOM mount
  const setLocalVideoRef = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }
      node.muted = true;
      node.playsInline = true;
      node.autoplay = true;

      node.play().catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Camera Diagnostics] Autoplay error in callback ref:", err);
        }
      });
    }
  }, []);

  // Callback ref binding for remote Decart output video
  const setRemoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStreamRef.current) {
      if (node.srcObject !== remoteStreamRef.current) {
        node.srcObject = remoteStreamRef.current;
      }
      node.muted = true;
      node.playsInline = true;
      node.autoplay = true;

      node.play().catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Camera Diagnostics] Remote autoplay error in callback ref:", err);
        }
      });
    }
  }, []);

  // Supplementary effect to ensure local video is playing and visible whenever cameraState turns ACTIVE
  useEffect(() => {
    if (cameraState === "CAMERA_ACTIVE" && streamRef.current && localVideoRef.current) {
      const video = localVideoRef.current;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      video.play().catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Camera Diagnostics] Autoplay error in cameraState effect:", err);
        }
      });
    }
  }, [cameraState]);

  // Supplementary effect to ensure remote transformed video is playing whenever isRealtimeActive becomes true
  useEffect(() => {
    if (isRealtimeActive && remoteStreamRef.current && remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      if (video.srcObject !== remoteStreamRef.current) {
        video.srcObject = remoteStreamRef.current;
      }
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      video.play().catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Camera Diagnostics] Remote autoplay error in isRealtimeActive effect:", err);
        }
      });
    }
  }, [isRealtimeActive]);

  // Start Camera - ONLY on explicit user trigger (Never on page load)
  const startCamera = async (targetFacing: "user" | "environment" = facingMode): Promise<MediaStream | null> => {
    stopCameraStream();
    setErrorMessage(null);
    setFittingState("camera-starting");
    setCameraState("REQUESTING_PERMISSION");
    setTryOnMode("LIVE_VTO");

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState("CAMERA_UNAVAILABLE");
        setFittingState("error");
        setErrorMessage(
          t(
            "tryOn.cameraUnavailable",
            "Camera hardware is not available on this browser. You can use 'Try with a Photo'."
          )
        );
        return null;
      }

      // Audio is strictly false (Requirement 3 & 7)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // Verify live video track exists
      const videoTracks = stream.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0 || videoTracks[0].readyState !== "live") {
        throw new Error("No live video track returned from camera hardware.");
      }

      logDiagnostic("Live video track verified", {
        label: videoTracks[0].label,
        readyState: videoTracks[0].readyState,
      });

      streamRef.current = stream;
      setCameraState("CAMERA_ACTIVE");
      setFittingState("camera-ready");

      // Attach immediately to video element if already rendered
      if (localVideoRef.current) {
        const v = localVideoRef.current;
        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
        v.autoplay = true;
        await v.play().catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[Camera Diagnostics] Video play promise rejection:", err);
          }
        });
      }

      return stream;
    } catch (err: any) {
      logDiagnostic("Camera start failed", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraState("CAMERA_PERMISSION_DENIED");
      } else {
        setCameraState("CAMERA_UNAVAILABLE");
      }
      setFittingState("error");
      return null;
    }
  };

  const switchCamera = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // -------------------------------------------------------------
  // 9. Authoritative Garment Selection & Decart Lucy VTO Execution
  // -------------------------------------------------------------
  const executeTryOnWithGarment = async (garment: TryOnDesign) => {
    // Generate new request ID to reject any stale async race conditions (Requirement 5)
    const requestId = ++currentRequestIdRef.current;
    logDiagnostic("executeTryOnWithGarment initiated", { requestId, garmentId: garment.id, garmentTitle: garment.title });

    let activeStream = streamRef.current;

    // If camera is not active, start camera first
    if (!activeStream || cameraState !== "CAMERA_ACTIVE") {
      activeStream = await startCamera();
      if (!activeStream) return;
    }

    if (currentRequestIdRef.current !== requestId) {
      logDiagnostic("Superseded by newer request during camera startup", { requestId, current: currentRequestIdRef.current });
      return;
    }

    // 1. If Decart Real-Time session is ALREADY ACTIVE, switch garment directly in existing session!
    // (Requirement 6: In-Session garment switching without camera restart)
    if (decartSessionRef.current && decartSessionRef.current.isConnected()) {
      setIsSwitchingGarment(true);
      setFittingState("applying-design");
      try {
        await decartSessionRef.current.switchGarment(garment);
        if (currentRequestIdRef.current !== requestId) return;
        setAppliedDesign(garment);
        setFittingState("live-tryon-ready");
      } catch (err: any) {
        logDiagnostic("In-session garment switch failed", err);
        setErrorMessage("Could not switch garment in active session. Reconnecting...");
      } finally {
        setIsSwitchingGarment(false);
      }
      return;
    }

    // 2. Otherwise initiate new real-time WebRTC session
    setFittingState("connecting");
    setErrorMessage(null);

    try {
      // Fetch short-lived client token from secure backend (DECART_API_KEY never exposed)
      const tokenRes = await fetch("/api/tryon/token", { method: "POST" });
      const tokenData = await tokenRes.json();

      if (currentRequestIdRef.current !== requestId) return;

      if (!tokenRes.ok || !tokenData.success || !tokenData.token) {
        logDiagnostic("Decart token generation failed or unavailable", tokenData);
        setFittingState("camera-ready");
        setErrorMessage(
          tokenData.error || "Virtual Try-On service is temporarily unavailable. Your live camera mirror remains active."
        );
        // Honest state: NEVER claim "WEARING" when token fails
        setAppliedDesign(null);
        setIsRealtimeActive(false);
        return;
      }

      // Initialize Decart session
      const session = new DecartRealtimeVtoSession();
      decartSessionRef.current = session;

      // Connect camera stream to Decart Lucy VTO WebRTC endpoint
      await session.connect(tokenData.token, activeStream, {
        initialGarment: garment,
        onRemoteStream: (remoteStream) => {
          logDiagnostic("Decart onRemoteStream received", { tracks: remoteStream.getTracks().length });

          if (currentRequestIdRef.current !== requestId) {
            logDiagnostic("Ignoring stale onRemoteStream", { currentReq: currentRequestIdRef.current, streamReq: requestId });
            return;
          }

          remoteStreamRef.current = remoteStream;

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.muted = true;
            remoteVideoRef.current.playsInline = true;
            remoteVideoRef.current.autoplay = true;
            remoteVideoRef.current.play().catch((err) => {
              logDiagnostic("Remote video play error", err);
            });
          }

          setIsRealtimeActive(true);
          setFittingState("live-tryon-ready");
          // Honest state: Mark as wearing ONLY when stream is ready and confirmed
          setAppliedDesign(garment);
        },
        onConnectionChange: (state) => {
          logDiagnostic("Decart connection state", state);
          setVtoConnectionState(state);
        },
        onError: (err) => {
          logDiagnostic("Decart session error", err);
          if (currentRequestIdRef.current === requestId) {
            setFittingState("camera-ready");
            setErrorMessage(err?.message || "Real-Time Fitting Room connection interrupted. Local camera mirror remains active.");
            setIsRealtimeActive(false);
            setAppliedDesign(null);
          }
        },
      });

      // Register session in database for traceability
      fetch("/api/tryon/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedGarmentId: garment.id, provider: "DECART_LUCY" }),
      })
        .then((res) => res.json())
        .then((d) => {
          if (d.session?.id) activeSessionIdRef.current = d.session.id;
        })
        .catch(() => {});
    } catch (err: any) {
      logDiagnostic("Failed to connect Decart Real-Time VTO", err);
      if (currentRequestIdRef.current === requestId) {
        setFittingState("camera-ready");
        setErrorMessage(err?.message || "Could not connect to Decart Lucy VTO. Your live camera mirror remains active.");
        setIsRealtimeActive(false);
        setAppliedDesign(null);
      }
    }
  };

  // Authoritative selection function: single point of truth (Requirement 4)
  const selectDesign = useCallback(
    async (designId: string, triggerTryOn: boolean = false) => {
      const target = designs.find((d) => d.id === designId);
      if (!target) {
        logDiagnostic("selectDesign target not found", designId);
        return;
      }

      setSelectedDesign(target);
      setErrorMessage(null);

      if (triggerTryOn) {
        await executeTryOnWithGarment(target);
      }
    },
    [designs, logDiagnostic]
  );

  // -------------------------------------------------------------
  // 10. Design Upload & Delete Management
  // -------------------------------------------------------------
  const handleUploadDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // MIME type check
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        t("tryOn.uploadTypeError", "Unsupported image format. Allowed: PNG, JPG, JPEG, WEBP.")
      );
      return;
    }

    // Size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        t("tryOn.uploadSizeError", "Image exceeds 10MB limit. Please upload an optimized photo.")
      );
      return;
    }

    setIsUploadingDesign(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

      try {
        const res = await fetch("/api/tryon/garments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: cleanTitle,
            imageUrl: dataUrl,
            mimeType: file.type,
            fileSize: file.size,
          }),
        });

        const data = await res.json();
        const garmentId = data.garment?.id || `design_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        const newDesign: TryOnDesign = {
          id: garmentId,
          title: cleanTitle,
          imageUrl: dataUrl,
          category: data.garment?.category || "CUSTOM",
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        setDesigns((prev) => [newDesign, ...prev]);
        setSelectedDesign(newDesign);
      } catch (err) {
        const fallbackDesign: TryOnDesign = {
          id: `design_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle,
          imageUrl: dataUrl,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        setDesigns((prev) => [fallbackDesign, ...prev]);
        setSelectedDesign(fallbackDesign);
      } finally {
        setIsUploadingDesign(false);
        if (designFileInputRef.current) designFileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setIsUploadingDesign(false);
      setErrorMessage("Failed to read image file. Please try another image.");
    };

    reader.readAsDataURL(file);
  };

  // Delete / Remove Design from Workspace (Safely preserves historical orders)
  const handleDeleteDesign = async (designId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setDesigns((prev) => {
      const remaining = prev.filter((d) => d.id !== designId);
      if (selectedDesign?.id === designId) {
        setSelectedDesign(remaining.length > 0 ? remaining[0] : null);
      }
      if (appliedDesign?.id === designId) {
        setAppliedDesign(null);
      }
      return remaining;
    });

    try {
      await fetch(`/api/tryon/garments?id=${encodeURIComponent(designId)}`, { method: "DELETE" });
    } catch (err) {
      logDiagnostic("Delete garment error", err);
    }
  };

  // -------------------------------------------------------------
  // 11. Desktop Drag & Drop Handlers (Explicit Garment Identification)
  // -------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, design: TryOnDesign) => {
    e.dataTransfer.setData("text/plain", design.id);
    e.dataTransfer.setData("application/x-silai-design-id", design.id);
    e.dataTransfer.effectAllowed = "copy";
    setDraggedDesign(design);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedDesignId =
      e.dataTransfer.getData("application/x-silai-design-id") ||
      e.dataTransfer.getData("text/plain") ||
      draggedDesign?.id;

    if (droppedDesignId) {
      selectDesign(droppedDesignId, true);
    }
    setDraggedDesign(null);
  };

  // -------------------------------------------------------------
  // 12. Photo Fallback Mode (Legitimate Decart Photo Engine)
  // -------------------------------------------------------------
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        t("tryOn.uploadSizeError", "Image exceeds 10MB limit. Please upload an optimized photo.")
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomerPhoto(dataUrl);
      setTryOnMode("PHOTO_FALLBACK");
      stopCameraStream();
      setErrorMessage(null);
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePhotoPreview = async () => {
    if (!customerPhoto || !selectedDesign) return;

    setIsPhotoGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/try-on/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImage: customerPhoto,
          garmentImage: selectedDesign.imageUrl,
          garmentTitle: selectedDesign.title,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "AI Try-On Preview could not be processed.");
      } else {
        setPhotoPreviewResult(data.generatedImageUrl);
      }
    } catch (err: any) {
      setErrorMessage("Network error processing AI Try-On Preview.");
    } finally {
      setIsPhotoGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // 13. Save Result & Order Flow Handoff (Requirements 11 & 12)
  // -------------------------------------------------------------
  const handleSaveResult = async () => {
    let frameDataUrl: string | null = null;

    if (tryOnMode === "PHOTO_FALLBACK" && photoPreviewResult) {
      frameDataUrl = photoPreviewResult;
    } else {
      // Capture frame from active video element
      const targetVideo = isRealtimeActive && !showOriginalCamera ? remoteVideoRef.current : localVideoRef.current;
      if (targetVideo) {
        const canvas = hiddenCanvasRef.current || document.createElement("canvas");
        canvas.width = targetVideo.videoWidth || 1280;
        canvas.height = targetVideo.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(targetVideo, 0, 0, canvas.width, canvas.height);
          frameDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        }
      }
    }

    if (!frameDataUrl) return;

    // Trigger local download
    try {
      const link = document.createElement("a");
      link.href = frameDataUrl;
      link.download = `silai-vto-fitting-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {}

    // Save result to portfolio via API
    try {
      await fetch("/api/tryon/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designTitle: (appliedDesign || selectedDesign)?.title || "Live Fitting Result",
          designImageUrl: (appliedDesign || selectedDesign)?.imageUrl,
          capturedResultUrl: frameDataUrl,
        }),
      });
    } catch (e) {}

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Continue to Order Handoff (Requirement 11)
  const handleContinueToOrder = () => {
    const targetGarment = appliedDesign || selectedDesign;
    if (!targetGarment) return;

    try {
      localStorage.setItem(
        "silai_tryon_order_handoff",
        JSON.stringify({
          designId: targetGarment.id,
          title: targetGarment.title,
          category: targetGarment.category || "CUSTOM",
          referenceImageUrl: targetGarment.imageUrl,
          tryOnPreviewUrl: photoPreviewResult || null,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}

    router.push("/explore?source=tryon&design=" + encodeURIComponent(targetGarment.title));
  };

  const hasGenuineResult = Boolean(
    (isRealtimeActive && appliedDesign) || (tryOnMode === "PHOTO_FALLBACK" && photoPreviewResult)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hidden offscreen canvas for frame capture */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Header & Luxury Atelier Badge */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-burgundy/90 text-champagne border border-sand/40 text-xs font-mono tracking-widest uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sand animate-pulse" />
          <span>{t("tryOn.virtualAtelier", "SILAI VIRTUAL ATELIER")} • {t("tryOn.fittingRoom", "Digital Fitting Room")}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-wine dark:text-sand-light tracking-tight">
          {t("tryOn.liveTryOn", "Real-Time AI Virtual Try-On")}
        </h1>
        <p className="text-xs sm:text-sm text-maroon/80 dark:text-champagne/80 max-w-xl mx-auto leading-relaxed">
          {t(
            "tryOn.subtitle",
            "See clothing transform onto your live camera in real time. Move naturally, switch garments seamlessly, and order directly."
          )}
        </p>

        {/* Privacy Assurance */}
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-sand/90 bg-black/40 px-3 py-1 rounded-full border border-sand/20">
          <Shield className="w-3 h-3 text-sand" />
          <span>{t("tryOn.cameraPrivacyNotice", "Your camera is used only while Live Try-On is active.")}</span>
        </div>
      </div>

      {/* Global Error Notice */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-rose-900 dark:text-rose-100 font-serif">
              Virtual Fitting Notice
            </p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN TWO-PANEL WORKSPACE                                      */}
      {/* Desktop: Left = MY DESIGNS, Right = LIVE TRY-ON (Decart VTO)  */}
      {/* Mobile: Top = LIVE TRY-ON, Bottom = MY DESIGNS Carousel        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT PANEL: MY DESIGNS (Desktop 5 cols / Mobile order-2)    */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
          <div className="rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border-2 border-burgundy/20 dark:border-burgundy/40 p-5 sm:p-6 shadow-md space-y-5">
            {/* Header & Upload Button */}
            <div className="flex items-center justify-between gap-3 border-b border-burgundy/15 dark:border-burgundy/30 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                  {t("tryOn.myDesigns", "MY DESIGNS")}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-wine dark:text-sand-light flex items-center gap-2">
                  <span>{t("tryOn.myDesigns", "My Designs")}</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-burgundy/10 dark:bg-sand/15 text-burgundy dark:text-sand">
                    {designs.length}
                  </span>
                </h2>
              </div>

              {/* + Upload Design Button */}
              <button
                onClick={() => designFileInputRef.current?.click()}
                disabled={isUploadingDesign}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-burgundy hover:bg-maroon text-sand-light border border-sand/30 shadow-xs flex items-center gap-1.5 transition active:scale-95"
                title={t("tryOn.uploadDesignDesc", "Add dress, kurti, blouse, lehenga or suit")}
              >
                <Plus className="w-4 h-4 text-sand" />
                <span>{t("tryOn.uploadDesignBtn", "+ Upload Design")}</span>
              </button>
              <input
                ref={designFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleUploadDesign}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-maroon/70 dark:text-champagne/70 italic">
              {t(
                "tryOn.dragInstruction",
                "Drag any design onto the fitting mirror to try it on, or click 'Try On' below."
              )}
            </p>

            {/* Designs Grid / Clean Empty State (Requirement 7) */}
            {designs.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-burgundy/20 dark:border-sand/20 space-y-3">
                <Layers className="w-8 h-8 text-burgundy/40 dark:text-sand/40 mx-auto" />
                <p className="text-xs text-maroon/80 dark:text-champagne/80 font-medium">
                  {t(
                    "tryOn.noDesignsYet",
                    "No designs yet. Upload a garment to get started."
                  )}
                </p>
                <button
                  onClick={() => designFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand-light border border-sand/30 shadow-xs hover:bg-maroon transition"
                >
                  {t("tryOn.uploadDesignBtn", "+ Upload Design")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                {designs.map((design) => {
                  const isSelected = selectedDesign?.id === design.id;
                  const isCurrentlyWearing = isRealtimeActive && appliedDesign?.id === design.id;

                  return (
                    <div
                      key={design.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, design)}
                      onClick={() => selectDesign(design.id, false)}
                      className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col justify-between ${
                        isCurrentlyWearing
                          ? "border-emerald-500 ring-2 ring-emerald-400/40 shadow-md bg-emerald-950/20"
                          : isSelected
                          ? "border-burgundy dark:border-sand ring-2 ring-burgundy/20 dark:ring-sand/20 shadow-md bg-[#F2E5C6]/30 dark:bg-burgundy/20"
                          : "border-burgundy/20 dark:border-burgundy/40 bg-[#F2E5C6]/15 dark:bg-[#0D080A]/60 hover:border-burgundy/50 hover:shadow-xs"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/10">
                        <img
                          src={design.imageUrl}
                          alt={design.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isCurrentlyWearing && (
                            <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-[9px] font-mono text-white font-bold uppercase shadow-xs flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5 animate-pulse" />
                              <span>{t("tryOn.wearingBadge", "Wearing")}</span>
                            </div>
                          )}
                          {isSelected && !isCurrentlyWearing && (
                            <div className="px-2 py-0.5 rounded-md bg-burgundy/90 text-[9px] font-mono text-sand font-bold uppercase shadow-xs">
                              <span>{t("tryOn.selectedBadge", "Selected")}</span>
                            </div>
                          )}
                          {design.category && (
                            <div className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-mono text-sand font-semibold uppercase">
                              {design.category}
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteDesign(design.id, e)}
                          title={t("tryOn.deleteDesign", "Delete design")}
                          aria-label={`Delete design ${design.title}`}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-500/30 transition shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Info & Action */}
                      <div className="p-2.5 space-y-2">
                        <p className="text-xs font-serif font-bold text-wine dark:text-sand-light truncate" title={design.title}>
                          {design.title}
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDesign(design.id, true);
                          }}
                          className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold border shadow-xs flex items-center justify-center gap-1 transition ${
                            isCurrentlyWearing
                              ? "bg-emerald-600 text-white border-emerald-400 cursor-default"
                              : "bg-burgundy hover:bg-maroon text-sand-light border-sand/30 active:scale-95"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-sand" />
                          <span>
                            {isCurrentlyWearing
                              ? t("tryOn.wearingBadge", "Wearing")
                              : t("tryOn.tryOnBtn", "Try On")}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: LIVE MIRROR & DECART VTO (Desktop 7 cols)      */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-xl bg-[#080608] text-champagne min-h-[540px] flex flex-col justify-between ${
              isDragOver
                ? "border-sand ring-4 ring-sand/30 scale-[1.01]"
                : "border-burgundy/40 dark:border-burgundy/60"
            }`}
          >
            {/* Top Bar: Real-Time Status & Camera Controls */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-sand/15 bg-black/70 backdrop-blur-xs z-20">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRealtimeActive
                      ? "bg-emerald-500 animate-ping"
                      : cameraState === "CAMERA_ACTIVE"
                      ? "bg-amber-400"
                      : tryOnMode === "PHOTO_FALLBACK"
                      ? "bg-blue-400"
                      : "bg-neutral-500"
                  }`}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-sand font-bold">
                  {isRealtimeActive
                    ? t("tryOn.realtimeVtoActive", "Real-Time Lucy VTO Active")
                    : cameraState === "CAMERA_ACTIVE"
                    ? t("tryOn.liveMirrorBadge", "Live Mirror Active")
                    : tryOnMode === "PHOTO_FALLBACK"
                    ? t("tryOn.aiTryOnPreview", "AI Try-On Preview")
                    : t("tryOn.cameraOffBadge", "Camera Off")}
                </span>
              </div>

              {/* Active Camera / Session Controls */}
              {cameraState === "CAMERA_ACTIVE" && (
                <div className="flex items-center gap-2">
                  {/* Original Camera View Toggle (PiP verification feature) */}
                  {isRealtimeActive && (
                    <button
                      onClick={() => setShowOriginalCamera((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border flex items-center gap-1.5 transition ${
                        showOriginalCamera
                          ? "bg-sand text-wine border-sand font-bold"
                          : "bg-black/80 hover:bg-black text-champagne border-sand/30"
                      }`}
                      title={showOriginalCamera ? "Back to AI Fitting Output" : "Verify Original Camera"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {showOriginalCamera ? "Show AI VTO" : "Raw Camera"}
                      </span>
                    </button>
                  )}

                  {/* Switch camera front/back */}
                  {hasMultipleCameras && (
                    <button
                      onClick={switchCamera}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-[11px] text-champagne border border-sand/30 flex items-center gap-1.5 transition"
                      title={t("tryOn.switchCamera", "Switch Camera")}
                    >
                      <SwitchCamera className="w-3.5 h-3.5 text-sand" />
                      <span className="hidden sm:inline">{t("tryOn.switchCamera", "Switch")}</span>
                    </button>
                  )}

                  {/* Stop Camera */}
                  <button
                    onClick={stopCameraStream}
                    className="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-[11px] text-rose-200 border border-rose-800/60 flex items-center gap-1.5 transition active:scale-95"
                    title={t("tryOn.stopCamera", "Stop Camera")}
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>{t("tryOn.stopCamera", "Stop Camera")}</span>
                  </button>
                </div>
              )}

              {/* Photo Mode Controls */}
              {tryOnMode === "PHOTO_FALLBACK" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-[11px] text-champagne border border-sand/30 flex items-center gap-1 transition"
                  >
                    <Upload className="w-3 h-3 text-sand" />
                    <span>{t("tryOn.replacePhoto", "Change Photo")}</span>
                  </button>
                  <button
                    onClick={() => startCamera()}
                    className="px-2.5 py-1 rounded-lg bg-burgundy hover:bg-maroon text-[11px] text-sand-light border border-sand/30 flex items-center gap-1 transition"
                  >
                    <Camera className="w-3 h-3 text-sand" />
                    <span>{t("tryOn.switchToCamera", "Live Camera")}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden Photo Input */}
            <input
              ref={photoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Main Stage Area */}
            <div className="relative flex-1 flex items-center justify-center p-4">
              {/* ====================================================== */}
              {/* STAGE 1: REAL-TIME DECART & LIVE WEBCAM MIRROR         */}
              {/* ====================================================== */}
              {cameraState === "CAMERA_ACTIVE" ? (
                <div className="relative w-full aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden bg-neutral-950 border border-sand/20">
                  {/* Local Mirror Video (Webcam feed: Always visible unless AI VTO is active and not showing raw) */}
                  <video
                    ref={setLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                      isRealtimeActive && !showOriginalCamera
                        ? "opacity-0 absolute inset-0 pointer-events-none"
                        : "opacity-100 relative"
                    }`}
                  />

                  {/* Remote Transformed Stream (Decart Lucy VTO Output) */}
                  <video
                    ref={setRemoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      facingMode === "user" ? "transform -scale-x-100" : ""
                    } ${
                      isRealtimeActive && !showOriginalCamera
                        ? "opacity-100 relative"
                        : "opacity-0 absolute inset-0 pointer-events-none"
                    }`}
                  />

                  {/* Connecting Non-Intrusive Floating Glass Pill (Never black screen) */}
                  {fittingState === "connecting" && (
                    <div className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-sand/40 flex items-center justify-center gap-3 z-30 shadow-lg animate-in fade-in">
                      <div className="w-5 h-5 rounded-full border-2 border-sand border-t-transparent animate-spin" />
                      <div className="text-center">
                        <span className="text-xs font-serif font-bold text-sand block">
                          {t("tryOn.connectingDecart", "Connecting to Real-Time Fitting Room...")}
                        </span>
                        <span className="text-[10px] text-champagne/80 font-mono">
                          Initializing Decart Lucy VTO Engine
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Switching Garment Smooth Indicator */}
                  {isSwitchingGarment && (
                    <div className="absolute top-4 left-4 right-4 p-2.5 rounded-xl bg-black/85 border border-sand/40 text-center text-xs font-mono text-sand animate-pulse z-30 shadow-lg">
                      ✨ {t("tryOn.switchGarmentLive", "Changing your design...")}
                    </div>
                  )}

                  {/* Drag-over Target Feedback */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs border-4 border-sand border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-40 animate-in fade-in duration-150">
                      <div className="w-16 h-16 rounded-full bg-burgundy/80 border-2 border-sand flex items-center justify-center text-sand animate-bounce">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-sand-light tracking-wide">
                        {t("tryOn.dropDesignHere", "DROP DESIGN HERE TO TRY IT ON")}
                      </h4>
                      <p className="text-xs text-champagne/80 font-medium">
                        {t("tryOn.dropInstruction", "Release to drape this garment onto yourself")}
                      </p>
                    </div>
                  )}

                  {/* Bottom Real-Time Controls Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-sand/30 flex items-center justify-between gap-3 z-20">
                    <div className="text-xs truncate max-w-[50%]">
                      <span className="text-sand/70 block text-[10px] font-mono uppercase">
                        {appliedDesign
                          ? t("tryOn.wearingBadge", "Wearing") + ":"
                          : selectedDesign
                          ? t("tryOn.selectedBadge", "Selected") + ":"
                          : t("tryOn.liveMirrorBadge", "Live Mirror")}
                      </span>
                      <span className="font-bold text-sand truncate block">
                        {(appliedDesign || selectedDesign)?.title || "Ready to try on"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Try Another Design action when wearing */}
                      {appliedDesign && (
                        <button
                          onClick={() => {
                            setAppliedDesign(null);
                            setSelectedDesign(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-champagne border border-sand/20 transition hidden sm:inline-flex"
                        >
                          {t("tryOn.tryAnotherDesign", "Try Another")}
                        </button>
                      )}

                      {/* Save Result Button: Disabled until a genuine result exists */}
                      <button
                        onClick={handleSaveResult}
                        disabled={!hasGenuineResult}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                          hasGenuineResult
                            ? "bg-black/70 hover:bg-black text-champagne border-sand/40 cursor-pointer active:scale-95"
                            : "bg-neutral-900/60 text-neutral-500 border-neutral-800 cursor-not-allowed opacity-50"
                        }`}
                        title={hasGenuineResult ? t("tryOn.saveResultBtn", "Save Result") : "Available after try-on completes"}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {saveSuccess ? t("tryOn.saved", "Saved!") : t("tryOn.saveResultBtn", "Save")}
                        </span>
                      </button>

                      {/* Continue to Order Button: Disabled until a genuine result exists */}
                      <button
                        onClick={handleContinueToOrder}
                        disabled={!hasGenuineResult}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                          hasGenuineResult
                            ? "bg-gradient-to-r from-sand via-champagne to-sand-light text-wine border-sand/60 shadow-gold-glow hover:scale-105 active:scale-95 cursor-pointer"
                            : "bg-neutral-900/60 text-neutral-500 border-neutral-800 cursor-not-allowed opacity-50"
                        }`}
                        title={hasGenuineResult ? t("tryOn.continueToOrder", "Order") : "Select a garment to order"}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t("tryOn.continueToOrder", "Order")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : tryOnMode === "PHOTO_FALLBACK" ? (
                /* ==================================================== */
                /* STAGE 2: PHOTO FALLBACK MODE (Requirement 8)         */
                /* ==================================================== */
                <div className="w-full space-y-4 animate-in fade-in">
                  <div className="relative w-full aspect-[3/4] max-h-[540px] rounded-2xl overflow-hidden bg-black border border-sand/20">
                    {photoPreviewResult ? (
                      <img
                        src={photoPreviewResult}
                        alt="AI Try-On Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : customerPhoto ? (
                      <img
                        src={customerPhoto}
                        alt="Customer Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <Upload className="w-10 h-10 text-sand/60" />
                        <p className="text-xs text-champagne/80">Upload your photo to generate preview</p>
                        <button
                          onClick={() => photoFileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand-light border border-sand/30"
                        >
                          Select Photo
                        </button>
                      </div>
                    )}

                    {isPhotoGenerating && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
                        <div className="w-10 h-10 rounded-full border-2 border-sand border-t-transparent animate-spin" />
                        <p className="text-xs font-mono text-sand animate-pulse">
                          Generating AI Try-On Preview with Decart Lucy...
                        </p>
                      </div>
                    )}

                    {/* Bottom Action */}
                    {customerPhoto && !isPhotoGenerating && (
                      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/80 backdrop-blur-xs border border-sand/30 flex items-center justify-between gap-2 z-10">
                        <span className="text-xs font-serif font-bold text-sand truncate max-w-[45%]">
                          {selectedDesign?.title || "Choose a design"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleGeneratePhotoPreview}
                            disabled={!selectedDesign}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                              selectedDesign
                                ? "bg-burgundy hover:bg-maroon text-sand-light border-sand/30 active:scale-95"
                                : "bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed"
                            }`}
                          >
                            Generate Preview
                          </button>
                          {photoPreviewResult && (
                            <>
                              <button
                                onClick={handleSaveResult}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black text-sand border border-sand/30"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleContinueToOrder}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sand text-wine border border-sand-light"
                              >
                                Order
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Disclaimer for Photo Mode */}
                  <p className="text-[10px] text-champagne/60 text-center italic">
                    AI Try-On Preview is a visual estimation and does not represent live fitting, exact measurements, or final stitching.
                  </p>
                </div>
              ) : cameraState === "REQUESTING_PERMISSION" ? (
                /* ==================================================== */
                /* STAGE 3: REQUESTING PERMISSION STATE                  */
                /* ==================================================== */
                <div className="py-16 px-6 text-center space-y-3 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-burgundy/60 border border-sand/40 flex items-center justify-center mx-auto text-sand">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-sand-light">
                    {t("tryOn.requestingCamera", "Requesting camera access...")}
                  </h4>
                  <p className="text-xs text-champagne/70 max-w-xs mx-auto">
                    Please click "Allow" in your browser prompt to activate your live fitting mirror.
                  </p>
                </div>
              ) : cameraState === "CAMERA_PERMISSION_DENIED" ? (
                /* ==================================================== */
                /* STAGE 4: PERMISSION DENIED -> PHOTO FALLBACK          */
                /* ==================================================== */
                <div className="py-12 px-6 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-rose-950 border border-rose-600 flex items-center justify-center mx-auto text-rose-300">
                    <CameraOff className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-rose-200">
                      {t("tryOn.cameraDenied", "Camera access is required for Live Try-On.")}
                    </h4>
                    <p className="text-xs text-rose-300/80 leading-relaxed">
                      {t(
                        "tryOn.cameraDeniedDesc",
                        "Please allow camera permissions in your browser or try with a photo instead."
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => startCamera()}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-black text-champagne border border-sand/30 hover:bg-neutral-900 transition"
                    >
                      {t("tryOn.tryAgain", "Try Again")}
                    </button>
                    <button
                      onClick={() => {
                        setTryOnMode("PHOTO_FALLBACK");
                        photoFileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand-light border border-sand/30 hover:bg-maroon transition"
                    >
                      {t("tryOn.tryWithPhoto", "Try with a Photo")}
                    </button>
                  </div>
                </div>
              ) : (
                /* ==================================================== */
                /* STAGE 5: CAMERA OFF BY DEFAULT (Requirement 7)        */
                /* Clean Empty State: "Your live preview will appear here"*/
                /* ==================================================== */
                <div className="py-16 px-6 text-center space-y-5 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-burgundy/80 border-2 border-sand/40 flex items-center justify-center mx-auto text-sand shadow-gold-glow">
                    <Camera className="w-9 h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3 py-1 rounded-full bg-black/60 border border-sand/20 text-[10px] font-mono tracking-widest text-sand uppercase">
                      {t("tryOn.cameraOff", "Camera is Off")}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-sand-light">
                      {t("tryOn.livePreviewPlaceholder", "Your live preview will appear here")}
                    </h3>
                    <p className="text-xs text-champagne/80 leading-relaxed">
                      {t(
                        "tryOn.cameraOffDesc",
                        "Activate your camera to step into the digital fitting room and see real-time garment try-on."
                      )}
                    </p>
                  </div>

                  {/* Explicit User Activation Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => startCamera()}
                      className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-wine bg-gradient-to-r from-sand via-champagne to-sand-light border border-sand/60 shadow-gold-glow hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4 text-wine" />
                      <span>{t("tryOn.startLiveCamera", "Start Live Camera")}</span>
                    </button>

                    <button
                      onClick={() => {
                        setTryOnMode("PHOTO_FALLBACK");
                        photoFileInputRef.current?.click();
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-full font-semibold text-xs text-champagne bg-black/70 hover:bg-black border border-sand/30 transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-sand" />
                      <span>{t("tryOn.uploadPhoto", "Upload Photo")}</span>
                    </button>
                  </div>

                  {/* Drag and Drop Prompt */}
                  <div className="pt-4 border-t border-sand/15">
                    <p className="text-[11px] text-sand/60 font-mono">
                      {t("tryOn.dropDesignHere", "DROP DESIGN HERE TO TRY IT ON")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
