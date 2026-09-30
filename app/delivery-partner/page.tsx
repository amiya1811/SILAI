"use client";

import React, { useState, useEffect } from "react";
import { DeliveryJob } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
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
} from "lucide-react";

export default function DeliveryPartnerPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryJob[]>([]);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/deliveries");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries);
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

  const handleAction = async (jobId: string, action: string, otp?: string) => {
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/deliveries/${jobId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpErrors({ ...otpErrors, [jobId]: data.error || "Action failed" });
      } else {
        setSuccessMsg(data.message);
        setOtpErrors({ ...otpErrors, [jobId]: "" });
        await loadDeliveries();
      }
    } catch (err) {
      console.error("Delivery action error", err);
    }
  };

  // Earnings calculations
  const completedJobs = deliveries.filter((d) => d.status === "DELIVERED");
  const totalEarnings = completedJobs.reduce((sum, d) => sum + d.payoutAmount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-sand uppercase">
              DOORSTEP LOGISTICS HUB
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-0.5">
            Delivery Fleet Portal
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Partner: <strong className="text-sand">{user?.fullName || "Rahul Verma"}</strong> • 4.9★ Rating • Two-Wheeler
          </p>
        </div>

        {/* Quick Earnings Stat */}
        <div className="px-5 py-3 rounded-2xl bg-wine-dark/80 border border-sand/30 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-burgundy/60 border border-sand/30 flex items-center justify-center text-sand">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-sand uppercase block">
              Fleet Payout
            </span>
            <span className="font-serif text-xl font-bold text-emerald-400">
              {formatINR(totalEarnings + 260)}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Deliveries Queue */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-bold text-sand-light">
          Active Trips & Available Doorstep Pickups
        </h3>

        {deliveries.length === 0 ? (
          <p className="text-xs text-champagne/60 italic">No delivery jobs currently active.</p>
        ) : (
          <div className="space-y-4">
            {deliveries.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-wine-dark/80 border border-sand/20 hover:border-sand/40 transition space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand/15 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-burgundy/60 text-sand border border-sand/20">
                      {job.type.replace(/_/g, " ")}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-sand-light mt-1">
                      {job.garmentName}
                    </h4>
                    <p className="text-xs text-champagne/70 font-mono">
                      Order: {job.orderNumber} • Driver Payout:{" "}
                      <strong className="text-emerald-400 font-serif text-sm">
                        {formatINR(job.payoutAmount)}
                      </strong>
                    </p>
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase bg-sand/10 text-sand border border-sand/30">
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* Masked Route Information (Requirement 25) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Pickup Point (Masked)
                    </span>
                    <p className="text-champagne font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sand" />
                      {job.pickupAddressMasked}
                    </p>
                  </div>

                  <div>
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Drop Destination
                    </span>
                    <p className="text-champagne font-medium flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-sand" />
                      {job.dropAddressMasked}
                    </p>
                  </div>

                  <div>
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Trip Distance
                    </span>
                    <p className="text-champagne font-mono font-bold text-sand">
                      ~{job.distanceKm} km
                    </p>
                  </div>
                </div>

                {/* Job Action Controls */}
                <div className="pt-2 border-t border-sand/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-champagne/60 font-mono">
                    Customer masking enabled for driver & passenger safety.
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {job.status === "ASSIGNED" && (
                      <button
                        onClick={() => handleAction(job.id, "ACCEPT")}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-emerald-100 hover:bg-emerald-700 transition"
                      >
                        Accept Job ({formatINR(job.payoutAmount)})
                      </button>
                    )}

                    {job.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleAction(job.id, "PICKED_UP")}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand hover:bg-maroon transition"
                      >
                        Confirm Fabric / Outfit Picked Up
                      </button>
                    )}

                    {(job.status === "IN_TRANSIT" || job.status === "PICKED_UP") && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Customer OTP"
                          value={otpInputs[job.id] || ""}
                          onChange={(e) =>
                            setOtpInputs({ ...otpInputs, [job.id]: e.target.value })
                          }
                          className="w-32 px-3 py-1.5 text-xs text-center font-mono font-bold rounded-xl bg-wine border border-sand/30 text-sand tracking-widest placeholder:tracking-normal focus:outline-none focus:border-sand"
                        />
                        <button
                          onClick={() =>
                            handleAction(job.id, "VERIFY_OTP_COMPLETE", otpInputs[job.id])
                          }
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-800 to-teal-800 text-sand-light border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Verify OTP & Finish
                        </button>
                      </div>
                    )}

                    {job.status === "DELIVERED" && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Delivered & Verified
                      </span>
                    )}
                  </div>
                </div>

                {otpErrors[job.id] && (
                  <p className="text-xs text-rose-300 font-mono text-right">{otpErrors[job.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
