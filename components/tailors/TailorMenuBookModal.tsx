"use client";

import React, { useState } from "react";
import { TailorProfile, MenuItem } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  X,
  Scissors,
  Ruler,
  Truck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import PaymentCheckoutModal from "@/components/checkout/PaymentCheckoutModal";

interface TailorMenuBookModalProps {
  tailor: TailorProfile;
  initialMenuItem?: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TailorMenuBookModal({
  tailor,
  initialMenuItem,
  isOpen,
  onClose,
}: TailorMenuBookModalProps) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(
    initialMenuItem || tailor.menuItems[0] || null
  );
  const [measurementType, setMeasurementType] = useState<
    "SAVED" | "REFERENCE_GARMENT" | "DOORSTEP"
  >("SAVED");
  const [pickupAddress, setPickupAddress] = useState(
    "Flat 402, Royal Palms, Greater Kailash 1, New Delhi"
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Flat 402, Royal Palms, Greater Kailash 1, New Delhi"
  );
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailorId: tailor.id,
          garmentName: selectedItem.name,
          garmentCategory: selectedItem.category,
          menuItemId: selectedItem.id,
          pickupAddress,
          deliveryAddress,
          measurementType,
          design: {
            specialInstructions,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setCreatedOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to book tailoring service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-sand uppercase">
              BOOK DOORSTEP STITCHING
            </span>
            <h2 className="font-serif text-2xl font-bold text-sand-light mt-1">
              {tailor.businessName}
            </h2>
            <p className="text-xs text-champagne/70 mt-0.5">
              Certified Master Tailor • {tailor.city} • 100% Fit Guarantee
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="space-y-6">
            {/* 1. Choose Service from Tailor's Digital Menu */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
                1. Select Service From Tailor's Menu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {tailor.menuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedItem?.id === item.id
                        ? "bg-burgundy/80 border-sand text-sand-light shadow-gold-glow"
                        : "bg-wine/60 border-sand/15 text-champagne/80 hover:border-sand/40"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-xs text-sand-light">{item.name}</span>
                      <span className="font-bold text-xs text-sand">{formatINR(item.basePrice)}</span>
                    </div>
                    <p className="text-[11px] text-champagne/70 mt-1 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-champagne/60 font-mono">
                      <span>{item.estimatedDays} Days</span>
                      <span>•</span>
                      <span>{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Choose Fit Method (Requirement 14) */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
                2. How Would You Like Your Fit Taken?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMeasurementType("SAVED")}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    measurementType === "SAVED"
                      ? "bg-burgundy text-sand border-sand shadow-sm"
                      : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                  }`}
                >
                  <Ruler className="w-4 h-4 text-sand" />
                  <span className="text-xs font-medium">Saved Fit Profile</span>
                  <span className="text-[10px] text-champagne/60">Anatomical sizes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeasurementType("REFERENCE_GARMENT")}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    measurementType === "REFERENCE_GARMENT"
                      ? "bg-burgundy text-sand border-sand shadow-sm"
                      : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                  }`}
                >
                  <Scissors className="w-4 h-4 text-sand" />
                  <span className="text-xs font-medium">Sample Garment</span>
                  <span className="text-[10px] text-champagne/60">We clone your best fit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeasurementType("DOORSTEP")}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    measurementType === "DOORSTEP"
                      ? "bg-burgundy text-sand border-sand shadow-sm"
                      : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                  }`}
                >
                  <Truck className="w-4 h-4 text-sand" />
                  <span className="text-xs font-medium">Doorstep Master</span>
                  <span className="text-[10px] text-champagne/60">Expert visit</span>
                </button>
              </div>
            </div>

            {/* 3. Doorstep Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Doorstep Fabric Pickup Address
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Doorstep Return Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-mono text-sand mb-1 uppercase">
                Special Tailoring Notes / Piping / Lining
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Princess cut, concealed side zipper, cotton voile inner lining..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
              />
            </div>

            {/* Pricing Summary Preview */}
            {selectedItem && (
              <div className="p-3 rounded-xl bg-wine-dark/80 border border-sand/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-sand font-medium">{selectedItem.name}</span>
                  <p className="text-[10px] text-champagne/60">
                    Includes Doorstep Pickup & Delivery • 100% Fit Guarantee
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-serif font-bold text-sand">
                    {formatINR(selectedItem.basePrice + 100)}
                  </span>
                  <p className="text-[10px] text-champagne/60">+ Taxes</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-medium text-sm text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4 text-sand" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Immediate Payment Checkout Trigger */}
      {createdOrder && (
        <PaymentCheckoutModal
          order={createdOrder}
          isOpen={!!createdOrder}
          onClose={() => {
            setCreatedOrder(null);
            onClose();
          }}
          onPaymentSuccess={(updated) => {
            setCreatedOrder(null);
            onClose();
            window.location.href = `/orders`;
          }}
        />
      )}
    </>
  );
}
