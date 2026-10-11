"use client";

import React, { useState, useEffect } from "react";
import { TailorProfile, MenuItem, MeasurementData } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  X,
  Scissors,
  Ruler,
  Truck,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  ExternalLink,
  Clock,
  CreditCard,
  Lock,
  Image as ImageIcon,
  Tag,
  MapPin,
} from "lucide-react";
import PaymentCheckoutModal from "@/components/checkout/PaymentCheckoutModal";
import PaymentMethodSelector, { PaymentMethodId } from "@/components/checkout/PaymentMethodSelector";
import ApplyCouponModal from "@/components/checkout/ApplyCouponModal";
import AddressSelectorModal from "@/components/address/AddressSelectorModal";
import confetti from "canvas-confetti";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { t } = useLanguage();

  // Current Step: 1 = Customize, 2 = Review & Confirm, 3 = Order Success
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(
    initialMenuItem || tailor.menuItems[0] || null
  );

  // 1. Quantity Selection
  const [quantity, setQuantity] = useState<number>(1);

  // 2. Measurement Choices
  const [measurementType, setMeasurementType] = useState<
    "SAVED" | "MANUAL" | "REFERENCE_GARMENT" | "DOORSTEP"
  >("SAVED");

  // Saved Profiles State
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingProfiles(true);
      fetch("/api/measurements")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.measurements)) {
            setSavedProfiles(data.measurements);
            if (data.measurements.length > 0) {
              const matching = data.measurements.find(
                (p: any) =>
                  (p?.garmentType && selectedItem?.category && p.garmentType.toLowerCase() === selectedItem.category.toLowerCase()) ||
                  (p?.profileName && selectedItem?.name && p.profileName.toLowerCase().includes(selectedItem.name.toLowerCase()))
              );
              const defaultProf = data.measurements.find((p: any) => p?.isDefault);
              setSelectedProfileId(
                matching ? matching.id : defaultProf ? defaultProf.id : data.measurements[0]?.id
              );
            }
          }
        })
        .catch((err) => console.error("Error loading fit profiles:", err))
        .finally(() => setIsLoadingProfiles(false));
    }
  }, [isOpen, user, selectedItem]);

  // Guided Manual Measurements State
  const [manualUnit, setManualUnit] = useState<"in" | "cm">("in");
  const [manualBust, setManualBust] = useState<string>("36");
  const [manualWaist, setManualWaist] = useState<string>("30");
  const [manualHips, setManualHips] = useState<string>("38");
  const [manualShoulder, setManualShoulder] = useState<string>("14.5");
  const [manualArmhole, setManualArmhole] = useState<string>("16");
  const [manualSleeveLength, setManualSleeveLength] = useState<string>("15");
  const [manualGarmentLength, setManualGarmentLength] = useState<string>("38");
  const [manualNeckDepth, setManualNeckDepth] = useState<string>("7");
  const [manualSpecialNotes, setManualSpecialNotes] = useState<string>("");

  // 3. Design & Styling Preferences
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const [necklinePreference, setNecklinePreference] = useState<string>("Round Neck");
  const [sleevePreference, setSleevePreference] = useState<string>("Regular 3/4th Sleeve");
  const [fitPreference, setFitPreference] = useState<string>("Tailored Fit");
  const [lengthPreference, setLengthPreference] = useState<string>("Standard Length");

  // 4. Order Notes / Special Instructions
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Auto-populate design reference image from Live Virtual Try-On handoff
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("silai_tryon_order_handoff") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.referenceImageUrl) {
            setReferenceImageUrl(parsed.referenceImageUrl);
          }
          if (parsed?.title && !specialInstructions) {
            setSpecialInstructions(`Live Try-On Inspiration: ${parsed.title}`);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [isOpen]);

  // 5. Customer & Delivery Address Confirmation
  const [customerName, setCustomerName] = useState<string>(user?.fullName || "Valued Customer");
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || "+91 98111 22233");
  const [pickupAddress, setPickupAddress] = useState<string>(
    "Indiranagar, 100 Feet Road, Bengaluru, Karnataka - 560038"
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    "Indiranagar, 100 Feet Road, Bengaluru, Karnataka - 560038"
  );
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [pickupSnapshot, setPickupSnapshot] = useState<string>("");
  const [deliverySnapshot, setDeliverySnapshot] = useState<string>("");
  const [sameAsPickup, setSameAsPickup] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [addressTarget, setAddressTarget] = useState<"PICKUP" | "DELIVERY">("PICKUP");

  useEffect(() => {
    if (user?.fullName) setCustomerName(user.fullName);
    if (user?.phone) setCustomerPhone(user.phone);
  }, [user]);

  useEffect(() => {
    if (sameAsPickup) {
      setDeliveryAddress(pickupAddress);
      setDeliveryCoords(pickupCoords);
      setDeliverySnapshot(pickupSnapshot);
    }
  }, [pickupAddress, pickupCoords, pickupSnapshot, sameAsPickup]);

  // 6. Promo Code State
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState<boolean>(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);

  const onApplyCouponSuccess = (code: string, discount: number, message: string) => {
    setCouponCode(code);
    setAppliedCouponCode(code);
    setCouponDiscount(discount);
    setCouponMessage(message);
    setCouponError(null);
  };

  // Submission State & Duplicate Order Protection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodId>("COD");
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Selected Fit Profile Object
  const currentSavedProfile = savedProfiles.find((p) => p.id === selectedProfileId);

  // Price Calculations (Server recalculates this genuinely)
  const basePrice = selectedItem?.basePrice || 850;
  const subtotal = basePrice * quantity;
  const doorstepDeliveryFee = 100;
  const activeDiscount = appliedCouponCode ? couponDiscount : 0;
  const taxableSubtotal = Math.max(0, subtotal - activeDiscount);
  const gstAmount = Math.round(taxableSubtotal * 0.05);
  const finalEstimatedTotal = taxableSubtotal + doorstepDeliveryFee + gstAmount;

  // Validate Promo Code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedItem) return;
    setIsCheckingCoupon(true);
    setCouponError(null);
    setCouponMessage(null);

    try {
      const res = await fetch("/api/offers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          tailorId: tailor.id,
          subtotal: subtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid promo code");
        setCouponDiscount(0);
        setAppliedCouponCode("");
      } else {
        setCouponDiscount(data.discountAmount);
        setAppliedCouponCode(data.code || couponCode.trim().toUpperCase());
        setCouponMessage(data.message || `Promo code applied — ₹${data.discountAmount} OFF`);
      }
    } catch (err) {
      setCouponError("Could not validate coupon");
      setCouponDiscount(0);
      setAppliedCouponCode("");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCouponCode("");
    setCouponMessage(null);
    setCouponError(null);
  };

  // Move from Step 1 to Step 2 (Review)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      setErrorMsg("Please select a tailoring service.");
      return;
    }
    if (!pickupAddress.trim() || !deliveryAddress.trim()) {
      setErrorMsg("Please provide both pickup and delivery addresses.");
      return;
    }
    setErrorMsg("");
    setModalStep(2);
  };

  // Submit Order (Step 2 -> Step 3)
  const handleConfirmAndCreateOrder = async () => {
    if (!selectedItem || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const measurementsPayload: MeasurementData | undefined =
      measurementType === "MANUAL"
        ? {
            unit: manualUnit,
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

    const designPayload = {
      title: `${selectedItem.name} Reference`,
      referenceImageUrl: referenceImageUrl.trim() || undefined,
      neckline: necklinePreference,
      sleeveStyle: sleevePreference,
      lengthPreference: lengthPreference,
      fitPreference: fitPreference,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailorId: tailor.id,
          garmentName: selectedItem.name,
          garmentCategory: selectedItem.category,
          menuItemId: selectedItem.id,
          quantity: quantity,
          pickupAddress: pickupAddress.trim(),
          deliveryAddress: deliveryAddress.trim(),
          pickupLatitude: pickupCoords?.lat,
          pickupLongitude: pickupCoords?.lng,
          deliveryLatitude: sameAsPickup ? pickupCoords?.lat : deliveryCoords?.lat,
          deliveryLongitude: sameAsPickup ? pickupCoords?.lng : deliveryCoords?.lng,
          pickupAddressSnapshot: pickupSnapshot || pickupAddress.trim(),
          deliveryAddressSnapshot: (sameAsPickup ? pickupSnapshot : deliverySnapshot) || deliveryAddress.trim(),
          measurementType: measurementType,
          appliedCoupon: appliedCouponCode || undefined,
          paymentMethod: selectedPaymentMethod,
          measurementProfileId:
            measurementType === "SAVED" ? selectedProfileId || undefined : undefined,
          measurements: measurementsPayload,
          design: designPayload,
          orderNotes: specialInstructions.trim() || undefined,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order. Please try again.");
      }

      setCreatedOrder(data.order);

      if (selectedPaymentMethod === "COD") {
        setModalStep(3);
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F2D9A0", "#75162D", "#F2E5C6", "#560B18"],
        });
      } else {
        // Launch Razorpay Payment Modal for UPI / Credit Card / Debit Card
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to book tailoring service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-in fade-in">
        <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/25 dark:border-burgundy/40 shadow-2xl p-5 sm:p-8 text-wine dark:text-champagne">
          {/* Close Button */}
          {modalStep !== 3 && (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-1.5 text-wine/50 hover:text-burgundy hover:bg-sand/30 rounded-full transition disabled:opacity-30"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* ============================================================== */}
          {/* STEP 1: CUSTOMIZE ORDER & PREFERENCES                           */}
          {/* ============================================================== */}
          {modalStep === 1 && (
            <div>
              {/* Header */}
              <div className="text-center mb-6">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-burgundy font-semibold uppercase">
                  {t("booking.commissionBadge", "BESPOKE ATELIER COMMISSION")}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wine mt-1">
                  {tailor.businessName}
                </h2>
                <p className="text-xs text-wine/70 mt-0.5">
                  {t("booking.masterArtisan", "Certified Master Artisan")} • {tailor.city} • {t("booking.fitGuarantee100", "100% Fit Guarantee")}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg("")} className="text-rose-500 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleProceedToReview} className="space-y-6">
                {/* 1. Tailor Menu Service Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono tracking-wider text-burgundy font-semibold uppercase">
                      {t("booking.step1Title", "1. Select Service & Complexity")}
                    </label>
                    <span className="text-[10px] text-wine/60 font-mono">
                      {tailor.menuItems.length} {t("booking.servicesAvailable", "Services Available")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {tailor.menuItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? "bg-gradient-to-r from-burgundy to-maroon border-burgundy text-champagne shadow-sm"
                              : "bg-[#F2E5C6]/40 border-burgundy/20 text-wine/80 hover:border-burgundy/40"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span
                              className={`font-semibold text-xs ${
                                isSelected ? "text-champagne font-bold" : "text-wine"
                              }`}
                            >
                              {item.name}
                            </span>
                            <span
                              className={`font-bold text-xs shrink-0 ${
                                isSelected ? "text-sand-light" : "text-burgundy"
                              }`}
                            >
                              {formatINR(item.basePrice)}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-1 line-clamp-1 ${
                              isSelected ? "text-champagne/80" : "text-wine/70"
                            }`}
                          >
                            {item.description}
                          </p>
                          <div
                            className={`flex items-center gap-2 mt-2 text-[10px] font-mono ${
                              isSelected ? "text-champagne/70" : "text-wine/60"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{item.estimatedDays} {t("booking.days", "Days")}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {(item.complexity || "REGULAR").toLowerCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quantity Selection */}
                <div className="p-3.5 rounded-2xl bg-[#F2E5C6]/50 border border-burgundy/20 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-mono tracking-wider text-burgundy font-semibold uppercase block">
                      {t("booking.step2Title", "2. Garment Quantity")}
                    </label>
                    <p className="text-[11px] text-wine/70">
                      {t("booking.quantitySubtitle", "Standard luxury stitching per tailored piece")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-burgundy/10 text-burgundy font-bold text-base hover:bg-burgundy/20 disabled:opacity-30 transition flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-burgundy w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="w-8 h-8 rounded-lg bg-burgundy/10 text-burgundy font-bold text-base hover:bg-burgundy/20 disabled:opacity-30 transition flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 3. Fit Profile Selection */}
                <div>
                  <label className="block text-xs font-mono tracking-wider text-burgundy font-semibold uppercase mb-2">
                    {t("booking.step3Title", "3. How Would You Like Your Fit Taken?")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Saved Profile */}
                    <button
                      type="button"
                      onClick={() => setMeasurementType("SAVED")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        measurementType === "SAVED"
                          ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border-burgundy shadow-sm"
                          : "bg-[#F2E5C6]/50 text-wine/80 border-burgundy/20 hover:border-burgundy/40"
                      }`}
                    >
                      <UserCheck
                        className={`w-4 h-4 ${
                          measurementType === "SAVED" ? "text-champagne" : "text-burgundy"
                        }`}
                      />
                      <span className="text-xs font-semibold">{t("booking.savedVault", "1. Saved Vault")}</span>
                      <span
                        className={`text-[9px] leading-tight ${
                          measurementType === "SAVED" ? "text-champagne/80" : "text-wine/60"
                        }`}
                      >
                        {t("booking.savedVaultDesc", "Use saved profile")}
                      </span>
                    </button>

                    {/* Manual Input */}
                    <button
                      type="button"
                      onClick={() => setMeasurementType("MANUAL")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        measurementType === "MANUAL"
                          ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border-burgundy shadow-sm"
                          : "bg-[#F2E5C6]/50 text-wine/80 border-burgundy/20 hover:border-burgundy/40"
                      }`}
                    >
                      <Ruler
                        className={`w-4 h-4 ${
                          measurementType === "MANUAL" ? "text-champagne" : "text-burgundy"
                        }`}
                      />
                      <span className="text-xs font-semibold">{t("booking.manualTape", "2. Manual Tape")}</span>
                      <span
                        className={`text-[9px] leading-tight ${
                          measurementType === "MANUAL" ? "text-champagne/80" : "text-wine/60"
                        }`}
                      >
                        {t("booking.manualTapeDesc", "Enter sizes now")}
                      </span>
                    </button>

                    {/* Sample Garment */}
                    <button
                      type="button"
                      onClick={() => setMeasurementType("REFERENCE_GARMENT")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        measurementType === "REFERENCE_GARMENT"
                          ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border-burgundy shadow-sm"
                          : "bg-[#F2E5C6]/50 text-wine/80 border-burgundy/20 hover:border-burgundy/40"
                      }`}
                    >
                      <Scissors
                        className={`w-4 h-4 ${
                          measurementType === "REFERENCE_GARMENT"
                            ? "text-champagne"
                            : "text-burgundy"
                        }`}
                      />
                      <span className="text-xs font-semibold">{t("booking.cloneOutfit", "3. Clone Outfit")}</span>
                      <span
                        className={`text-[9px] leading-tight ${
                          measurementType === "REFERENCE_GARMENT"
                            ? "text-champagne/80"
                            : "text-wine/60"
                        }`}
                      >
                        {t("booking.cloneOutfitDesc", "Pickup sample fit")}
                      </span>
                    </button>

                    {/* Doorstep Visit */}
                    <button
                      type="button"
                      onClick={() => setMeasurementType("DOORSTEP")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        measurementType === "DOORSTEP"
                          ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border-burgundy shadow-sm"
                          : "bg-[#F2E5C6]/50 text-wine/80 border-burgundy/20 hover:border-burgundy/40"
                      }`}
                    >
                      <Truck
                        className={`w-4 h-4 ${
                          measurementType === "DOORSTEP" ? "text-champagne" : "text-burgundy"
                        }`}
                      />
                      <span className="text-xs font-semibold">{t("booking.doorstepVisit", "4. Doorstep Visit")}</span>
                      <span
                        className={`text-[9px] leading-tight ${
                          measurementType === "DOORSTEP" ? "text-champagne/80" : "text-wine/60"
                        }`}
                      >
                        {t("booking.doorstepVisitDesc", "Master visits home")}
                      </span>
                    </button>
                  </div>

                  {/* Saved Profiles Section */}
                  {measurementType === "SAVED" && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-white/80 border border-burgundy/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-wine uppercase flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-burgundy" /> {t("booking.chooseFromSaved", "Choose From Your Saved Profiles")}
                        </span>
                        <a
                          href="/fit-profile"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-burgundy hover:underline flex items-center gap-1 font-semibold"
                        >
                          {t("booking.createNewProfile", "Create New Profile")} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {isLoadingProfiles ? (
                        <div className="py-3 text-center text-xs text-wine/60 font-mono">
                          {t("booking.loadingProfiles", "Loading your saved fit profiles...")}
                        </div>
                      ) : savedProfiles.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[#F2E5C6]/30 border border-burgundy/15 text-center space-y-2">
                          <p className="text-xs text-wine/75">
                            {t("booking.noProfilesFound", "No saved fit profiles found in your vault yet.")}
                          </p>
                          <button
                            type="button"
                            onClick={() => setMeasurementType("MANUAL")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-burgundy to-maroon text-champagne text-xs font-medium hover:opacity-90"
                          >
                            <Ruler className="w-3.5 h-3.5" /> {t("booking.enterManuallyBtn", "Enter Measurements Manually")}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                          {savedProfiles.map((p) => {
                            const isSelected = selectedProfileId === p.id;
                            const isMatch =
                              Boolean(
                                (p?.garmentType &&
                                  selectedItem?.category &&
                                  p.garmentType.toLowerCase() ===
                                    selectedItem.category.toLowerCase()) ||
                                (p?.profileName &&
                                  selectedItem?.name &&
                                  p.profileName
                                    .toLowerCase()
                                    .includes(selectedItem.name.toLowerCase()))
                              );
                            const measCount =
                              Object.keys(p.measurements || {}).length +
                              (p.customFields?.length || 0);

                            return (
                              <div
                                key={p.id}
                                onClick={() => setSelectedProfileId(p.id)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition text-left relative ${
                                  isSelected
                                    ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border-burgundy shadow-sm"
                                    : "bg-[#F2E5C6]/40 border-burgundy/20 text-wine hover:border-burgundy/40"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span
                                    className={`text-xs font-bold leading-tight ${
                                      isSelected ? "text-champagne" : "text-wine"
                                    }`}
                                  >
                                    {p.profileName}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle className="w-4 h-4 text-sand-light shrink-0" />
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px]">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono uppercase ${
                                      isSelected
                                        ? "bg-white/20 text-champagne"
                                        : "bg-burgundy/10 text-burgundy font-semibold"
                                    }`}
                                  >
                                    {p.customGarmentName || p.garmentType}
                                  </span>
                                  <span
                                    className={`font-mono ${
                                      isSelected ? "text-champagne/80" : "text-wine/70"
                                    }`}
                                  >
                                    Unit: {p.unit?.toUpperCase() || "IN"}
                                  </span>
                                  <span
                                    className={`font-mono ${
                                      isSelected ? "text-champagne/80" : "text-wine/70"
                                    }`}
                                  >
                                    • {measCount} {t("booking.points", "Points")}
                                  </span>
                                </div>

                                {isMatch && (
                                  <div
                                    className={`mt-1 text-[9px] font-semibold flex items-center gap-1 ${
                                      isSelected ? "text-sand-light" : "text-emerald-700"
                                    }`}
                                  >
                                    <Sparkles className="w-2.5 h-2.5" /> {t("booking.recommendedFor", "Recommended for")}{" "}
                                    {selectedItem?.name}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Fields Section */}
                  {measurementType === "MANUAL" && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-white/80 border border-burgundy/25 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-wine uppercase flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-burgundy" /> {t("booking.guidedTapeTitle", "Guided Tape Measurements")}
                        </span>
                        <div className="flex items-center gap-1 bg-[#F2E5C6]/60 p-1 rounded-lg border border-burgundy/20">
                          <button
                            type="button"
                            onClick={() => setManualUnit("in")}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                              manualUnit === "in"
                                ? "bg-burgundy text-champagne"
                                : "text-wine/70 hover:text-wine"
                            }`}
                          >
                            {t("booking.inches", "INCHES")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualUnit("cm")}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                              manualUnit === "cm"
                                ? "bg-burgundy text-champagne"
                                : "text-wine/70 hover:text-wine"
                            }`}
                          >
                            {t("booking.cm", "CM")}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.bustChest", "Bust / Chest")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualBust}
                            onChange={(e) => setManualBust(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.waist", "Waist")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualWaist}
                            onChange={(e) => setManualWaist(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.hips", "Hips")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualHips}
                            onChange={(e) => setManualHips(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.shoulder", "Shoulder")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualShoulder}
                            onChange={(e) => setManualShoulder(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.armhole", "Armhole")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualArmhole}
                            onChange={(e) => setManualArmhole(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.sleeveLength", "Sleeve Length")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualSleeveLength}
                            onChange={(e) => setManualSleeveLength(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.totalLength", "Total Length")}
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={manualGarmentLength}
                            onChange={(e) => setManualGarmentLength(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                            {t("booking.neckDepth", "Neck Depth")}
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={manualNeckDepth}
                            onChange={(e) => setManualNeckDepth(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Garment Note */}
                  {measurementType === "REFERENCE_GARMENT" && (
                    <div className="mt-3 p-3 rounded-xl bg-sand/30 border border-burgundy/20 text-xs text-wine/80 flex items-center gap-2.5">
                      <Scissors className="w-4 h-4 text-burgundy shrink-0" />
                      <span>
                        {t("booking.sampleGarmentNotice", "Our delivery concierge will collect your best-fitting sample garment during fabric pickup. The tailor will duplicate its exact silhouettes and return both pieces.")}
                      </span>
                    </div>
                  )}

                  {/* Doorstep Visit Note */}
                  {measurementType === "DOORSTEP" && (
                    <div className="mt-3 p-3 rounded-xl bg-sand/30 border border-burgundy/20 text-xs text-wine/80 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-burgundy shrink-0" />
                      <span>
                        {t("booking.doorstepVisitNotice", "A certified master tailor will visit your residence with styling books and measurement tapes to record comprehensive body parameters in person.")}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Design & Reference Attachment */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono tracking-wider text-burgundy font-semibold uppercase flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-burgundy" /> {t("booking.step4Title", "4. Design Reference & Style Preferences")}
                    </label>
                    <span className="text-[10px] text-wine/60 font-mono">{t("booking.originalReference", "Original Reference")}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-wine/75 uppercase mb-1">
                      {t("booking.referencePhotoLabel", "Reference Photo URL / Atelier Inspiration")}
                    </label>
                    <input
                      type="url"
                      value={referenceImageUrl}
                      onChange={(e) => setReferenceImageUrl(e.target.value)}
                      placeholder={t("booking.referencePhotoPlaceholder", "https://images.unsplash.com/... or paste design link")}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine placeholder:text-wine/40 focus:outline-none focus:border-burgundy"
                    />
                    <p className="text-[10px] text-wine/60 mt-1">
                      {t("booking.referencePhotoNotice", "* The original reference image is saved directly to your commission and serves as the authoritative karigari guide.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                        {t("booking.necklinePref", "Neckline Preference")}
                      </label>
                      <select
                        value={necklinePreference}
                        onChange={(e) => setNecklinePreference(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-medium focus:outline-none focus:border-burgundy"
                      >
                        <option>Round Neck</option>
                        <option>Boat Neck</option>
                        <option>Sweetheart Neck</option>
                        <option>Deep V-Neck</option>
                        <option>Mandarin Collar</option>
                        <option>Square Neck</option>
                        <option>Custom (See Notes)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                        {t("booking.sleevePref", "Sleeve Style")}
                      </label>
                      <select
                        value={sleevePreference}
                        onChange={(e) => setSleevePreference(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-medium focus:outline-none focus:border-burgundy"
                      >
                        <option>Regular 3/4th Sleeve</option>
                        <option>Elbow Length</option>
                        <option>Full Sleeve</option>
                        <option>Sleeveless</option>
                        <option>Cap Sleeve</option>
                        <option>Bell Sleeve</option>
                        <option>Puff Sleeve</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                        {t("booking.silhouetteFit", "Silhouette & Fit")}
                      </label>
                      <select
                        value={fitPreference}
                        onChange={(e) => setFitPreference(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-medium focus:outline-none focus:border-burgundy"
                      >
                        <option>Tailored Fit</option>
                        <option>Comfort Regular</option>
                        <option>Relaxed Flared</option>
                        <option>Slim Contoured</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. Special Tailoring Notes */}
                <div>
                  <label className="block text-xs font-mono text-burgundy font-semibold mb-1 uppercase">
                    {t("booking.step5Title", "5. Order Notes / Special Stitching Instructions")}
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder={t("booking.notesPlaceholder", "e.g. Cotton voile inner lining, 1.5-inch side margin, latkan dori on back neck...")}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine placeholder:text-wine/40 focus:outline-none focus:border-burgundy"
                  />
                </div>

                {/* 6. Contact & Doorstep Addresses */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/25 space-y-3">
                  <label className="text-xs font-mono tracking-wider text-burgundy font-semibold uppercase block">
                    {t("booking.step6Title", "6. Confirm Contact & Doorstep Delivery Address")}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                        {t("booking.customerFullName", "Customer Full Name")}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-semibold focus:outline-none focus:border-burgundy"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-0.5">
                        {t("booking.phoneForOtp", "Phone Number (for Courier OTP)")}
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-semibold focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold">
                        {t("booking.pickupAddressLabel", "Doorstep Fabric Pickup Address")}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressTarget("PICKUP");
                          setIsAddressModalOpen(true);
                        }}
                        className="text-[10px] text-burgundy hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-burgundy" />
                        <span>{t("booking.selectOnMap", "Select / Locate on Map")}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine focus:outline-none focus:border-burgundy"
                    />
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-wine/60 font-mono">
                      <span>Coordinates: {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}</span>
                      <span className="text-emerald-700 font-medium">{t("booking.bangaloreAreaVerified", "✓ Bangalore Delivery Area")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAsPickup}
                      onChange={(e) => setSameAsPickup(e.target.checked)}
                      className="rounded border-burgundy/40 text-burgundy focus:ring-burgundy"
                    />
                    <label htmlFor="sameAddress" className="text-xs text-wine/80 font-medium">
                      {t("booking.sameAddressCheckbox", "Finished garment delivery address is the same as pickup")}
                    </label>
                  </div>

                  {!sameAsPickup && (
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold">
                          {t("booking.returnDeliveryAddressLabel", "Doorstep Return Delivery Address")}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddressTarget("DELIVERY");
                            setIsAddressModalOpen(true);
                          }}
                          className="text-[10px] text-burgundy hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <MapPin className="w-3 h-3 text-burgundy" />
                          <span>{t("booking.selectOnMap", "Select / Locate on Map")}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine focus:outline-none focus:border-burgundy"
                      />
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-wine/60 font-mono">
                        <span>Coordinates: {deliveryCoords.lat.toFixed(4)}, {deliveryCoords.lng.toFixed(4)}</span>
                        <span className="text-emerald-700 font-medium">{t("booking.bangaloreAreaVerified", "✓ Bangalore Delivery Area")}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Promotional Privilege Voucher (Myntra-Style Apply Coupon) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-burgundy font-semibold uppercase">
                      {t("booking.step7Title", "7. Promotional Code / Privilege Voucher")}
                    </label>
                    {appliedCouponCode && (
                      <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {t("booking.savedBadge", "Saved")} {formatINR(activeDiscount)}
                      </span>
                    )}
                  </div>

                  {!appliedCouponCode ? (
                    <div
                      onClick={() => setIsCouponModalOpen(true)}
                      className="group p-3.5 rounded-2xl bg-white/80 border border-dashed border-burgundy/30 hover:border-burgundy hover:bg-[#F2E5C6]/30 transition cursor-pointer flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-burgundy/10 flex items-center justify-center text-burgundy group-hover:scale-105 transition">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-serif font-bold text-wine">
                            {t("booking.applyCouponTitle", "Apply Coupon / Privilege Code")}
                          </p>
                          <p className="text-[11px] text-wine/60">
                            {t("booking.applyCouponSubtitle", "Check available discount vouchers for your order")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCouponModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-burgundy text-champagne hover:bg-maroon transition shadow-sm"
                      >
                        {t("booking.applyBtn", "Apply")}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded-md border border-emerald-300">
                              {appliedCouponCode}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700">
                              {t("booking.couponAppliedSuccess", "Applied ✓")}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                            {t("booking.couponSavingNotice", "You are saving with this commission privilege.")} ({formatINR(activeDiscount)})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCouponModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-burgundy hover:bg-burgundy/10 transition"
                        >
                          {t("booking.changeCoupon", "Change")}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-rose-700 hover:bg-rose-100 transition"
                        >
                          {t("booking.removeCoupon", "Remove")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. Transparent Price Summary Preview */}
                {selectedItem && (
                  <div className="p-4 rounded-2xl bg-[#F2E5C6]/70 border border-burgundy/25 space-y-2">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-burgundy/15">
                      <span className="font-semibold text-wine">
                        {selectedItem.name} ({t("booking.basePriceLabel", "Base Price")}: {formatINR(basePrice)} × {quantity})
                      </span>
                      <span className="font-mono font-bold text-wine">{formatINR(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-wine/80">
                      <span>{t("booking.pickupDeliveryFee", "Doorstep Pickup & Delivery")}</span>
                      <span className="font-mono font-medium">{formatINR(doorstepDeliveryFee)}</span>
                    </div>

                    {activeDiscount > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-700 font-medium">
                        <span>{t("booking.privilegePromo", "Privilege Promo")} ({appliedCouponCode})</span>
                        <span className="font-mono font-bold">-{formatINR(activeDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-wine/80">
                      <span>{t("booking.estimatedGst", "Estimated GST (5%)")}</span>
                      <span className="font-mono font-medium">{formatINR(gstAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-burgundy/20 font-bold">
                      <span className="text-xs uppercase tracking-wider text-burgundy font-mono">
                        {t("booking.finalPayable", "Estimated Final Payable")}
                      </span>
                      <span className="font-serif text-lg text-burgundy">
                        {formatINR(finalEstimatedTotal)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Proceed to Review CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-medium text-sm text-champagne bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-burgundy/40 hover:opacity-95 shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <span>{t("booking.reviewOrderBtn", "Review Order & Confirmation")}</span>
                  <ArrowRight className="w-4 h-4 text-champagne" />
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: ORDER REVIEW & CONFIRMATION                             */}
          {/* ============================================================== */}
          {modalStep === 2 && selectedItem && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-4 border-b border-burgundy/15">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-burgundy font-semibold uppercase">
                  {t("booking.confirmationVerified", "CONFIRM YOUR BESPOKE COMMISSION")}
                </span>
                <h2 className="font-serif text-2xl font-bold text-wine mt-1">
                  {t("booking.reviewTitle", "Order Review & Verification")}
                </h2>
                <p className="text-xs text-wine/70 mt-0.5">
                  {t("booking.reviewSubtitle", "Please verify your tailored garment parameters before final placement.")}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Review Cards Grid */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Tailor & Atelier Details */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                      {t("booking.masterAtelier", "Master Atelier")}
                    </span>
                    <h4 className="font-serif text-base font-bold text-wine">
                      {tailor.businessName}
                    </h4>
                    <p className="text-wine/70 text-[11px]">
                      {tailor.address}, {tailor.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-3 h-3" /> {t("booking.fitGuarantee100", "100% Fit Guarantee")}
                    </span>
                  </div>
                </div>

                {/* 2. Service & Garment Specifications */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                    {t("booking.garmentCraftsmanship", "Garment & Craftsmanship")}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-wine/80">
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.service", "Service")}</p>
                      <p className="font-semibold text-wine">{selectedItem.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.quantity", "Quantity")}</p>
                      <p className="font-semibold font-mono text-wine">{quantity} Piece(s)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.complexity", "Complexity")}</p>
                      <p className="font-semibold capitalize text-wine">
                        {(selectedItem.complexity || "REGULAR").toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.estStitching", "Est. Stitching")}</p>
                      <p className="font-semibold font-mono text-wine">
                        ~{selectedItem.estimatedDays} {t("booking.days", "Days")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Fit Profile Summary */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                    {t("booking.fitSpecification", "Fit Specification")}
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-wine">
                      {t("booking.method", "Method")}: {(measurementType || "SAVED").replace(/_/g, " ")}
                    </span>
                    {measurementType === "SAVED" && currentSavedProfile && (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-burgundy/10 text-burgundy font-bold">
                        {currentSavedProfile.profileName} (
                        {currentSavedProfile.unit?.toUpperCase() || "IN"})
                      </span>
                    )}
                    {measurementType === "MANUAL" && (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-burgundy/10 text-burgundy font-bold">
                        {t("booking.bustChest", "Bust")}: {manualBust}" | {t("booking.waist", "Waist")}: {manualWaist}" | {t("booking.hips", "Hips")}: {manualHips}"
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Design & Style Preferences */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                    {t("booking.designStylingGuide", "Design & Styling Guide")}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-wine/80">
                    <span>
                      <strong>{t("booking.neckline", "Neckline")}:</strong> {necklinePreference}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{t("booking.sleeve", "Sleeve")}:</strong> {sleevePreference}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{t("booking.fit", "Fit")}:</strong> {fitPreference}
                    </span>
                  </div>
                  {referenceImageUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <ImageIcon className="w-3.5 h-3.5 text-burgundy" />
                      <a
                        href={referenceImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-burgundy underline line-clamp-1"
                      >
                        {t("booking.attachedReference", "Attached Reference Image Preview")}
                      </a>
                    </div>
                  )}
                  {specialInstructions && (
                    <p className="text-[11px] text-wine/75 italic bg-[#F2E5C6]/40 p-2 rounded-lg mt-1">
                      "{specialInstructions}"
                    </p>
                  )}
                </div>

                {/* 5. Address & Customer Contact */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                    {t("booking.customerLogistics", "Customer Contact & Logistics")}
                  </span>
                  <p className="font-semibold text-wine">
                    {customerName} • {customerPhone}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-wine/80 pt-1">
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.pickupLocation", "Pickup Location")}</p>
                      <p className="text-[11px]">{pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-wine/60 uppercase">{t("booking.returnDelivery", "Return Delivery")}</p>
                      <p className="text-[11px]">{deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* 6. Payment Method Selection (COD or Razorpay Test Mode) */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-burgundy/20">
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    onSelectMethod={setSelectedPaymentMethod}
                  />
                </div>

                {/* 7. Itemized Price Review */}
                <div className="p-4 rounded-2xl bg-[#F2E5C6]/80 border border-burgundy/30 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-burgundy font-bold block">
                    {t("booking.priceBreakdown", "Transparent Price Breakdown")}
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span>
                      {t("booking.stitchingSubtotal", "Stitching Subtotal")} ({formatINR(basePrice)} × {quantity})
                    </span>
                    <span className="font-mono font-bold">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-wine/80">
                    <span>{t("booking.pickupDeliveryFee", "Doorstep Fabric Pickup & Secure Return")}</span>
                    <span className="font-mono font-medium">{formatINR(doorstepDeliveryFee)}</span>
                  </div>
                  {activeDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
                      <span>{t("booking.privilegePromo", "Privilege Promo Applied")} ({appliedCouponCode})</span>
                      <span className="font-mono">-{formatINR(activeDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-wine/80">
                    <span>{t("booking.estimatedGst", "GST (5% Government Tax)")}</span>
                    <span className="font-mono font-medium">{formatINR(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-wine/80 pt-1 border-t border-burgundy/10">
                    <span>{t("booking.paymentLabel", "Payment Method")}</span>
                    <span className="font-mono font-semibold text-burgundy">
                      {selectedPaymentMethod === "COD"
                        ? "Cash on Delivery"
                        : `${selectedPaymentMethod.replace(/_/g, " ")} (Razorpay Test Mode)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-burgundy/20 font-bold">
                    <span className="text-xs uppercase tracking-wider text-burgundy font-mono">
                      {t("booking.finalPayable", "Final Payable Amount")}
                    </span>
                    <span className="font-serif text-xl text-burgundy">
                      {formatINR(finalEstimatedTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons with Duplicate Order Protection */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  disabled={isSubmitting}
                  className="px-4 py-3 rounded-xl font-medium text-xs text-wine/80 bg-sand/30 border border-burgundy/20 hover:bg-sand/60 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("booking.backToEdit", "Back to Edit")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndCreateOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-medium text-sm text-champagne bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-burgundy/40 hover:opacity-95 shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-champagne border-t-transparent rounded-full animate-spin" />
                      <span>{t("booking.creatingOrder", "Creating your order...")}</span>
                    </>
                  ) : selectedPaymentMethod === "COD" ? (
                    <>
                      <span>{t("booking.placeOrderCod", "Place Order (Cash on Delivery)")}</span>
                      <ShieldCheck className="w-4 h-4 text-champagne" />
                    </>
                  ) : (
                    <>
                      <span>{t("booking.proceedToPay", "Proceed to Pay")} ({selectedPaymentMethod.replace(/_/g, " ")})</span>
                      <CreditCard className="w-4 h-4 text-champagne" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: ORDER SUCCESS SCREEN                                   */}
          {/* ============================================================== */}
          {modalStep === 3 && createdOrder && (
            <div className="text-center py-6 sm:py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-700 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-mono tracking-[0.25em] text-emerald-700 font-bold uppercase">
                  {t("booking.confirmationVerified", "CONFIRMATION VERIFIED")}
                </span>
                <h3 className="font-serif text-3xl font-bold text-wine">
                  {t("booking.orderSuccessTitle", "Order Placed Successfully")}
                </h3>
                <p className="text-xs text-wine/80 max-w-sm mx-auto leading-relaxed">
                  {t("booking.orderSuccessSubtitle", "Your bespoke commission has been recorded in our permanent master ledger.")}
                </p>
              </div>

              {/* Order Identity Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F2E5C6]/70 border border-burgundy/25 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-burgundy/15">
                  <span className="text-wine/70 font-mono">{t("booking.orderNumberLabel", "Order Number")}</span>
                  <span className="font-mono text-sm font-bold text-burgundy">
                    {createdOrder.orderNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-wine/70">{t("booking.masterAtelier", "Master Artisan")}</span>
                  <span className="font-semibold text-wine">{createdOrder?.tailorName || "Master Artisan"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-wine/70">{t("booking.service", "Tailored Service")}</span>
                  <span className="font-semibold text-wine">{createdOrder?.garmentName || "Custom Stitching Garment"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-wine/70">{t("booking.paymentLabel", "Payment")}</span>
                  <span className="font-semibold text-burgundy flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                    {createdOrder?.paymentMethod === "COD" || selectedPaymentMethod === "COD"
                      ? "Cash on Delivery"
                      : `${(createdOrder?.paymentMethod || selectedPaymentMethod).replace(/_/g, " ")} (Razorpay Test Mode)`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-wine/70">{t("booking.initialStatus", "Initial Order Status")}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                    {((createdOrder?.status) || "PENDING_PAYMENT").replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-burgundy/15 font-bold">
                  <span className="text-wine uppercase font-mono text-[10px]">
                    {createdOrder?.status === "PAID" ? t("booking.amountPaidRazorpay", "Amount Paid (Razorpay Verified)") : t("booking.finalPayable", "Total Payable")}
                  </span>
                  <span className="font-serif text-base text-burgundy">
                    {formatINR(createdOrder?.finalPayableAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Track Order & Done */}
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="/orders"
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-xs text-wine bg-sand/40 border border-burgundy/25 hover:bg-sand/70 transition flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-burgundy" />
                  <span>{t("booking.trackOrderBtn", "Track Order")}</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-xs text-champagne bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-burgundy/40 hover:opacity-95 shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-champagne" />
                  <span>{t("booking.doneBtn", "Done")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Myntra-Style Apply Coupon Modal */}
      <ApplyCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        subtotal={subtotal}
        appliedCouponCode={appliedCouponCode}
        onApplyCoupon={onApplyCouponSuccess}
        onRemoveCoupon={handleRemoveCoupon}
        tailorId={tailor.id}
      />

      {/* Payment Checkout Modal */}
      {createdOrder && (
        <PaymentCheckoutModal
          order={createdOrder}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            onClose();
          }}
          onPaymentSuccess={() => {
            setIsPaymentModalOpen(false);
            onClose();
            window.location.href = "/orders";
          }}
        />
      )}

      {/* Address Selector Modal (Google Maps + Manual Address) */}
      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={(addr) => {
          if (addressTarget === "PICKUP") {
            setPickupAddress(addr.formattedAddress);
            setPickupCoords({ lat: addr.latitude, lng: addr.longitude });
            setPickupSnapshot(JSON.stringify(addr));
            if (sameAsPickup) {
              setDeliveryAddress(addr.formattedAddress);
              setDeliveryCoords({ lat: addr.latitude, lng: addr.longitude });
              setDeliverySnapshot(JSON.stringify(addr));
            }
          } else {
            setDeliveryAddress(addr.formattedAddress);
            setDeliveryCoords({ lat: addr.latitude, lng: addr.longitude });
            setDeliverySnapshot(JSON.stringify(addr));
          }
        }}
      />
    </>
  );
}
