"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DeliveryJob } from "@/lib/types";
import { formatINR, formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import PhotoVerificationModal, {
  VerificationStage,
} from "@/components/delivery/PhotoVerificationModal";
import {
  Truck,
  MapPin,
  CheckCircle,
  KeyRound,
  ShieldCheck,
  Package,
  Navigation,
  DollarSign,
  AlertCircle,
  Camera,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function DeliveryPartnerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryJob[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Role locking guard: prevent URL tampering
  useEffect(() => {
    if (user) {
      if (user.role === "CUSTOMER") {
        router.replace("/dashboard");
      } else if (user.role === "TAILOR") {
        router.replace("/tailor-studio");
      }
    }
  }, [user, router]);

  // Photo Verification Modal state
  const [activeVerification, setActiveVerification] = useState<{
    job: DeliveryJob;
    stage: VerificationStage;
  } | null>(null);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/deliveries");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
      }
    } catch (err) {
      console.error("Failed to load deliveries", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleAcceptJob = async (jobId: string) => {
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/deliveries/${jobId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Job accepted! Proceed to pickup location.");
        await loadDeliveries();
      }
    } catch (err) {
      console.error("Failed to accept job", err);
    }
  };

  // Determine which verification stage is appropriate for the active job
  const getNextVerificationStage = (job: DeliveryJob): VerificationStage => {
    if (job.status === "ACCEPTED") {
      if (job.type === "TAILOR_TO_CUSTOMER") {
        return "FINISHED_PICKUP";
      }
      return "CUSTOMER_PICKUP";
    }
    if (job.status === "PICKED_UP" && job.type === "CUSTOMER_TO_TAILOR") {
      return "TAILOR_HANDOVER";
    }
    return "FINAL_DELIVERY";
  };

  const getVerificationButtonLabel = (job: DeliveryJob): { label: string; stage: VerificationStage } => {
    if (job.status === "ACCEPTED") {
      if (job.type === "TAILOR_TO_CUSTOMER") {
        return { label: "1. Take Finished Garment Pickup Photo", stage: "FINISHED_PICKUP" };
      }
      return { label: "1. Take Customer Pickup Photo", stage: "CUSTOMER_PICKUP" };
    }
    if (job.status === "PICKED_UP" && job.type === "CUSTOMER_TO_TAILOR") {
      return { label: "2. Take Tailor Handover Photo", stage: "TAILOR_HANDOVER" };
    }
    return { label: "4. Verify Delivery Photo & Enter OTP", stage: "FINAL_DELIVERY" };
  };

  // Earnings calculations
  const completedJobs = (deliveries || []).filter((d) => d?.status === "DELIVERED");
  const totalEarnings = completedJobs.reduce((sum, d) => sum + (d?.payoutAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/20 dark:border-burgundy/30 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-sand dark:text-sand font-bold uppercase">
              DOORSTEP LOGISTICS & SECURITY
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light dark:text-sand-light mt-0.5">
            Delivery Fleet Portal
          </h1>
          <p className="text-xs text-champagne-light/90 dark:text-champagne/80 mt-0.5">
            Partner: <strong className="text-sand font-bold">{user?.fullName || "Rahul Verma"}</strong> • Two-Wheeler • Photo Security Active
          </p>
        </div>

        {/* Quick Earnings Stat */}
        <div className="px-5 py-3 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-sm flex items-center gap-3 text-wine dark:text-champagne">
          <div className="w-10 h-10 rounded-xl bg-burgundy/10 dark:bg-burgundy/30 border border-burgundy/20 dark:border-sand/20 flex items-center justify-center text-burgundy dark:text-sand">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-maroon dark:text-sand/80 font-bold uppercase block">
              Fleet Payout
            </span>
            <span className="font-serif text-xl font-bold text-emerald-800 dark:text-emerald-400">
              {formatINR(totalEarnings + 260)}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Security Check Workflow Infographic */}
      <div className="p-5 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 space-y-3 text-wine dark:text-champagne shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono tracking-wider text-deep-wine dark:text-sand uppercase font-bold flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-burgundy dark:text-sand" /> Mandatory 4-Moment Photo Security Check
          </span>
          <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-bold">Dispute-Proof Guarantee</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40">
            <span className="font-bold text-deep-wine dark:text-sand block text-[11px]">Moment 1</span>
            <p className="text-maroon dark:text-champagne/80 text-[11px] mt-0.5 font-medium">Customer Pickup + Package Condition</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40">
            <span className="font-bold text-deep-wine dark:text-sand block text-[11px]">Moment 2</span>
            <p className="text-maroon dark:text-champagne/80 text-[11px] mt-0.5 font-medium">Tailor Handover Photo</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40">
            <span className="font-bold text-deep-wine dark:text-sand block text-[11px]">Moment 3</span>
            <p className="text-maroon dark:text-champagne/80 text-[11px] mt-0.5 font-medium">Finished Garment Pickup</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40">
            <span className="font-bold text-deep-wine dark:text-sand block text-[11px]">Moment 4</span>
            <p className="text-maroon dark:text-champagne/80 text-[11px] mt-0.5 font-medium">Final Delivery Photo + 4-digit OTP</p>
          </div>
        </div>
      </div>

      {/* Deliveries Queue */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-bold text-sand-light dark:text-sand-light">
          Active Trips & Doorstep Assignments
        </h3>

        {deliveries.length === 0 ? (
          <p className="text-xs text-champagne/70 italic">No delivery jobs currently active.</p>
        ) : (
          <div className="space-y-4">
            {deliveries.map((job) => {
              const actionInfo = getVerificationButtonLabel(job);

              return (
                <div
                  key={job.id}
                  className="p-6 rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/40 transition space-y-4 shadow-card-luxury text-wine dark:text-champagne"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-burgundy/15 dark:border-burgundy/30 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-burgundy/10 dark:bg-burgundy/40 text-wine dark:text-sand border border-burgundy/30 dark:border-sand/30 font-bold">
                        {(job.type || "CUSTOMER_TO_TAILOR").replace(/_/g, " ")}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-deep-wine dark:text-sand-light mt-1">
                        {job.garmentName || "Custom Garment"}
                      </h4>
                      <p className="text-xs text-maroon dark:text-champagne/80 font-mono font-medium">
                        Order: <strong className="text-deep-wine dark:text-sand font-bold">{job.orderNumber || "N/A"}</strong> • Driver Payout:{" "}
                        <strong className="text-emerald-800 dark:text-emerald-400 font-serif text-sm font-bold">
                          {formatINR(job.payoutAmount)}
                        </strong>
                      </p>
                    </div>

                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-burgundy/10 dark:bg-burgundy/30 text-wine dark:text-sand border border-burgundy/30 dark:border-sand/30">
                        {(job.status || "ASSIGNED").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Masked Route Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/15 dark:border-burgundy/30">
                      <span className="text-maroon dark:text-sand/80 font-mono uppercase text-[10px] block mb-1 font-bold">
                        Pickup Point (Masked)
                      </span>
                      <p className="text-wine dark:text-champagne-light font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-burgundy dark:text-sand flex-shrink-0" />
                        <span>{job.pickupAddressMasked || "Address masked for security"}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/15 dark:border-burgundy/30">
                      <span className="text-maroon dark:text-sand/80 font-mono uppercase text-[10px] block mb-1 font-bold">
                        Drop Destination
                      </span>
                      <p className="text-wine dark:text-champagne-light font-semibold flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-burgundy dark:text-sand flex-shrink-0" />
                        <span>{job.dropAddressMasked || "Address masked for security"}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/15 dark:border-burgundy/30">
                      <span className="text-maroon dark:text-sand/80 font-mono uppercase text-[10px] block mb-1 font-bold">
                        Trip Distance
                      </span>
                      <p className="text-wine dark:text-champagne-light font-mono font-bold text-sm">
                        ~{job.distanceKm} km
                      </p>
                    </div>
                  </div>

                  {/* Photo Verification Audit Badges if already taken */}
                  {(job.pickupPhotoUrl || job.finalDeliveryPhotoUrl) && (
                    <div className="p-3 rounded-2xl bg-burgundy/10 dark:bg-wine/40 border border-burgundy/20 dark:border-sand/15 flex flex-wrap items-center gap-4 text-xs">
                      {job.pickupPhotoUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={job.pickupPhotoUrl}
                            alt="Pickup Photo"
                            className="w-10 h-10 object-cover rounded-lg border border-burgundy/30 dark:border-sand/30"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 block font-bold">
                              Pickup Photo Recorded ✓
                            </span>
                            <span className="text-[10px] text-maroon dark:text-champagne/80 font-medium">
                              Condition: {job.packageCondition || "Package OK"}
                            </span>
                          </div>
                        </div>
                      )}

                      {job.finalDeliveryPhotoUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={job.finalDeliveryPhotoUrl}
                            alt="Delivery Photo"
                            className="w-10 h-10 object-cover rounded-lg border border-burgundy/30 dark:border-sand/30"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 block font-bold">
                              Final Delivery Photo Recorded ✓
                            </span>
                            <span className="text-[10px] text-maroon dark:text-champagne/80 font-medium">
                              OTP Verified ✓
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Job Action Controls */}
                  <div className="pt-2 border-t border-burgundy/15 dark:border-sand/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-maroon/80 dark:text-champagne/80 font-mono font-medium">
                      Timestamped camera verification required at every milestone.
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {job.status === "ASSIGNED" && (
                        <button
                          onClick={() => handleAcceptJob(job.id)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-700 transition"
                        >
                          Accept Job ({formatINR(job.payoutAmount)})
                        </button>
                      )}

                      {job.status !== "ASSIGNED" && job.status !== "DELIVERED" && (
                        <button
                          onClick={() =>
                            setActiveVerification({
                              job,
                              stage: actionInfo.stage,
                            })
                          }
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-1.5 text-sand-light"
                        >
                          <Camera className="w-3.5 h-3.5 text-sand" />
                          <span>{actionInfo.label}</span>
                        </button>
                      )}

                      {job.status === "DELIVERED" && (
                        <span className="text-xs text-emerald-800 dark:text-emerald-400 font-mono flex items-center gap-1 font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-800 dark:text-emerald-400" /> Fully Verified & Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo Verification Modal */}
      {activeVerification && (
        <PhotoVerificationModal
          job={activeVerification.job}
          stage={activeVerification.stage}
          isOpen={!!activeVerification}
          onClose={() => setActiveVerification(null)}
          onSuccess={(updatedJob) => {
            setActiveVerification(null);
            setSuccessMsg("Photo verification logged and verified on server!");
            loadDeliveries();
          }}
        />
      )}
    </div>
  );
}
