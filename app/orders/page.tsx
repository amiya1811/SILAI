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
} from "lucide-react";

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  const [correctionModalOrder, setCorrectionModalOrder] = useState<Order | null>(null);
  const [correctionNotes, setCorrectionNotes] = useState("");
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
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

  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionModalOrder || !correctionNotes.trim()) return;
    setIsSubmittingCorrection(true);

    try {
      const res = await fetch(`/api/orders/${correctionModalOrder.id}/correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: correctionNotes }),
      });
      if (res.ok) {
        setCorrectionModalOrder(null);
        setCorrectionNotes("");
        await loadOrders();
      }
    } catch (err) {
      console.error("Correction request failed", err);
    } finally {
      setIsSubmittingCorrection(false);
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
            My Custom Orders & Live Stitching
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

                {/* Animated Order Lifecycle Timeline */}
                <OrderTimeline
                  status={order.status}
                  deliveryOtp={order.deliveryOtp}
                  isCorrectionFlow={order.status.startsWith("CORRECTION")}
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

                {/* Action buttons (Alteration request if delivered) */}
                {order.status === "DELIVERED" && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCorrectionModalOrder(order)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Request 100% Free Fit Alteration
                    </button>
                  </div>
                )}
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

      {/* Free Correction Modal */}
      {correctionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 text-champagne space-y-4">
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
                Request Free Alteration
              </h3>
              <p className="text-xs text-champagne/70 mt-1">
                Tell us where the fit needs tuning (e.g. bust loosening, waist tightening, sleeve shortening). A rider will collect the outfit for re-crafting.
              </p>
            </div>

            <form onSubmit={handleRequestCorrection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Alteration Instructions
                </label>
                <textarea
                  rows={4}
                  required
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="e.g. Please loosen bust by 0.75 inches and shorten sleeves by 1 inch..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCorrection}
                className="w-full py-3 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition disabled:opacity-50"
              >
                {isSubmittingCorrection
                  ? "Scheduling Alteration Pickup..."
                  : "Submit Free Alteration Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
