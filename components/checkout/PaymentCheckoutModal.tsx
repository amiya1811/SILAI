"use client";

import React, { useState } from "react";
import { Order } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Lock, ShieldCheck, CheckCircle2, CheckCircle, AlertCircle, X, Sparkles, Tag } from "lucide-react";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import ApplyCouponModal from "@/components/checkout/ApplyCouponModal";
import confetti from "canvas-confetti";

interface PaymentCheckoutModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: Order) => void;
}

export default function PaymentCheckoutModal({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PaymentCheckoutModalProps) {
  const [couponCode, setCouponCode] = useState(order.appliedCoupon || "");
  const [appliedDiscount, setAppliedDiscount] = useState(order.discountAmount);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate local display total (server will re-verify on creation)
  const currentTotal = Math.max(
    0,
    (order?.stitchingPrice || 0) -
      (appliedDiscount || 0) -
      (order?.membershipDiscount || 0) +
      (order?.doorstepDeliveryFee || 0) +
      (order?.taxAmount || 0)
  );

  const onApplyCouponSuccess = (code: string, discount: number, message: string) => {
    setCouponCode(code);
    setAppliedDiscount(discount);
    setCouponMessage(message);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setCouponMessage(null);
    setCouponError(null);
  };

  const handleLaunchPayment = async () => {
    setIsProcessingPayment(true);
    setErrorMessage(null);

    try {
      // Confirm order with Cash on Delivery (COD)
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id,
          couponCode: (couponCode || "").trim(),
          paymentMethod: "COD",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm payment method");
      }

      // Success! Order confirmed with COD
      setPaymentSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#F2D9A0", "#75162D", "#FAF4E8"],
      });

      setTimeout(() => {
        onPaymentSuccess(data.order || order);
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not confirm order. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-2xl p-6 sm:p-8 text-wine dark:text-champagne overflow-hidden">
        {/* Close Button */}
        {!paymentSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-wine/50 dark:text-champagne/60 hover:text-burgundy dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-wine/30 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {paymentSuccess ? (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-wine dark:text-sand-light">
              Order Placed Successfully
            </h3>
            <p className="text-sm text-maroon/90 dark:text-champagne/90 max-w-sm mx-auto leading-relaxed">
              Payment: <strong className="text-burgundy dark:text-sand font-bold">Cash on Delivery</strong>. Pay upon doorstep delivery after inspecting your bespoke garment.
            </p>
            <div className="p-3 rounded-xl bg-sand/40 dark:bg-burgundy/40 border border-burgundy/20 dark:border-sand/30 text-xs font-mono text-burgundy dark:text-sand font-bold">
              Order No: {order.orderNumber}
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-[11px] font-mono tracking-[0.25em] text-burgundy dark:text-sand font-bold uppercase">
                SILAI SECURE CHECKOUT
              </span>
              <h2 className="font-serif text-2xl font-bold text-wine dark:text-sand-light mt-1">
                Complete Custom Order
              </h2>
              <p className="text-xs text-maroon/80 dark:text-champagne/80 mt-0.5">
                Stitching by {order.tailorName}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bill Summary (Requirements 18 & 19) */}
            <div className="space-y-3 bg-[#F2E5C6]/50 dark:bg-wine/25 p-4 rounded-xl border border-burgundy/20 dark:border-burgundy/40 text-xs">
              <div className="flex justify-between items-center text-wine dark:text-champagne font-medium">
                <span>{order.garmentName} (Bespoke Stitching)</span>
                <span className="font-bold text-burgundy dark:text-sand">{formatINR(order.stitchingPrice)}</span>
              </div>

              <div className="flex justify-between items-center text-maroon/90 dark:text-champagne/90">
                <span>Doorstep Pickup & Return Delivery</span>
                <span className="font-bold text-burgundy dark:text-sand">{formatINR(order.doorstepDeliveryFee)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> Promo Savings
                  </span>
                  <span>-{formatINR(appliedDiscount)}</span>
                </div>
              )}

              {order.membershipDiscount > 0 && (
                <div className="flex justify-between items-center text-burgundy dark:text-sand font-bold">
                  <span>SILAI Club Privilege</span>
                  <span>-{formatINR(order.membershipDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-maroon/80 dark:text-champagne/70">
                <span>GST (5% Apparel Custom Stitching)</span>
                <span>{formatINR(order.taxAmount)}</span>
              </div>

              <div className="pt-3 border-t border-burgundy/20 dark:border-burgundy/30 flex justify-between items-center text-base font-serif font-bold text-wine dark:text-champagne">
                <span>Total Payable</span>
                <span className="text-lg text-burgundy dark:text-sand-light">{formatINR(currentTotal)}</span>
              </div>
            </div>

            {/* Promotional Privilege Voucher (Myntra-Style Apply Coupon) */}
            <div className="mt-4">
              {!couponCode ? (
                <div
                  onClick={() => setIsCouponModalOpen(true)}
                  className="group p-3 rounded-xl bg-white/80 dark:bg-[#0D080A]/80 border border-dashed border-burgundy/30 dark:border-burgundy/50 hover:border-burgundy hover:bg-[#F2E5C6]/30 dark:hover:bg-wine/30 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-burgundy/10 dark:bg-burgundy/30 flex items-center justify-center text-burgundy dark:text-sand group-hover:scale-105 transition">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-serif font-bold text-wine dark:text-sand-light">
                        Apply Privilege Coupon
                      </p>
                      <p className="text-[10px] text-maroon/70 dark:text-champagne/60 font-medium">
                        Check available promotional discounts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCouponModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-burgundy text-sand-light hover:bg-maroon transition shadow-xs"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-1.5 py-0.5 rounded border border-emerald-300">
                          {couponCode}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700">
                          Applied ✓
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                        You saved {formatINR(appliedDiscount)} on this order
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(true)}
                      className="px-2 py-0.5 rounded text-xs font-mono font-semibold text-burgundy hover:bg-burgundy/10 transition"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-2 py-0.5 rounded text-xs font-mono font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4">
              <PaymentMethodSelector selectedMethod="COD" />
            </div>

            {/* Inspection Guarantee Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-wine/70 dark:text-champagne/70">
              <ShieldCheck className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
              <span>Cash on Delivery • Pay upon inspection at doorstep</span>
            </div>

            {/* Pay CTA */}
            <button
              onClick={handleLaunchPayment}
              disabled={isProcessingPayment}
              className="w-full mt-4 py-3.5 rounded-xl font-medium text-sm text-champagne bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-burgundy/40 hover:opacity-95 shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-champagne" />
                  <span>Place Order (Cash on Delivery) • {formatINR(currentTotal)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Myntra-Style Apply Coupon Modal */}
      <ApplyCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        subtotal={order.stitchingPrice}
        appliedCouponCode={couponCode}
        onApplyCoupon={onApplyCouponSuccess}
        onRemoveCoupon={handleRemoveCoupon}
        tailorId={order.tailorId}
      />
    </div>
  );
}
