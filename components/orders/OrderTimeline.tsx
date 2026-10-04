"use client";

import React from "react";
import { OrderStatus } from "@/lib/types";
import {
  ShoppingBag,
  CreditCard,
  Calendar,
  Package,
  Scissors,
  CheckCircle,
  Truck,
  Home,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
  deliveryOtp?: string;
  isCorrectionFlow?: boolean;
  orderCreatedAt?: string;
}

// Complete 10-Stage Lifecycle for Bespoke Tailoring
const STAGES = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: ShoppingBag, desc: "Order details received" },
  { key: "PAID", label: "Payment Confirmed", icon: CreditCard, desc: "Payment secured" },
  { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled", icon: Calendar, desc: "Rider assigned" },
  { key: "PICKED_UP", label: "Picked Up", icon: Package, desc: "Fabric collected" },
  { key: "WITH_TAILOR", label: "At Tailor", icon: Home, desc: "Delivered to atelier" },
  { key: "STITCHING", label: "Stitching", icon: Scissors, desc: "Karigari in progress" },
  { key: "QUALITY_CHECK", label: "Quality Check", icon: ShieldCheck, desc: "Fit & seam verification" },
  { key: "READY", label: "Ready", icon: CheckCircle, desc: "Outfit packed" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck, desc: "Heading to doorstep" },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2, desc: "Delivered to customer" },
];

