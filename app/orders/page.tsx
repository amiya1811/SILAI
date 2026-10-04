"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import OrderTimeline from "@/components/orders/OrderTimeline";
import PaymentCheckoutModal from "@/components/checkout/PaymentCheckoutModal";
import {
  ShoppingBag,
  Scissors,
  Truck,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  CreditCard,
  X,
  AlertTriangle,
  Upload,
  Camera,
  HelpCircle,
  Clock,
  ShieldAlert,
  Banknote,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);

  // Correction Modal State
  const [correctionModalOrder, setCorrectionModalOrder] = useState<Order | null>(null);
  const [correctionReason, setCorrectionReason] = useState<
    "Fit Issue" | "Stitching Issue" | "Wrong Design" | "Wrong Measurement" | "Damaged Garment" | "Other"
  >("Fit Issue");
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [correctionPhoto, setCorrectionPhoto] = useState<string | null>(null);
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  // Issue Reporting Modal State
  const [issueModalOrder, setIssueModalOrder] = useState<Order | null>(null);
  const [issueReason, setIssueReason] = useState<
    "Damaged Garment" | "Wrong Item" | "Quality Issue" | "Missing Item" | "Delivery Issue" | "Measurement Issue" | "Other"
  >("Quality Issue");
  const [issueDetails, setIssueDetails] = useState("");
  const [issuePhoto, setIssuePhoto] = useState<string | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueSuccessMsg, setIssueSuccessMsg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Request Free Alteration / Correction
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionModalOrder || !correctionNotes.trim()) return;
    setIsSubmittingCorrection(true);

    try {
      const res = await fetch(`/api/orders/${correctionModalOrder.id}/correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: correctionReason,
          notes: correctionNotes,
          photoUrl: correctionPhoto,
        }),
      });
      if (res.ok) {
        setCorrectionModalOrder(null);
        setCorrectionNotes("");
        setCorrectionPhoto(null);
        await loadOrders();
      }
    } catch (err) {
      console.error("Correction request failed", err);
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  // Report an Issue
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalOrder || !issueDetails.trim()) return;
    setIsSubmittingIssue(true);

    try {
      const res = await fetch(`/api/orders/${issueModalOrder.id}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: issueReason,
          details: issueDetails,
          photoUrl: issuePhoto,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIssueSuccessMsg(data.message || "Issue reported successfully.");
        setIssueDetails("");
        setIssuePhoto(null);
        setTimeout(() => {
          setIssueModalOrder(null);
          setIssueSuccessMsg(null);
        }, 1800);
        await loadOrders();
      }
    } catch (err) {
      console.error("Issue report failed", err);
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // Helper for dummy photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/20 dark:border-burgundy/30 pb-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-sand dark:text-sand font-semibold uppercase">
            BESPOKE COMMISSIONS
          </span>
          <h1 className="font-serif text-3xl font-bold text-champagne-light dark:text-champagne-light mt-1">
            My Custom Orders & Live Tracking
          </h1>
          <p className="text-xs text-sand/80 dark:text-sand/70 mt-0.5">
            Track fabric pickup, karigari progress, and doorstep delivery with 100% Fit Guarantee.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#FAF4E8] border border-burgundy/15" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-[#FAF4E8] border border-burgundy/20 space-y-4 text-wine shadow-sm">
          <ShoppingBag className="w-12 h-12 text-burgundy/40 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-wine">No custom orders yet</h3>
          <p className="text-xs text-wine/70 max-w-sm mx-auto">
            Discover our master tailors, upload your reference design, and experience seamless bespoke stitching.
          </p>
          <a
            href="/explore"
            className="inline-block px-6 py-2.5 rounded-full font-medium text-xs text-champagne bg-gradient-to-r from-burgundy to-maroon border border-burgundy/30 hover:opacity-95 shadow-sm transition"
          >
            Explore Master Tailors
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 p-6 sm:p-8 space-y-6 shadow-card-luxury text-wine dark:text-champagne transition hover:border-burgundy/40"
              >
                {/* Top Row: Order ID, Tailor, Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-burgundy/15 dark:border-burgundy/30 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-burgundy dark:text-sand font-bold">
                        {order.orderNumber || "N/A"}
                      </span>
                      <span className="text-wine/40 dark:text-champagne/40">•</span>
                      <span className="text-xs text-maroon/80 dark:text-champagne/80 font-mono font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-wine dark:text-sand-light">
                      {order.garmentName || "Custom Outfit"}
                    </h3>
                    <p className="text-xs text-maroon/90 dark:text-champagne/90">
                      Crafted by <strong className="text-burgundy dark:text-sand font-bold">{order.tailorName || "Master Boutique"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {/* Pay CTA if payment is still pending and not COD */}
                    {order.paymentMethod === "COD" || !order.paymentMethod ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        Cash on Delivery
                      </span>
                    ) : order.status === "PENDING_PAYMENT" ? (
                      <button
                        onClick={() => setActivePaymentOrder(order)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-800 text-champagne border border-emerald-600 hover:opacity-95 shadow-sm transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Complete Payment (
                        {formatINR(order.finalPayableAmount)})
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Animated Order Lifecycle Timeline (10 Stages) */}
                <OrderTimeline
                  status={order.status}
                  deliveryOtp={order.deliveryOtp}
                  isCorrectionFlow={order.status ? order.status.startsWith("CORRECTION") : false}
                  orderCreatedAt={order.createdAt}
                />

                {/* Finished Garment Photo if Tailor Uploaded */}
                {order.finishedGarmentPhoto && (
                  <div className="p-4 rounded-2xl bg-burgundy/10 dark:bg-wine/30 border border-burgundy/20 dark:border-burgundy/40 flex items-center gap-4">
                    <img
                      src={order.finishedGarmentPhoto}
                      alt="Finished Stitching"
                      className="w-16 h-16 object-cover rounded-xl border border-burgundy/30 dark:border-sand/30"
                    />
                    <div>
                      <h5 className="font-serif text-sm font-bold text-wine dark:text-sand-light">
                        Finished Karigari Photo Uploaded by Tailor
                      </h5>
                      <p className="text-xs text-maroon/80 dark:text-champagne/80">
                        Steam pressed, inspected for finish, and packed for safe doorstep transit.
                      </p>
                    </div>
                  </div>
                )}

                {/* Issue Reported Card if exists */}
                {order.issueReport && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        Reported Issue: {order.issueReport?.reason || "Not specified"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Status: Under Review
                      </span>
                    </div>
                    <p className="text-amber-800 dark:text-amber-300">{order.issueReport?.details || ""}</p>
                    <p className="text-[10px] font-mono text-amber-700/80 dark:text-amber-400/80">
                      Reported on {formatDate(order.issueReport?.reportedAt)} • Concierge assigned
                    </p>
                  </div>
                )}

                {/* Addresses & Financial Breakdown Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-burgundy/15 dark:border-burgundy/30 text-xs">
                  <div>
                    <span className="text-burgundy dark:text-sand font-mono uppercase font-bold text-[10px] block mb-1">
                      Doorstep Pickup & Return Drop
                    </span>
                    <p className="text-wine dark:text-champagne-light font-medium leading-snug">{order.pickupAddress || "Not specified"}</p>
                  </div>

                  <div>
                    <span className="text-burgundy dark:text-sand font-mono uppercase font-bold text-[10px] block mb-1">
                      Fit Specification Method
                    </span>
                    <p className="text-wine dark:text-champagne-light capitalize font-medium">
                      {(order.measurementType || "SAVED").replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-burgundy dark:text-sand font-mono uppercase font-bold text-[10px] block mb-1">
                      Final Amount
                    </span>
                    <span className="font-serif text-base font-bold text-burgundy dark:text-sand-light">
                      {formatINR(order.finalPayableAmount)}
                    </span>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-mono font-bold">
                      {order.paymentMethod === "COD" || !order.paymentMethod
                        ? "Payment: Cash on Delivery"
                        : order.status === "PENDING_PAYMENT"
                        ? "Awaiting Payment"
                        : "Payment Verified ✓"}
                    </p>
                  </div>
                </div>

                {/* Post-Delivery Actions: Request Correction & Report Issue */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-burgundy/10 dark:border-burgundy/20">
                  {/* Report an Issue (Always accessible for customer assistance) */}
                  <button
                    onClick={() => setIssueModalOrder(order)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-maroon dark:text-sand bg-sand/30 dark:bg-wine/30 border border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/40 hover:text-burgundy dark:hover:text-sand-light transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Report an Issue
                  </button>

                  {/* Request Correction (Available after delivery) */}
                  {order.status === "DELIVERED" && (
                    <button
                      onClick={() => setCorrectionModalOrder(order)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Request a Correction (100% Free)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Checkout Modal */}
      {activePaymentOrder && (
        <PaymentCheckoutModal
          order={activePaymentOrder}
          isOpen={!!activePaymentOrder}
          onClose={() => setActivePaymentOrder(null)}
          onPaymentSuccess={() => {
            setActivePaymentOrder(null);
            loadOrders();
          }}
        />
      )}

      {/* 1. Request Correction Modal (Modification 11) */}
      {correctionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-2xl p-6 text-wine dark:text-champagne space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCorrectionModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-wine/50 dark:text-champagne/60 hover:text-burgundy dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-wine/30 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                100% PERFECT FIT GUARANTEE
              </span>
              <h3 className="font-serif text-xl font-bold text-wine dark:text-sand-light mt-0.5">
                Request a Correction
              </h3>
              <p className="text-xs text-maroon/80 dark:text-champagne/80 mt-1">
                Tell us what needs tuning. A delivery partner will collect your garment, bring it to the master tailor for alterations, and deliver it back at zero extra cost.
              </p>
            </div>

            <form onSubmit={handleRequestCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1.5 uppercase">
                  Reason for Correction
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    [
                      "Fit Issue",
                      "Stitching Issue",
                      "Wrong Design",
                      "Wrong Measurement",
                      "Damaged Garment",
                      "Other",
                    ] as const
                  ).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCorrectionReason(r)}
                      className={`p-2 rounded-xl border text-center font-semibold transition ${
                        correctionReason === r
                          ? "bg-gradient-to-r from-burgundy to-maroon text-sand-light border-sand/40 shadow-sm"
                          : "bg-[#F2E5C6]/50 dark:bg-wine/20 text-wine dark:text-champagne border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/40"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1 uppercase">
                  Explain What Needs Correction
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="e.g. Please loosen the bust by 0.75 inches and shorten sleeves by 1 inch..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#F2E5C6]/40 dark:bg-[#0D080A]/60 border border-burgundy/25 dark:border-burgundy/40 text-wine dark:text-sand-light placeholder:text-maroon/50 dark:placeholder:text-champagne/40 focus:outline-none focus:border-burgundy font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1 uppercase">
                  Upload Photo of Issue (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 rounded-xl text-xs bg-[#F2E5C6]/60 dark:bg-wine/25 border border-burgundy/25 dark:border-burgundy/40 hover:border-burgundy/50 text-wine dark:text-champagne font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setCorrectionPhoto)}
                      className="hidden"
                    />
                  </label>
                  {correctionPhoto && (
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> Photo Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Correction Lifecycle Preview */}
              <div className="p-3 rounded-xl bg-[#F2E5C6]/50 dark:bg-wine/20 border border-burgundy/20 dark:border-burgundy/40 text-[11px] space-y-1">
                <span className="font-mono text-[10px] text-burgundy dark:text-sand font-bold uppercase block">
                  Correction Process Lifecycle:
                </span>
                <p className="text-maroon/80 dark:text-champagne/80">
                  1. Correction Requested → 2. Pickup Scheduled → 3. Garment Picked Up → 4. With Tailor for Correction → 5. Correction in Progress → 6. Ready for Delivery → 7. Delivered
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmittingCorrection}
                className="w-full py-3 rounded-xl font-bold text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:opacity-95 shadow-sm transition disabled:opacity-50"
              >
                {isSubmittingCorrection
                  ? "Scheduling Alteration Pickup..."
                  : "Submit Free Correction Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Report an Issue Modal (Modification 12) */}
      {issueModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-2xl p-6 text-wine dark:text-champagne space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIssueModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-wine/50 dark:text-champagne/60 hover:text-burgundy dark:hover:text-sand hover:bg-sand/30 dark:hover:bg-wine/30 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-burgundy dark:text-sand font-bold uppercase">
                CUSTOMER CARE & RESOLUTION
              </span>
              <h3 className="font-serif text-xl font-bold text-wine dark:text-sand-light mt-0.5">
                Report an Issue
              </h3>
              <p className="text-xs text-maroon/80 dark:text-champagne/80 mt-1">
                We take craft quality and safety seriously. Our customer concierge will review your issue immediately.
              </p>
            </div>

            {issueSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{issueSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1.5 uppercase">
                    Select Issue Reason
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(
                      [
                        "Damaged Garment",
                        "Wrong Item",
                        "Quality Issue",
                        "Missing Item",
                        "Delivery Issue",
                        "Measurement Issue",
                        "Other",
                      ] as const
                    ).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setIssueReason(r)}
                        className={`p-2 rounded-xl border text-center font-semibold transition ${
                          issueReason === r
                            ? "bg-gradient-to-r from-burgundy to-maroon text-sand-light border-sand/40 shadow-sm"
                            : "bg-[#F2E5C6]/50 dark:bg-wine/20 text-wine dark:text-champagne border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/40"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1 uppercase">
                    Provide Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    placeholder="Describe the problem in detail so our support team can resolve it..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F2E5C6]/40 dark:bg-[#0D080A]/60 border border-burgundy/25 dark:border-burgundy/40 text-wine dark:text-sand-light placeholder:text-maroon/50 dark:placeholder:text-champagne/40 focus:outline-none focus:border-burgundy font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-burgundy dark:text-sand font-bold mb-1 uppercase">
                    Photo Upload (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-2 rounded-xl text-xs bg-[#F2E5C6]/60 dark:bg-wine/25 border border-burgundy/25 dark:border-burgundy/40 hover:border-burgundy/50 text-wine dark:text-champagne font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
                      <span>Attach Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, setIssuePhoto)}
                        className="hidden"
                      />
                    </label>
                    {issuePhoto && (
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> Photo Attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Resolution Status Stages */}
                <div className="p-3 rounded-xl bg-[#F2E5C6]/50 dark:bg-wine/20 border border-burgundy/20 dark:border-burgundy/40 text-[11px] space-y-1">
                  <span className="font-mono text-[10px] text-burgundy dark:text-sand font-bold uppercase block">
                    Issue Resolution Stages:
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-burgundy dark:text-sand font-bold">1. Submitted</span>
                    <span className="text-wine/60 dark:text-champagne/60">→</span>
                    <span className="text-maroon dark:text-champagne font-medium">2. Under Review</span>
                    <span className="text-wine/60 dark:text-champagne/60">→</span>
                    <span className="text-maroon/70 dark:text-champagne/70 font-medium">3. Resolved</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="w-full py-3 rounded-xl font-bold text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:opacity-95 shadow-sm transition disabled:opacity-50"
                >
                  {isSubmittingIssue ? "Submitting Report..." : "Submit Issue Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
