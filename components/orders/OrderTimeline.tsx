"use client";

import React from "react";
import { OrderStatus } from "@/lib/types";
import {
  CreditCard,
  Calendar,
  Package,
  Scissors,
  CheckCircle,
  Truck,
  Home,
  RefreshCw,
} from "lucide-react";

interface OrderTimelineProps {
  status: OrderStatus;
  deliveryOtp?: string;
  isCorrectionFlow?: boolean;
}

const STAGES = [
  { key: "PAID", label: "Confirmed & Paid", icon: CreditCard },
  { key: "PICKUP_SCHEDULED", label: "Pickup Scheduled", icon: Calendar },
  { key: "PICKED_UP", label: "Fabric Picked Up", icon: Package },
  { key: "WITH_TAILOR", label: "With Master Tailor", icon: Scissors },
  { key: "STITCHING", label: "In Tailoring / Karigari", icon: Scissors },
  { key: "READY", label: "Quality Inspected & Ready", icon: CheckCircle },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered to Doorstep", icon: Home },
];

export default function OrderTimeline({
  status,
  deliveryOtp,
  isCorrectionFlow,
}: OrderTimelineProps) {
  // Determine index of current stage
  const getStageIndex = (current: OrderStatus) => {
    switch (current) {
      case "PENDING_PAYMENT":
      case "DRAFT":
        return -1;
      case "PAID":
        return 0;
      case "PICKUP_SCHEDULED":
        return 1;
      case "PICKED_UP":
        return 2;
      case "WITH_TAILOR":
        return 3;
      case "STITCHING":
        return 4;
      case "READY":
        return 5;
      case "OUT_FOR_DELIVERY":
        return 6;
      case "DELIVERED":
      case "COMPLETED":
        return 7;
      default:
        return 4;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="w-full py-6">
      {/* If order is in correction flow, show alteration banner */}
      {status.toString().startsWith("CORRECTION") && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-rose-300 animate-spin" />
            <div>
              <h5 className="font-semibold text-rose-200 text-sm">
                100% Fit Guarantee Alteration in Progress
              </h5>
              <p className="text-xs text-rose-300/80">
                Doorstep pickup and re-tailoring at zero extra cost to you.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-rose-900 text-rose-100 font-mono">
            {status}
          </span>
        </div>
      )}

      {/* OTP Delivery Alert Box if Out For Delivery */}
      {status === "OUT_FOR_DELIVERY" && deliveryOtp && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-sand/20 to-burgundy/40 border border-sand/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-sand uppercase">
              DELIVERY CONFIRMATION OTP
            </span>
            <p className="text-xs text-champagne/80 mt-0.5">
              Share this 4-digit code with the delivery partner upon arrival:
            </p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-wine-dark border border-sand/60 font-mono text-xl tracking-[0.3em] font-bold text-sand">
            {deliveryOtp}
          </div>
        </div>
      )}

      {/* Horizontal / Stacked Timeline */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        {/* Background track line */}
        <div className="hidden md:block absolute top-1/2 left-4 right-4 h-0.5 bg-sand/15 -translate-y-1/2 z-0" />
        <div
          className="hidden md:block absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-burgundy via-sand to-sand -translate-y-1/2 z-0 transition-all duration-700"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 95))}%`,
          }}
        />

        {STAGES.map((st, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = st.icon;

          return (
            <div
              key={st.key}
              className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-auto"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  isCurrent
                    ? "bg-sand text-wine-dark border-sand shadow-gold-glow scale-110"
                    : isCompleted
                    ? "bg-burgundy text-sand-light border-sand/60"
                    : "bg-wine-dark text-champagne/40 border-sand/20"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-medium ${
                    isCurrent
                      ? "text-sand font-bold"
                      : isCompleted
                      ? "text-sand-light"
                      : "text-champagne/50"
                  }`}
                >
                  {st.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-sand/80 font-mono">Current Stage</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
