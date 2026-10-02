"use client";

import React, { useState, useRef, useEffect } from "react";
import { DeliveryJob } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  ShieldCheck,
  Package,
  KeyRound,
  Clock,
} from "lucide-react";

export type VerificationStage =
  | "CUSTOMER_PICKUP"
  | "TAILOR_HANDOVER"
  | "FINISHED_PICKUP"
  | "FINAL_DELIVERY";

interface PhotoVerificationModalProps {
  job: DeliveryJob;
  stage: VerificationStage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedJob: DeliveryJob) => void;
}

export default function PhotoVerificationModal({
  job,
  stage,
  isOpen,
  onClose,
  onSuccess,
}: PhotoVerificationModalProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [packageCondition, setPackageCondition] = useState<
    "Package OK" | "Visible Damage" | "Packaging Issue" | "Other"
  >("Package OK");
  const [otpInput, setOtpInput] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimestamp(new Date().toISOString());
      setPhotoPreview(null);
      setErrorMessage(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in browser settings or use file upload."
          : "Unable to access camera. Please use file upload below."
      );
      setCameraActive(false);
    }
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhotoPreview(dataUrl);
      setTimestamp(new Date().toISOString());
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setTimestamp(new Date().toISOString());
      stopCamera();
    }
  };

  const getStageTitle = () => {
    switch (stage) {
      case "CUSTOMER_PICKUP":
        return "Pickup Verification (Customer → Delivery Agent)";
      case "TAILOR_HANDOVER":
        return "Tailor Handover Verification (Delivery Agent → Tailor)";
      case "FINISHED_PICKUP":
        return "Finished Garment Pickup Verification (Tailor → Delivery Agent)";
      case "FINAL_DELIVERY":
        return "Final Delivery Verification (Delivery Agent → Customer)";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview) {
      setErrorMessage("Please capture or upload a verification photo.");
      return;
    }

    if (stage === "FINAL_DELIVERY" && (!otpInput || otpInput.trim().length !== 4)) {
      setErrorMessage("4-digit customer delivery OTP is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/deliveries/${job.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PHOTO_VERIFICATION",
          stage,
          photoUrl: photoPreview,
          packageCondition: stage === "CUSTOMER_PICKUP" ? packageCondition : undefined,
          otp: stage === "FINAL_DELIVERY" ? otpInput.trim() : undefined,
          notes: customerNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      onSuccess(data.job);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit photo verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-sand/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
              PHOTO SECURITY CHECK
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-sand-light mt-0.5">
            {getStageTitle()}
          </h3>
          <p className="text-xs text-champagne/70 font-mono mt-1">
            Order ID: <strong className="text-sand">{job.orderNumber}</strong> • {job.garmentName}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Capture Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-sand/80 uppercase">Photo Verification</span>
              {timestamp && (
                <span className="text-[10px] text-champagne/60 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sand" /> {formatDateTime(timestamp)}
                </span>
              )}
            </div>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-dashed border-sand/30 bg-wine/50 flex flex-col items-center justify-center p-2">
              {cameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={captureFromVideo}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-xs font-semibold bg-emerald-800 text-sand-light border border-sand/50 shadow-gold-glow flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo
                  </button>
                </div>
              ) : photoPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={photoPreview}
                    alt="Captured Verification"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-sand border border-sand/30 backdrop-blur-sm hover:bg-black transition flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retake Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-champagne border border-sand/30 backdrop-blur-sm hover:bg-black transition flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Different
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy/60 border border-sand/30 flex items-center justify-center mx-auto text-sand">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-champagne font-medium">
                      Capture photo at physical handover
                    </p>
                    <p className="text-[10px] text-champagne/60 mt-0.5">
                      Ensure garment/fabric and packaging are clearly visible
                    </p>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" /> Open Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-wine/80 text-champagne border border-sand/20 hover:border-sand/40 transition flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Upload Photo
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {cameraError && (
              <p className="text-[11px] text-rose-300 font-mono text-center">{cameraError}</p>
            )}
          </div>

          {/* Package Condition (Only for CUSTOMER_PICKUP) */}
          {stage === "CUSTOMER_PICKUP" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-sand uppercase">
                Package Condition at Pickup
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["Package OK", "Visible Damage", "Packaging Issue", "Other"] as const).map(
                  (cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setPackageCondition(cond)}
                      className={`p-2 rounded-xl border text-center font-medium transition ${
                        packageCondition === cond
                          ? "bg-burgundy text-sand border-sand shadow-sm"
                          : "bg-wine/60 text-champagne/70 border-sand/20 hover:border-sand/40"
                      }`}
                    >
                      {cond}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Final Delivery Verification: Customer Confirmation & OTP */}
          {stage === "FINAL_DELIVERY" && (
            <div className="space-y-3 pt-2 border-t border-sand/15">
              <div>
                <label className="block text-xs font-mono text-sand uppercase mb-1">
                  Customer Delivery Confirmation OTP (4-digits)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-sand" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="Enter 4-digit OTP provided by customer"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest text-sand bg-wine border border-sand/30 rounded-xl focus:outline-none focus:border-sand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-sand uppercase mb-1">
                  Customer Confirmation Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed to customer in person, sealed hanger cover"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-wine border border-sand/20 rounded-xl text-champagne focus:outline-none focus:border-sand"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !photoPreview}
              className="w-full py-3.5 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-sand" />
              <span>
                {isSubmitting
                  ? "Verifying & Recording Handover..."
                  : `Confirm ${stage.replace(/_/g, " ")}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
