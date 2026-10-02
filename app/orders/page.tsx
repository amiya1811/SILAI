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
        setOrders(data.orders);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/15 pb-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-sand uppercase">
            BESPOKE COMMISSIONS
          </span>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-1">
            My Custom Orders & Live Tracking
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Track fabric pickup, karigari progress, and doorstep delivery with 100% Fit Guarantee.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-wine-dark/60 border border-sand/20" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-wine-dark/50 border border-sand/20 space-y-4">
          <ShoppingBag className="w-12 h-12 text-sand/40 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-sand-light">No custom orders yet</h3>
          <p className="text-xs text-champagne/70 max-w-sm mx-auto">
            Discover our master tailors, upload your reference design, and experience seamless bespoke stitching.
          </p>
          <a
            href="/explore"
            className="inline-block px-6 py-2.5 rounded-full font-medium text-xs text-sand-light bg-burgundy border border-sand/40 hover:bg-maroon transition"
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
                className="rounded-3xl bg-wine-dark/80 border border-sand/25 p-6 sm:p-8 space-y-6 shadow-xl transition hover:border-sand/40"
              >
                {/* Top Row: Order ID, Tailor, Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand/15 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sand font-bold">
                        {order.orderNumber}
                      </span>
                      <span className="text-champagne/40">•</span>
                      <span className="text-xs text-champagne/70 font-mono">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-sand-light">
                      {order.garmentName}
                    </h3>
                    <p className="text-xs text-champagne/80">
                      Crafted by <strong className="text-sand">{order.tailorName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {/* Pay CTA if payment is still pending */}
                    {order.status === "PENDING_PAYMENT" && (
                      <button
                        onClick={() => setActivePaymentOrder(order)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-800 text-sand-light border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Complete Payment (
                        {formatINR(order.finalPayableAmount)})
                      </button>
                    )}
                  </div>
                </div>

                {/* Animated Order Lifecycle Timeline (10 Stages) */}
                <OrderTimeline
                  status={order.status}
                  deliveryOtp={order.deliveryOtp}
                  isCorrectionFlow={order.status.startsWith("CORRECTION")}
                  orderCreatedAt={order.createdAt}
                />

                {/* Finished Garment Photo if Tailor Uploaded */}
                {order.finishedGarmentPhoto && (
                  <div className="p-4 rounded-2xl bg-wine/50 border border-sand/20 flex items-center gap-4">
                    <img
                      src={order.finishedGarmentPhoto}
                      alt="Finished Stitching"
                      className="w-16 h-16 object-cover rounded-xl border border-sand/30"
                    />
                    <div>
                      <h5 className="font-serif text-sm font-bold text-sand-light">
                        Finished Karigari Photo Uploaded by Tailor
                      </h5>
                      <p className="text-xs text-champagne/70">
                        Steam pressed, inspected for finish, and packed for safe doorstep transit.
                      </p>
                    </div>
                  </div>
                )}

                {/* Issue Reported Card if exists */}
                {order.issueReport && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-amber-200 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Reported Issue: {order.issueReport.reason}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-900/60 text-amber-200 border border-amber-500/40">
                        Status: Under Review
                      </span>
                    </div>
                    <p className="text-champagne/80">{order.issueReport.details}</p>
                    <p className="text-[10px] font-mono text-champagne/50">
                      Reported on {formatDate(order.issueReport.reportedAt)} • Concierge assigned
                    </p>
                  </div>
                )}

                {/* Addresses & Financial Breakdown Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-sand/15 text-xs">
                  <div>
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Doorstep Pickup & Return Drop
                    </span>
                    <p className="text-champagne/90 leading-snug">{order.pickupAddress}</p>
                  </div>

                  <div>
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Fit Specification Method
                    </span>
                    <p className="text-champagne/90 capitalize font-medium">
                      {order.measurementType.replace("_", " ")}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-sand/70 font-mono uppercase text-[10px] block mb-1">
                      Final Amount
                    </span>
                    <span className="font-serif text-base font-bold text-sand">
                      {formatINR(order.finalPayableAmount)}
                    </span>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      {order.status === "PENDING_PAYMENT" ? "Awaiting Payment" : "Payment Verified ✓"}
                    </p>
                  </div>
                </div>

                {/* Post-Delivery Actions: Request Correction & Report Issue */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-sand/10">
                  {/* Report an Issue (Always accessible for customer assistance) */}
                  <button
                    onClick={() => setIssueModalOrder(order)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-champagne/80 bg-wine/60 border border-sand/20 hover:border-sand/40 hover:text-sand transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Report an Issue
                  </button>

                  {/* Request Correction (Available after delivery) */}
                  {order.status === "DELIVERED" && (
                    <button
                      onClick={() => setCorrectionModalOrder(order)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 transition flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 text-champagne space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCorrectionModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                100% PERFECT FIT GUARANTEE
              </span>
              <h3 className="font-serif text-xl font-bold text-sand-light mt-0.5">
                Request a Correction
              </h3>
              <p className="text-xs text-champagne/70 mt-1">
                Tell us what needs tuning. A delivery partner will collect your garment, bring it to the master tailor for alterations, and deliver it back at zero extra cost.
              </p>
            </div>

            <form onSubmit={handleRequestCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-sand mb-1.5 uppercase">
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
                      className={`p-2 rounded-xl border text-center font-medium transition ${
                        correctionReason === r
                          ? "bg-burgundy text-sand border-sand shadow-sm"
                          : "bg-wine/60 text-champagne/70 border-sand/20 hover:border-sand/40"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Explain What Needs Correction
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="e.g. Please loosen the bust by 0.75 inches and shorten sleeves by 1 inch..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Upload Photo of Issue (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 rounded-xl text-xs bg-wine/70 border border-sand/25 hover:border-sand/50 text-champagne flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sand" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setCorrectionPhoto)}
                      className="hidden"
                    />
                  </label>
                  {correctionPhoto && (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Photo Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Correction Lifecycle Preview */}
              <div className="p-3 rounded-xl bg-wine/50 border border-sand/15 text-[11px] space-y-1">
                <span className="font-mono text-[10px] text-sand uppercase block">
                  Correction Process Lifecycle:
                </span>
                <p className="text-champagne/70">
                  1. Correction Requested → 2. Pickup Scheduled → 3. Garment Picked Up → 4. With Tailor for Correction → 5. Correction in Progress → 6. Ready for Delivery → 7. Delivered
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmittingCorrection}
                className="w-full py-3 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 text-champagne space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIssueModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                CUSTOMER CARE & RESOLUTION
              </span>
              <h3 className="font-serif text-xl font-bold text-sand-light mt-0.5">
                Report an Issue
              </h3>
              <p className="text-xs text-champagne/70 mt-1">
                We take craft quality and safety seriously. Our customer concierge will review your issue immediately.
              </p>
            </div>

            {issueSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{issueSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-sand mb-1.5 uppercase">
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
                        className={`p-2 rounded-xl border text-center font-medium transition ${
                          issueReason === r
                            ? "bg-burgundy text-sand border-sand shadow-sm"
                            : "bg-wine/60 text-champagne/70 border-sand/20 hover:border-sand/40"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-sand mb-1 uppercase">
                    Provide Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    placeholder="Describe the problem in detail so our support team can resolve it..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-sand mb-1 uppercase">
                    Photo Upload (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-2 rounded-xl text-xs bg-wine/70 border border-sand/25 hover:border-sand/50 text-champagne flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sand" />
                      <span>Attach Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, setIssuePhoto)}
                        className="hidden"
                      />
                    </label>
                    {issuePhoto && (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Photo Attached
                      </span>
                    )}
                  </div>
                </div>

                {/* Resolution Status Stages */}
                <div className="p-3 rounded-xl bg-wine/50 border border-sand/15 text-[11px] space-y-1">
                  <span className="font-mono text-[10px] text-sand uppercase block">
                    Issue Resolution Stages:
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-sand font-bold">1. Submitted</span>
                    <span>→</span>
                    <span className="text-champagne/70">2. Under Review</span>
                    <span>→</span>
                    <span className="text-champagne/50">3. Resolved</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="w-full py-3 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition disabled:opacity-50"
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
