"use client";

import React, { useState } from "react";
import { TailorProfile, MenuItem, MeasurementData } from "@/lib/types";
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
  FileText,
  UserCheck,
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

  // 4 Measurement Choices (Modification 8)
  const [measurementType, setMeasurementType] = useState<
    "SAVED" | "MANUAL" | "REFERENCE_GARMENT" | "DOORSTEP"
  >("SAVED");

  // Guided Manual Measurements State
  const [manualBust, setManualBust] = useState<string>("36");
  const [manualWaist, setManualWaist] = useState<string>("30");
  const [manualHips, setManualHips] = useState<string>("38");
  const [manualShoulder, setManualShoulder] = useState<string>("14.5");
  const [manualArmhole, setManualArmhole] = useState<string>("16");
  const [manualSleeveLength, setManualSleeveLength] = useState<string>("15");
  const [manualGarmentLength, setManualGarmentLength] = useState<string>("38");
  const [manualNeckDepth, setManualNeckDepth] = useState<string>("7");
  const [manualSpecialNotes, setManualSpecialNotes] = useState<string>("");

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

    const measurementsPayload: MeasurementData | undefined =
      measurementType === "MANUAL"
        ? {
            bust: Number(manualBust) || undefined,
            chest: Number(manualBust) || undefined,
            waist: Number(manualWaist) || undefined,
            hip: Number(manualHips) || undefined,
            shoulder: Number(manualShoulder) || undefined,
            armhole: Number(manualArmhole) || undefined,
            sleeveLength: Number(manualSleeveLength) || undefined,
            blouseLength: Number(manualGarmentLength) || undefined,
            kurtiLength: Number(manualGarmentLength) || undefined,
            frontNeckDepth: Number(manualNeckDepth) || undefined,
            specialNotes: manualSpecialNotes,
          }
        : undefined;

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
          measurements: measurementsPayload,
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
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-maroon/95 via-wine-dark to-wine-dark border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne">
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
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateOrder} className="space-y-6">
            {/* 1. Choose Service from Tailor's Digital Menu */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
                1. Select Service From Tailor's Menu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
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
                      <span>~{item.estimatedDays} Days</span>
                      <span>•</span>
                      <span>{item.complexity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Choose Fit Method (Modification 8: 4 Clear Choices) */}
            <div>
              <label className="block text-xs font-mono tracking-wider text-sand uppercase mb-2">
                2. How Would You Like Your Fit Taken? (Select One)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Saved Fit Profile */}
                <button
                  type="button"
                  onClick={() => setMeasurementType("SAVED")}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    measurementType === "SAVED"
                      ? "bg-burgundy text-sand border-sand shadow-sm"
                      : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-sand" />
                  <span className="text-xs font-semibold">1. Saved Profile</span>
                  <span className="text-[9px] text-champagne/60 leading-tight">
                    Use saved anatomical sizes
                  </span>
                </button>

                {/* 2. Manual Measurements */}
                <button
                  type="button"
                  onClick={() => setMeasurementType("MANUAL")}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    measurementType === "MANUAL"
                      ? "bg-burgundy text-sand border-sand shadow-sm"
                      : "bg-wine/60 text-champagne/80 border-sand/20 hover:border-sand/40"
                  }`}
                >
                  <Ruler className="w-4 h-4 text-sand" />
                  <span className="text-xs font-semibold">2. Manual Input</span>
                  <span className="text-[9px] text-champagne/60 leading-tight">
                    Guided tape measurement
                  </span>
                </button>

                {/* 3. Reference Garment */}
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
                  <span className="text-xs font-semibold">3. Sample Garment</span>
                  <span className="text-[9px] text-champagne/60 leading-tight">
                    We clone your best-fitting outfit
                  </span>
                </button>

                {/* 4. Doorstep Measurement */}
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
                  <span className="text-xs font-semibold">4. Doorstep Visit</span>
                  <span className="text-[9px] text-champagne/60 leading-tight">
                    Master tailor visits home
                  </span>
                </button>
              </div>

              {/* Guided Manual Fields when MANUAL is selected */}
              {measurementType === "MANUAL" && (
                <div className="mt-4 p-4 rounded-2xl bg-maroon/60 border border-sand/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sand uppercase flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-sand" /> Guided Body Measurements (Inches)
                    </span>
                    <span className="text-[10px] text-champagne/60 font-mono">Standard Body Tape</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Bust / Chest
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualBust}
                        onChange={(e) => setManualBust(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="36"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Waist
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualWaist}
                        onChange={(e) => setManualWaist(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="30"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Hips
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualHips}
                        onChange={(e) => setManualHips(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="38"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Shoulder
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualShoulder}
                        onChange={(e) => setManualShoulder(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="14.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Armhole
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualArmhole}
                        onChange={(e) => setManualArmhole(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="16"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Sleeve Length
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualSleeveLength}
                        onChange={(e) => setManualSleeveLength(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="15"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Length (Kurta/Dress)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={manualGarmentLength}
                        onChange={(e) => setManualGarmentLength(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="38"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                        Neck Depth
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={manualNeckDepth}
                        onChange={(e) => setManualNeckDepth(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-sand font-bold"
                        placeholder="7"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand/80 uppercase mb-0.5">
                      Special Fit Notes
                    </label>
                    <input
                      type="text"
                      value={manualSpecialNotes}
                      onChange={(e) => setManualSpecialNotes(e.target.value)}
                      placeholder="e.g. Keep 1-inch extra margin inside seams, high neck collar..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-wine-dark border border-sand/25 text-champagne"
                    />
                  </div>
                </div>
              )}
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
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
                className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
              />
            </div>

            {/* Pricing Summary Preview */}
            {selectedItem && (
              <div className="p-3.5 rounded-2xl bg-wine-dark/80 border border-sand/25 flex justify-between items-center text-xs">
                <div>
                  <span className="text-sand font-bold">{selectedItem.name}</span>
                  <p className="text-[10px] text-champagne/70 mt-0.5">
                    Includes Doorstep Pickup & Delivery • 100% Fit Guarantee
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-serif font-bold text-sand">
                    {formatINR(selectedItem.basePrice + 100)}
                  </span>
                  <p className="text-[10px] text-champagne/60 font-mono">+ 5% GST</p>
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

      {/* Payment Checkout Modal */}
      {createdOrder && (
        <PaymentCheckoutModal
          order={createdOrder}
          isOpen={!!createdOrder}
          onClose={() => {
            setCreatedOrder(null);
            onClose();
          }}
          onPaymentSuccess={() => {
            setCreatedOrder(null);
            onClose();
            window.location.href = "/orders";
          }}
        />
      )}
    </>
  );
}
