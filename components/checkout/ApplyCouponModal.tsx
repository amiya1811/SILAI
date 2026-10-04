"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, CheckCircle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

export interface AvailableOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  userEligibility: "NEW_USER" | "REGULAR_USER";
  eligibilityBadge: string;
  savingsText: string;
  conditionText: string;
}

interface ApplyCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  appliedCouponCode: string;
  onApplyCoupon: (code: string, discount: number, message: string) => void;
  onRemoveCoupon: () => void;
  tailorId?: string;
}

export default function ApplyCouponModal({
  isOpen,
  onClose,
  subtotal,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  tailorId,
}: ApplyCouponModalProps) {
  const [offers, setOffers] = useState<AvailableOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>("");
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch available offers on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingOffers(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success && Array.isArray(data.offers)) {
            setOffers(data.offers);
          } else {
            setOffers([]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load offers:", err);
        if (isMounted) setOffers([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingOffers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Validate & apply coupon via server
  const handleValidateAndApply = async (codeToApply: string) => {
    const trimmed = (codeToApply || "").trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    setApplyingCode(trimmed);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          subtotal,
          tailorId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Unable to apply coupon");
      } else {
        setSuccessMessage(data.message || `Coupon ${data.code} applied!`);
        onApplyCoupon(data.code, data.discountAmount, data.message);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage("Failed to validate coupon with server");
    } finally {
      setIsApplying(false);
      setApplyingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-3xl bg-[#FAF4E8] border border-burgundy/25 shadow-2xl flex flex-col overflow-hidden text-wine">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-burgundy/15 flex items-center justify-between bg-[#F2E5C6]/40">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-burgundy uppercase">
              <Tag className="w-3.5 h-3.5" />
              <span>Privilege Vouchers</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-wine mt-0.5">
              Apply Coupon
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-wine/60 hover:text-wine hover:bg-burgundy/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Manual Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase font-bold text-wine/80">
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. AMIYA@100)"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleValidateAndApply(manualCode);
                    }
                  }}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-xl bg-white/90 border border-burgundy/30 text-wine uppercase placeholder:normal-case placeholder:font-normal placeholder:text-wine/40 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy"
                />
              </div>
              <button
                type="button"
                onClick={() => handleValidateAndApply(manualCode)}
                disabled={isApplying || !manualCode.trim()}
                className="px-5 py-2.5 text-xs font-mono font-bold uppercase rounded-xl bg-gradient-to-r from-burgundy via-maroon to-burgundy text-champagne border border-burgundy/40 hover:opacity-95 shadow-sm active:scale-[0.98] transition disabled:opacity-40"
              >
                {isApplying && applyingCode === manualCode.trim().toUpperCase()
                  ? "Checking..."
                  : "Apply"}
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Available Coupons Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-burgundy">
                Available Coupons For You
              </span>
              <span className="text-[11px] font-mono text-wine/60">
                Cart Subtotal: {formatINR(subtotal)}
              </span>
            </div>

            {isLoadingOffers ? (
              <div className="space-y-3 py-4">
                <div className="h-24 rounded-2xl bg-burgundy/5 animate-pulse" />
                <div className="h-24 rounded-2xl bg-burgundy/5 animate-pulse" />
              </div>
            ) : offers.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F2E5C6]/40 border border-burgundy/15 text-center text-xs text-wine/70">
                No promotional coupons currently available for this category.
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => {
                  const isCurrentApplied =
                    Boolean(appliedCouponCode && offer?.code && appliedCouponCode.toUpperCase() === offer.code.toUpperCase());
                  const isShortfall = subtotal < (offer?.minOrderValue || 0);
                  const shortfallAmount = Math.ceil((offer?.minOrderValue || 0) - subtotal);
                  const isBusyWithThis = isApplying && applyingCode === offer?.code;

                  return (
                    <div
                      key={offer.id}
                      className={`relative p-4 rounded-2xl border transition-all duration-200 ${
                        isCurrentApplied
                          ? "bg-emerald-50/70 border-emerald-400 shadow-sm"
                          : "bg-white/80 border-burgundy/20 hover:border-burgundy/40 hover:shadow-sm"
                      }`}
                    >
                      {/* Top Row: Code Pill + Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-[#F2E5C6] border border-dashed border-burgundy/40 text-burgundy font-mono text-xs font-bold tracking-wider">
                            {offer.code}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-burgundy/10 text-burgundy border border-burgundy/20">
                            {offer.eligibilityBadge}
                          </span>
                        </div>

                        {/* Apply / Applied Button */}
                        {isCurrentApplied ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                              <CheckCircle className="w-3.5 h-3.5" /> Applied
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveCoupon();
                                setSuccessMessage(null);
                                setErrorMessage(null);
                              }}
                              className="text-xs font-mono font-semibold text-rose-700 hover:text-rose-900 underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : isShortfall ? (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-wine/40 bg-sand/40 border border-burgundy/15 cursor-not-allowed"
                          >
                            Add {formatINR(shortfallAmount)} More
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleValidateAndApply(offer.code)}
                            disabled={isApplying}
                            className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-champagne bg-burgundy hover:bg-maroon active:scale-95 shadow-sm transition disabled:opacity-50"
                          >
                            {isBusyWithThis ? "Applying..." : "Apply"}
                          </button>
                        )}
                      </div>

                      {/* Middle: Discount description */}
                      <div className="mt-2.5">
                        <h4 className="font-serif text-base font-bold text-wine">
                          {offer.savingsText}
                        </h4>
                        <p className="text-xs text-wine/70 mt-0.5">
                          {offer.conditionText}
                        </p>
                      </div>

                      {/* Dynamic Shortfall Notice */}
                      {isShortfall && !isCurrentApplied && (
                        <div className="mt-2.5 pt-2 border-t border-burgundy/10 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>
                            Add {formatINR(shortfallAmount)} more to unlock {offer.code}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-burgundy/15 bg-[#F2E5C6]/40 flex items-center justify-between text-xs text-wine/70">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-burgundy" /> Maximum 1 coupon per order
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-mono font-semibold text-burgundy hover:bg-burgundy/10 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
