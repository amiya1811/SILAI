"use client";

import React, { useState, useEffect } from "react";
import { DeliveryJob } from "@/lib/types";
import {
  CheckCircle,
  AlertCircle,
  X,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import PhotoCaptureInput from "@/components/delivery/PhotoCaptureInput";

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
  const [packageCondition, setPackageCondition] = useState<
    "Package OK" | "Visible Damage" | "Packaging Issue" | "Other"
  >("Package OK");
  const [otpInput, setOtpInput] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhotoPreview(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

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

  const getStagePhotoLabel = (stg: VerificationStage) => {
    switch (stg) {
      case "CUSTOMER_PICKUP":
        return "Customer Pickup Photo Verification";
      case "TAILOR_HANDOVER":
        return "Tailor Studio Handover Photo Verification";
      case "FINISHED_PICKUP":
        return "Finished Garment Pickup Photo Verification";
      case "FINAL_DELIVERY":
        return "Customer Doorstep Delivery Photo Verification";
    }
  };

  const getStagePhotoHint = (stg: VerificationStage) => {
    switch (stg) {
      case "CUSTOMER_PICKUP":
        return "Open camera or upload a clear photo of the customer's fabric and packaging at physical pickup.";
      case "TAILOR_HANDOVER":
        return "Open camera or upload a photo showing physical package handover to the tailor studio.";
      case "FINISHED_PICKUP":
        return "Open camera or upload a clear photo of the finished garment inspected and received from the tailor.";
      case "FINAL_DELIVERY":
        return "Open camera or upload a photo of the completed outfit delivered to the customer.";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
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
            Order ID: <strong className="text-sand">{job?.orderNumber || "SIL-ORDER"}</strong> • {job?.garmentName || "Custom Stitching Garment"}
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
          <PhotoCaptureInput
            value={photoPreview}
            onChange={(dataUrl) => {
              setPhotoPreview(dataUrl);
              if (dataUrl) setErrorMessage(null);
            }}
            orderNumber={job?.orderNumber}
            label={getStagePhotoLabel(stage)}
            hint={getStagePhotoHint(stage)}
            isSubmitting={isSubmitting}
          />

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
                  : `Confirm ${(stage || "HANDOVER").replace(/_/g, " ")}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
