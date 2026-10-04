"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  FileImage,
  Clock,
  Video,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export interface PhotoCaptureInputProps {
  value?: string | null;
  onChange: (photoDataUrl: string | null, fileName?: string) => void;
  orderNumber?: string;
  label?: string;
  hint?: string;
  isSubmitting?: boolean;
  required?: boolean;
  className?: string;
}

export type PhotoInputState =
  | "no_photo"
  | "selecting"
  | "preview_ready"
  | "upload_failed"
  | "permission_denied";

export default function PhotoCaptureInput({
  value,
  onChange,
  orderNumber,
  label = "Verification Photo",
  hint = "Capture live photo or upload clear JPG, PNG or WebP image",
  isSubmitting = false,
  className = "",
}: PhotoCaptureInputProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(value || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [state, setState] = useState<PhotoInputState>(
    value ? "preview_ready" : "no_photo"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Desktop Live Camera fallback states (WebRTC)
  const [showLiveViewfinder, setShowLiveViewfinder] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync external value changes
  useEffect(() => {
    if (value && value !== photoPreview) {
      setPhotoPreview(value);
      setState("preview_ready");
      if (!timestamp) setTimestamp(new Date().toISOString());
    } else if (!value && photoPreview) {
      setPhotoPreview(null);
      setFileName(null);
      setState("no_photo");
    }
  }, [value]);

  // Clean up any active video streams on unmount
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowLiveViewfinder(false);
  };

  const handleOpenFilePicker = () => {
    setErrorMessage(null);
    stopLiveCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleOpenCamera = async () => {
    setErrorMessage(null);

    // On mobile devices, using <input capture="environment"> invokes the native device camera directly
    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
        cameraInputRef.current.click();
      }
      return;
    }

    // On desktop, try native camera input first; if supported we can also offer live webcam stream
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        setShowLiveViewfinder(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err: any) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setState("permission_denied");
          setErrorMessage(
            "Camera permission was denied. Please allow camera access in browser settings or use 'Choose from Files'."
          );
        } else {
          // Fall back to camera input file dialog
          if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
            cameraInputRef.current.click();
          }
        }
      }
    } else {
      // Fallback to camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
        cameraInputRef.current.click();
      }
    }
  };

  const handleCaptureFromLiveCamera = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const now = new Date().toISOString();
        const autoName = `camera_capture_${Date.now()}.jpg`;

        setPhotoPreview(dataUrl);
        setFileName(autoName);
        setTimestamp(now);
        setState("preview_ready");
        stopLiveCamera();
        onChange(dataUrl, autoName);
      }
    } catch (err) {
      setState("upload_failed");
      setErrorMessage("Could not capture frame from camera. Please choose from files.");
      stopLiveCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format: JPG, JPEG, PNG, WebP
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "webp"];

    const isMimeValid = file.type ? validMimes.includes(file.type.toLowerCase()) : false;
    const isExtValid = extension ? validExtensions.includes(extension) : false;

    if (!isMimeValid && !isExtValid) {
      setState("upload_failed");
      setErrorMessage(
        "Unsupported file format. Please choose an image file (JPG, JPEG, PNG, or WebP)."
      );
      return;
    }

    // Limit maximum size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setState("upload_failed");
      setErrorMessage("Image file exceeds 10MB limit. Please select a smaller photo.");
      return;
    }

    setState("selecting");
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setState("upload_failed");
        setErrorMessage("Failed to read image data. Please try again.");
        return;
      }

      const now = new Date().toISOString();
      setPhotoPreview(dataUrl);
      setFileName(file.name);
      setTimestamp(now);
      setState("preview_ready");
      onChange(dataUrl, file.name);
    };

    reader.onerror = () => {
      setState("upload_failed");
      setErrorMessage("Failed to load file. Please try selecting again.");
    };

    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    stopLiveCamera();
    setPhotoPreview(null);
    setFileName(null);
    setTimestamp("");
    setState("no_photo");
    setErrorMessage(null);
    onChange(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden Mobile / Desktop Camera Input with capture="environment" */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Capture verification photo from camera"
      />

      {/* Hidden File Picker Input for gallery/filesystem */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload verification photo from files"
      />

      {/* Live Viewfinder (Desktop webcam fallback) */}
      {showLiveViewfinder && (
        <div className="relative aspect-[4/3] w-full max-h-72 rounded-2xl overflow-hidden bg-black border-2 border-sand/40 flex flex-col items-center justify-center animate-in fade-in">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/80 border border-sand/30 text-[10px] font-mono text-sand flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Camera Active
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4">
            <button
              type="button"
              onClick={handleCaptureFromLiveCamera}
              className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 shadow-md flex items-center gap-1.5 transition"
            >
              <Camera className="w-4 h-4 text-sand-light" /> Snap Photo
            </button>
            <button
              type="button"
              onClick={stopLiveCamera}
              className="px-4 py-2 rounded-full text-xs font-medium bg-black/80 text-sand-light hover:bg-black border border-sand/30 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STATE 1: NO PHOTO SELECTED & NOT IN VIEWFINDER */}
      {!showLiveViewfinder && !photoPreview && (
        <div className="relative rounded-2xl border-2 border-dashed border-burgundy/30 dark:border-sand/30 bg-burgundy/5 dark:bg-[#0D080A]/60 p-5 sm:p-6 text-center space-y-3 transition hover:border-burgundy/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy to-maroon border border-sand/30 flex items-center justify-center mx-auto text-sand shadow-sm">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <h5 className="font-serif text-sm sm:text-base font-bold text-wine dark:text-sand-light">
              {label}
            </h5>
            <p className="text-xs text-maroon/80 dark:text-champagne/75 mt-0.5 leading-relaxed">
              {hint}
            </p>
            {orderNumber && (
              <span className="text-[10px] font-mono font-bold text-burgundy dark:text-sand bg-sand/30 dark:bg-burgundy/30 px-2 py-0.5 rounded border border-burgundy/20 dark:border-sand/20 inline-block mt-1">
                Order: {orderNumber}
              </span>
            )}
          </div>

          {/* TWO OBVIOUS ACTIONS: Open Camera + Choose from Files */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleOpenCamera}
              disabled={isSubmitting || state === "selecting"}
              className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-burgundy via-maroon to-burgundy text-sand-light border border-sand/40 hover:shadow-gold-glow hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-sand" />
              <span>Open Camera</span>
            </button>

            <button
              type="button"
              onClick={handleOpenFilePicker}
              disabled={isSubmitting || state === "selecting"}
              className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/90 dark:bg-wine/30 text-wine dark:text-sand-light border border-burgundy/25 dark:border-sand/30 hover:bg-white dark:hover:bg-wine/50 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-burgundy dark:text-sand" />
              <span>Choose from Files</span>
            </button>
          </div>

          <p className="text-[10px] font-mono text-maroon/60 dark:text-champagne/50">
            Accepts JPG, JPEG, PNG, WebP (Max 10MB)
          </p>
        </div>
      )}

      {/* STATE 2: SELECTING / PROCESSING */}
      {state === "selecting" && (
        <div className="p-4 rounded-xl bg-burgundy/10 dark:bg-wine/25 border border-burgundy/20 dark:border-sand/20 flex items-center justify-center gap-2 text-xs text-wine dark:text-sand font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-burgundy dark:text-sand" />
          <span>Processing photo and generating inspection preview...</span>
        </div>
      )}

      {/* STATE 3: PREVIEW READY */}
      {!showLiveViewfinder && photoPreview && (
        <div className="rounded-2xl border-2 border-emerald-600/40 dark:border-emerald-500/40 bg-[#FAF4E8] dark:bg-[#160B0E] p-4 space-y-3 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-burgundy/15 dark:border-sand/15 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Photo Selected ✓
              </span>
              {orderNumber && (
                <span className="text-[10px] font-mono text-maroon/70 dark:text-champagne/70 font-semibold">
                  {orderNumber}
                </span>
              )}
            </div>

            {timestamp && (
              <span className="text-[10px] font-mono text-maroon/70 dark:text-champagne/70 flex items-center gap-1">
                <Clock className="w-3 h-3 text-burgundy dark:text-sand" />
                {formatDateTime(timestamp)}
              </span>
            )}
          </div>

          {/* Visual Image Preview */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-64 w-full rounded-xl overflow-hidden bg-black/85 border border-sand/30 flex items-center justify-center">
            <img
              src={photoPreview}
              alt="Verification Preview"
              className="w-full h-full object-contain"
            />
          </div>

          {/* File Name & Verification Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <FileImage className="w-3.5 h-3.5 text-burgundy dark:text-sand flex-shrink-0" />
              <span className="font-mono text-[11px] text-wine dark:text-sand-light font-semibold truncate">
                {fileName || "inspection_capture.jpg"}
              </span>
            </div>

            {/* Retake / Choose Another / Remove Controls */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleOpenCamera}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-burgundy/10 dark:bg-burgundy/40 text-wine dark:text-sand border border-burgundy/25 dark:border-sand/30 hover:bg-burgundy/20 transition flex items-center gap-1"
                title="Retake with camera"
              >
                <Camera className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleOpenFilePicker}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/80 dark:bg-[#0D080A] text-wine dark:text-sand border border-burgundy/25 dark:border-sand/30 hover:bg-white transition flex items-center gap-1"
                title="Choose different photo file"
              >
                <RefreshCw className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
                <span>Choose Another</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-300 dark:border-rose-800 transition"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4 & 5: PERMISSION DENIED OR ERROR BANNER */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            {state === "permission_denied" && (
              <button
                type="button"
                onClick={handleOpenFilePicker}
                className="text-xs font-bold text-burgundy dark:text-sand underline hover:opacity-80"
              >
                Click here to choose an image from files instead
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
