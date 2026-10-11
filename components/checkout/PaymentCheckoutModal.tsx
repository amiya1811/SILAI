"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Tag,
  CreditCard,
  Smartphone,
  QrCode,
} from "lucide-react";
import PaymentMethodSelector, {
  PaymentMethodId,
} from "@/components/checkout/PaymentMethodSelector";
import ApplyCouponModal from "@/components/checkout/ApplyCouponModal";
import { loadRazorpayCheckoutScript } from "@/lib/payment/loadRazorpay";
import confetti from "canvas-confetti";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("COD");
  const [couponCode, setCouponCode] = useState(order.appliedCoupon || "");
  const [appliedDiscount, setAppliedDiscount] = useState(order.discountAmount);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

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
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id,
          couponCode: (couponCode || "").trim(),
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // If user chose Cash on Delivery (COD)
      if (selectedMethod === "COD") {
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
        return;
      }

      // If user chose Razorpay (UPI, Credit Card, Debit Card)
      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your network connection.");
      }

      const methodPrefill =
        selectedMethod === "UPI"
          ? "upi"
          : selectedMethod === "CREDIT_CARD" || selectedMethod === "DEBIT_CARD"
          ? "card"
          : undefined;

      const options: any = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TkJtW4zT78sNq3",
        amount: data.amount, // in paise
        currency: data.currency || "INR",
        name: "SILAI Bespoke",
        description: `Bespoke Stitching - Order #${data.orderNumber}`,
        image: "/silai-logo.jpeg",
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customerName || order.customerName || "Patron",
          email: data.customerEmail || "",
          contact: data.customerPhone || "",
          ...(methodPrefill ? { method: methodPrefill } : {}),
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay with UPI (Dynamic QR & Mobile Apps)",
                instruments: [{ method: "upi" }],
              },
              cards: {
                name: "Cards & Other Methods",
                instruments: [{ method: "card" }, { method: "netbanking" }],
              },
            },
            sequence:
              selectedMethod === "UPI"
                ? ["block.upi", "block.cards"]
                : ["block.cards", "block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        notes: {
          orderNumber: data.orderNumber,
          paymentMethod: selectedMethod,
        },
        theme: {
          color: "#560B18",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
        handler: async function (response: any) {
          setIsProcessingPayment(true);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId || order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPaymentSuccess(true);
              confetti({
                particleCount: 90,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#F2D9A0", "#75162D", "#FAF4E8"],
              });

              setTimeout(() => {
                onPaymentSuccess(verifyData.order || order);
              }, 1800);
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed.");
            }
          } catch (vErr: any) {
            setErrorMessage(vErr.message || "Failed to verify transaction signature.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setErrorMessage(resp.error?.description || "Payment failed. Please try again.");
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not complete payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-2xl text-wine dark:text-champagne flex flex-col overflow-hidden">
        {paymentSuccess ? (
          <div className="p-6 sm:p-8 text-center py-8 space-y-4 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[85vh]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-wine dark:text-sand-light">
              {t("checkout.orderSuccess", "Payment Confirmed")}
            </h3>
            <p className="text-sm text-maroon/90 dark:text-champagne/90 max-w-sm mx-auto leading-relaxed">
              {selectedMethod === "COD" ? (
                <>
                  {t("checkout.paymentMethod", "Payment method")}: <strong className="text-burgundy dark:text-sand font-bold">{t("checkout.cashOnDelivery", "Cash on Delivery")}</strong>. {t("checkout.payOnDeliveryNote", "Pay upon doorstep arrival.")}
                </>
              ) : (
                <>
                  Verified via <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{t("checkout.razorpayTestBadge", "Razorpay Test Mode")}</strong>. Your fabric pickup has been scheduled!
                </>
              )}
            </p>
            <div className="p-3 rounded-xl bg-sand/40 dark:bg-burgundy/40 border border-burgundy/20 dark:border-sand/30 text-xs font-mono text-burgundy dark:text-sand font-bold">
              {t("orders.orderId", "Order No")}: {order.orderNumber}
            </div>
          </div>
        ) : (
          <>
            {/* 1. Sticky / Fixed Header */}
            <div className="flex-shrink-0 px-5 pt-5 pb-3 sm:px-8 sm:pt-6 sm:pb-4 border-b border-burgundy/15 dark:border-burgundy/30 bg-[#FAF4E8] dark:bg-[#160B0E] relative text-center">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-burgundy dark:text-sand font-bold uppercase block">
                {t("checkout.orderSummary", "SILAI SECURE CHECKOUT")}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-wine dark:text-sand-light mt-0.5">
                {t("checkout.placeOrder", "Complete Custom Order")}
              </h2>
              <p className="text-xs text-maroon/80 dark:text-champagne/80 mt-0.5 truncate max-w-xs mx-auto">
                {order.tailorName}
              </p>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-wine/50 dark:text-champagne/60 hover:text-burgundy dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-wine/30 rounded-full transition"
                aria-label="Close Checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Vertically Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 sm:px-8 sm:py-5 space-y-4 overscroll-contain scrollbar-thin">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Bill Summary */}
              <div className="space-y-2.5 bg-[#F2E5C6]/50 dark:bg-wine/25 p-3.5 sm:p-4 rounded-xl border border-burgundy/20 dark:border-burgundy/40 text-xs">
                <div className="flex justify-between items-center text-wine dark:text-champagne font-medium">
                  <span>{order.garmentName} ({t("checkout.stitchingPrice", "Custom Stitching Base")})</span>
                  <span className="font-bold text-burgundy dark:text-sand">{formatINR(order.stitchingPrice)}</span>
                </div>

                <div className="flex justify-between items-center text-maroon/90 dark:text-champagne/90">
                  <span>{t("checkout.doorstepDelivery", "Doorstep Pickup & Return Delivery")}</span>
                  <span className="font-bold text-burgundy dark:text-sand">{formatINR(order.doorstepDeliveryFee)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> {t("checkout.couponDiscount", "Promo Savings")}
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
                  <span>{t("checkout.taxes", "Taxes & Packaging")}</span>
                  <span>{formatINR(order.taxAmount)}</span>
                </div>

                <div className="pt-2.5 border-t border-burgundy/20 dark:border-burgundy/30 flex justify-between items-center text-base font-serif font-bold text-wine dark:text-champagne">
                  <span>{t("checkout.totalPayable", "Total Payable")}</span>
                  <span className="text-lg text-burgundy dark:text-sand-light">{formatINR(currentTotal)}</span>
                </div>
              </div>

              {/* Privilege Voucher */}
              <div>
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
                          {t("checkout.applyCoupon", "Apply Coupon")}
                        </p>
                        <p className="text-[10px] text-maroon/70 dark:text-champagne/60 font-medium">
                          {t("checkout.couponPromoPrompt", "Check available promotional discounts")}
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
                      {t("common.select", "Apply")}
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
                            {t("checkout.couponApplied", "Applied")} ✓
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                          {t("checkout.couponSavingsPrefix", "You saved")} {formatINR(appliedDiscount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCouponModalOpen(true)}
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold text-burgundy hover:bg-burgundy/10 transition"
                      >
                        {t("common.edit", "Change")}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        {t("common.delete", "Remove")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                />
              </div>

              {/* UPI Guidance Info Box */}
              {selectedMethod === "UPI" && (
                <div className="p-3 rounded-xl bg-sand/60 dark:bg-burgundy/25 border border-burgundy/25 dark:border-sand/30 text-xs text-wine dark:text-champagne space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-semibold text-burgundy dark:text-sand text-xs">
                    <Smartphone className="w-4 h-4 text-burgundy dark:text-sand shrink-0" />
                    <span>{t("checkout.upiGuidanceTitle", "How UPI Works in Razorpay")}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-maroon/90 dark:text-champagne/80 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-burgundy dark:text-sand shrink-0">• Desktop:</span>
                      <span>Razorpay displays a <strong>Dynamic UPI QR Code</strong> to scan with Google Pay, PhonePe, Paytm, or BHIM.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-burgundy dark:text-sand shrink-0">• Mobile:</span>
                      <span>1-tap app launch directly opens your installed UPI app.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">• Test Mode:</span>
                      <span>Click &ldquo;Simulate Success&rdquo; on the modal to test order verification without transferring real funds.</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-maroon/70 dark:text-champagne/60 italic border-t border-burgundy/15 dark:border-sand/15 pt-1.5 mt-1">
                    Note: In compliance with NPCI security standards, manual UPI ID typing is deprecated in favor of fraud-proof Dynamic QR &amp; instant app launch.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Sticky Accessible Bottom Action Footer */}
            <div className="flex-shrink-0 px-5 py-3.5 sm:px-8 sm:py-4 border-t border-burgundy/15 dark:border-burgundy/30 bg-[#FAF4E8] dark:bg-[#160B0E] shadow-[0_-6px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-6px_16px_rgba(0,0,0,0.3)] space-y-2">
              {/* Guarantee Note */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-wine/70 dark:text-champagne/70 font-mono text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {selectedMethod === "COD"
                    ? t("checkout.payOnDeliveryNote", "Cash on Delivery • Pay upon inspection at doorstep")
                    : t("checkout.razorpaySecurityNote", "Razorpay Test Mode • 100% Secure 256-Bit Escrow Protection")}
                </span>
              </div>

              {/* Pay CTA Button */}
              <button
                onClick={handleLaunchPayment}
                disabled={isProcessingPayment}
                className="w-full py-3 sm:py-3.5 rounded-xl font-medium text-xs sm:text-sm text-champagne bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-burgundy/40 hover:opacity-95 shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-champagne border-t-transparent rounded-full animate-spin" />
                    <span>{t("checkout.placingOrder", "Processing Payment...")}</span>
                  </>
                ) : selectedMethod === "COD" ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-champagne" />
                    <span className="truncate">{t("checkout.placeOrder", "Confirm Order")} ({t("checkout.cashOnDelivery", "Cash on Delivery")}) • {formatINR(currentTotal)}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-champagne" />
                    <span className="truncate">Pay with Razorpay ({selectedMethod.replace(/_/g, " ")}) • {formatINR(currentTotal)}</span>
                  </>
                )}
              </button>
            </div>
          </>
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