// 7-Stage Alteration Lifecycle
const CORRECTION_STAGES = [
  { key: "CORRECTION_REQUESTED", label: "Correction Requested" },
  { key: "CORRECTION_PICKUP", label: "Pickup Scheduled" },
  { key: "CORRECTION_PICKED_UP", label: "Garment Picked Up" },
  { key: "CORRECTION_WITH_TAILOR", label: "With Tailor for Correction" },
  { key: "CORRECTION_IN_PROGRESS", label: "Correction in Progress" },
  { key: "CORRECTION_RETURN_DELIVERY", label: "Ready for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderTimeline({
  status,
  deliveryOtp,
  isCorrectionFlow,
  orderCreatedAt,
}: OrderTimelineProps) {
  // Determine index of current stage for normal order
  const getStageIndex = (current: OrderStatus) => {
    switch (current) {
      case "DRAFT":
      case "PENDING_PAYMENT":
        return 0;
      case "PAID":
        return 1;
      case "PICKUP_SCHEDULED":
        return 2;
      case "PICKED_UP":
        return 3;
      case "WITH_TAILOR":
        return 4;
      case "STITCHING":
        return 5;
      case "READY":
        return 7; // Quality check completed, now ready
      case "OUT_FOR_DELIVERY":
        return 8;
      case "DELIVERED":
      case "COMPLETED":
        return 9;
      default:
        return 5;
    }
  };

  const getCorrectionStageIndex = (current: OrderStatus) => {
    switch (current) {
      case "CORRECTION_REQUESTED":
        return 0;
      case "CORRECTION_PICKUP":
        return 1;
      case "CORRECTION_WITH_TAILOR":
        return 3;
      case "CORRECTION_IN_PROGRESS":
        return 4;
      case "CORRECTION_RETURN_DELIVERY":
        return 5;
      case "COMPLETED":
      case "DELIVERED":
        return 6;
      default:
        return 1;
    }
  };

  const currentIndex = getStageIndex(status);
  const isCorrectionActive = isCorrectionFlow || (status ? status.toString().startsWith("CORRECTION") : false);

  return (
    <div className="w-full py-4 space-y-6">
      {/* Alteration Alert Banner if active */}
      {isCorrectionActive && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-rose-300 animate-spin flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-rose-200 text-sm">
                100% Fit Guarantee Correction in Progress
              </h5>
              <p className="text-xs text-rose-300/80">
                Doorstep pickup and re-crafting at zero extra cost to you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-rose-900 text-rose-100 font-mono font-medium border border-rose-700/60">
              {(status || "CORRECTION").replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}

      {/* OTP Delivery Alert Box if Out For Delivery */}
      {status === "OUT_FOR_DELIVERY" && deliveryOtp && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sand/30 via-champagne to-sand/20 dark:from-[#1A0E12] dark:via-[#251218] dark:to-[#1A0E12] border border-burgundy/30 dark:border-sand/30 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
              DELIVERY CONFIRMATION OTP
            </span>
            <p className="text-xs text-maroon dark:text-champagne mt-0.5">
              Share this 4-digit code with the delivery partner upon arrival:
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-champagne-light dark:bg-[#0D080A] border border-burgundy/40 dark:border-sand/40 font-mono text-xl tracking-[0.3em] font-bold text-burgundy dark:text-sand shadow-inner">
            {deliveryOtp}
          </div>
        </div>
      )}

      {/* Main 10-Stage Timeline */}
      <div className="rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-burgundy/15 dark:border-burgundy/30 pb-3">
          <h4 className="font-serif text-sm font-bold text-wine dark:text-sand-light flex items-center gap-2">
            <Clock className="w-4 h-4 text-burgundy dark:text-sand" /> Live Order Tracking Timeline
          </h4>
          <span className="text-[11px] font-mono text-burgundy/90 dark:text-sand/90 font-bold">
            {currentIndex + 1} of 10 Stages
          </span>
        </div>

        {/* Desktop / Tablet Timeline View */}
        <div className="hidden lg:grid grid-cols-10 gap-2 relative">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;
            const Icon = st.icon;

            return (
              <div
                key={st.key}
                className="flex flex-col items-center text-center relative group"
              >
                {/* Connecting Line */}
                {idx < STAGES.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors ${
                      idx < currentIndex ? "bg-burgundy dark:bg-sand/60" : "bg-burgundy/15 dark:bg-sand/15"
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    isCurrent
                      ? "bg-gradient-to-r from-burgundy to-maroon text-sand-light border-sand/40 shadow-sm scale-110 ring-2 ring-burgundy/30"
                      : isCompleted
                      ? "bg-maroon dark:bg-wine text-sand-light border-maroon dark:border-sand/30"
                      : "bg-sand/30 dark:bg-[#0D080A]/60 text-maroon/50 dark:text-champagne/40 border-burgundy/20 dark:border-sand/15"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Text Labels */}
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={`text-[11px] leading-tight font-medium ${
                      isCurrent
                        ? "text-burgundy dark:text-sand-light font-bold"
                        : isCompleted
                        ? "text-wine dark:text-champagne font-semibold"
                        : "text-maroon/60 dark:text-champagne/40"
                    }`}
                  >
                    {st.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono mt-0.5 uppercase tracking-wider ${
                      isCurrent
                        ? "text-emerald-800 dark:text-emerald-400 font-bold"
                        : isCompleted
                        ? "text-maroon/80 dark:text-champagne/70 font-medium"
                        : "text-maroon/40 dark:text-champagne/30"
                    }`}
                  >
                    {isCurrent ? "In Progress" : isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Compact Timeline View */}
        <div className="lg:hidden space-y-3">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;
            const Icon = st.icon;

            return (
              <div
                key={st.key}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition ${
                  isCurrent
                    ? "bg-burgundy/10 dark:bg-wine/30 border-burgundy/40 dark:border-sand/30 shadow-sm"
                    : isCompleted
                    ? "bg-sand/20 dark:bg-[#0D080A]/40 border-burgundy/15 dark:border-sand/15 text-wine dark:text-champagne"
                    : "bg-transparent border-transparent opacity-50"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    isCurrent
                      ? "bg-burgundy text-sand-light border-burgundy"
                      : isCompleted
                      ? "bg-maroon dark:bg-wine text-sand-light border-maroon dark:border-sand/30"
                      : "bg-sand/30 dark:bg-[#0D080A]/60 text-maroon/50 dark:text-champagne/40 border-burgundy/20 dark:border-sand/15"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-burgundy dark:text-sand-light font-bold"
                          : isCompleted
                          ? "text-wine dark:text-champagne font-semibold"
                          : "text-maroon/60 dark:text-champagne/40 font-medium"
                      }`}
                    >
                      {st.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        isCurrent
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold"
                          : isCompleted
                          ? "bg-burgundy/10 dark:bg-wine/30 text-maroon dark:text-champagne font-medium"
                          : "text-maroon/50 dark:text-champagne/40"
                      }`}
                    >
                      {isCurrent ? "In Progress" : isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-maroon/80 dark:text-champagne/70 mt-0.5">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
