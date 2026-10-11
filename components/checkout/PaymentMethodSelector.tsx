"use client";

import React from "react";
import {
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type PaymentMethodId = "COD" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  nameKey: string;
  defaultName: string;
  descKey: string;
  defaultDesc: string;
  status: "AVAILABLE" | "COMING_SOON";
  badgeKey?: string;
  defaultBadge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "COD",
    nameKey: "checkout.cashOnDelivery",
    defaultName: "Cash on Delivery",
    descKey: "checkout.payOnDeliveryNote",
    defaultDesc: "Pay with cash or UPI QR code upon doorstep delivery",
    status: "AVAILABLE",
    badgeKey: "checkout.payAtDoorstep",
    defaultBadge: "Pay at Doorstep",
    icon: Banknote,
  },
  {
    id: "UPI",
    nameKey: "checkout.upi",
    defaultName: "UPI",
    descKey: "checkout.upiDesc",
    defaultDesc: "Instant UPI payments via Google Pay, PhonePe, Paytm (QR & Apps)",
    status: "AVAILABLE",
    badgeKey: "checkout.razorpayTestBadge",
    defaultBadge: "Razorpay Test Mode",
    icon: Smartphone,
  },
  {
    id: "CREDIT_CARD",
    nameKey: "checkout.creditCard",
    defaultName: "Credit Card",
    descKey: "checkout.creditCardDesc",
    defaultDesc: "Visa, Mastercard, RuPay & American Express",
    status: "AVAILABLE",
    badgeKey: "checkout.razorpayTestBadge",
    defaultBadge: "Razorpay Test Mode",
    icon: CreditCard,
  },
  {
    id: "DEBIT_CARD",
    nameKey: "checkout.debitCard",
    defaultName: "Debit Card",
    descKey: "checkout.debitCardDesc",
    defaultDesc: "All major Indian bank debit cards supported",
    status: "AVAILABLE",
    badgeKey: "checkout.razorpayTestBadge",
    defaultBadge: "Razorpay Test Mode",
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
  const { t } = useLanguage();

  const handleMethodClick = (method: PaymentMethodOption) => {
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
            {t("checkout.paymentMethod", "Payment Method")}
          </span>
          <p className="text-[11px] text-wine/70 dark:text-champagne/70 mt-0.5">
            {t("checkout.selectPaymentPrompt", "Select your preferred method of payment")}
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{t("checkout.razorpayTestBadge", "Razorpay Test Mode Active")}</span>
        </span>
      </div>

      {/* Methods List */}
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          const methodName = t(method.nameKey, method.defaultName);
          const methodDesc = t(method.descKey, method.defaultDesc);
          const methodBadge = method.badgeKey
            ? t(method.badgeKey, method.defaultBadge)
            : undefined;

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
                  ? "bg-white/95 dark:bg-burgundy/25 border-burgundy dark:border-sand shadow-sm ring-1 ring-burgundy/30 dark:ring-sand/40"
                  : "bg-white/60 dark:bg-white/5 border-burgundy/20 hover:border-burgundy/40 hover:bg-white/90 dark:hover:bg-white/10"
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
                          ? "text-burgundy dark:text-sand-light font-bold"
                          : "text-wine dark:text-champagne"
                      }`}
                    >
                      {methodName}
                    </p>
                    {methodBadge && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-sand/40 dark:bg-wine/40 text-burgundy dark:text-sand border border-burgundy/20 dark:border-sand/20 font-semibold">
                        {methodBadge}
                      </span>
                    )}
                  </div>
                  {methodDesc && (
                    <p className="text-[10px] text-wine/70 dark:text-champagne/70 truncate mt-0.5">
                      {methodDesc}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  {t("common.available", "Available")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
