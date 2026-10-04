"use client";

import React, { useState } from "react";
import {
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export type PaymentMethodId = "COD" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  description?: string;
  status: "AVAILABLE" | "COMING_SOON";
  icon: React.ComponentType<{ className?: string }>;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "COD",
    name: "Cash on Delivery",
    description: "Pay when your order is delivered to your doorstep",
    status: "AVAILABLE",
    icon: Banknote,
  },
  {
    id: "UPI",
    name: "UPI",
    description: "Instant UPI payments via Google Pay, PhonePe, Paytm",
    status: "COMING_SOON",
    icon: Smartphone,
  },
  {
    id: "CREDIT_CARD",
    name: "Credit Card",
    description: "Visa, Mastercard, RuPay & American Express",
    status: "COMING_SOON",
    icon: CreditCard,
  },
  {
    id: "DEBIT_CARD",
    name: "Debit Card",
    description: "All major Indian bank debit cards supported",
    status: "COMING_SOON",
    icon: CreditCard,
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethodId;
  onSelectMethod?: (method: PaymentMethodId) => void;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethod = "COD",
  onSelectMethod,
  className = "",
}: PaymentMethodSelectorProps) {
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleMethodClick = (method: PaymentMethodOption) => {
    if (method.status === "COMING_SOON") {
      // Do NOT change selection. Show friendly notice.
      setNoticeMessage(
        `This payment method is coming soon. Currently, SILAI accepts Cash on Delivery.`
      );
      // Auto-clear notice after 5 seconds
      setTimeout(() => {
        setNoticeMessage((prev) =>
          prev === `This payment method is coming soon. Currently, SILAI accepts Cash on Delivery.`
            ? null
            : prev
        );
      }, 5000);
      return;
    }

    // COD is selectable
    setNoticeMessage(null);
    if (onSelectMethod) {
      onSelectMethod(method.id);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-burgundy dark:text-sand font-bold block tracking-wider">
            Payment Method
          </span>
          <p className="text-[11px] text-wine/70 dark:text-champagne/70 mt-0.5">
            Select your preferred method of payment
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold">
          COD Enabled
        </span>
      </div>

      {/* Friendly Notice when clicking a Coming Soon method */}
      {noticeMessage && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{noticeMessage}</p>
            <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Cash on Delivery is pre-selected for your convenience.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-amber-700 hover:text-amber-900 text-xs font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Methods List */}
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          const isAvailable = method.status === "AVAILABLE";

          return (
            <div
              key={method.id}
              onClick={() => handleMethodClick(method)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleMethodClick(method);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-white/95 dark:bg-burgundy/20 border-burgundy dark:border-sand/50 shadow-xs ring-1 ring-burgundy/20"
                  : isAvailable
                  ? "bg-white/60 dark:bg-white/5 border-burgundy/20 hover:border-burgundy/40 hover:bg-white/90"
                  : "bg-white/40 dark:bg-white/[0.02] border-burgundy/15 opacity-75 hover:opacity-90 hover:border-burgundy/30 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Radio Circle Indicator */}
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition ${
                    isSelected
                      ? "border-burgundy bg-burgundy dark:border-sand dark:bg-sand"
                      : "border-burgundy/40 dark:border-champagne/40 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-champagne dark:bg-burgundy" />
                  )}
                </div>

                {/* Method Icon */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                    isSelected
                      ? "bg-burgundy/10 text-burgundy dark:bg-sand/20 dark:text-sand"
                      : "bg-sand/40 text-wine/70 dark:bg-white/5 dark:text-champagne/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Name & Subtitle */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isSelected
                          ? "text-burgundy dark:text-sand-light"
                          : "text-wine dark:text-champagne"
                      }`}
                    >
                      {method.name}
                    </p>
                  </div>
                  {method.description && (
                    <p className="text-[10px] text-wine/70 dark:text-champagne/70 truncate mt-0.5">
                      {method.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium font-mono px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
