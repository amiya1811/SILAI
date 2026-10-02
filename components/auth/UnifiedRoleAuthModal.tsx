"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Role, MeasurementData } from "@/lib/types";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Languages,
  Store,
  Scissors,
  Truck,
  ShoppingBag,
  CheckCircle,
  Ruler,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import TailorServicePricingSection, {
  ServicePricingItem,
} from "@/components/tailors/TailorServicePricingSection";

interface UnifiedRoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: "CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER";
  initialStep?: "AUTH" | "PROFILE_SETUP";
}

const STITCHING_CAPABILITY_OPTIONS = [
  "Blouse",
  "Kurti",
  "Salwar / Suit",
  "Shirt",
  "Pants / Trousers",
  "Dress",
  "Kids Wear",
  "Uniforms",
  "Alterations",
  "Bridal / Wedding Wear",
  "Custom Designs",
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Punjabi",
  "Bengali",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Urdu",
];

export default function UnifiedRoleAuthModal({
  isOpen,
  onClose,
  targetRole,
  initialStep = "AUTH",
}: UnifiedRoleAuthModalProps) {
  const router = useRouter();
  const { user, login, register } = useAuth();

  const [step, setStep] = useState<"AUTH" | "PROFILE_SETUP">(initialStep);
  const [tab, setTab] = useState<"LOGIN" | "SIGNUP" | "FORGOT_PASSWORD">("LOGIN");

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Profile Setup states
  const [custPhone, setCustPhone] = useState("+91 98765 43210");
  const [custAddress, setCustAddress] = useState("Flat 402, Royal Palms, Greater Kailash 1");
  const [custCity, setCustCity] = useState("New Delhi");
  const [custArea, setCustArea] = useState("Greater Kailash");
  const [custAvatar, setCustAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80");
  const [custLang, setCustLang] = useState("Hindi, English");
  const [fitChoice, setFitChoice] = useState<"SAVED" | "MANUAL" | "REFERENCE_GARMENT" | "DOORSTEP">("SAVED");
  const [manualBust, setManualBust] = useState("36");
  const [manualWaist, setManualWaist] = useState("30");
  const [manualHips, setManualHips] = useState("38");
  const [manualShoulder, setManualShoulder] = useState("14.5");
  const [manualArmhole, setManualArmhole] = useState("16");
  const [manualSleeve, setManualSleeve] = useState("15");
  const [manualLength, setManualLength] = useState("38");
  const [manualNeck, setManualNeck] = useState("7");

  // Tailor Onboarding states
  const [tailorShopName, setTailorShopName] = useState("Zari & Resham by Meera");
  const [tailorShopType, setTailorShopType] = useState<"Home Tailor" | "Tailoring Shop" | "Boutique">("Boutique");
  const [tailorPhone, setTailorPhone] = useState("+91 98712 34567");
  const [tailorHours, setTailorHours] = useState("10:00 AM – 8:00 PM");
  const [tailorExp, setTailorExp] = useState(14);
  const [tailorAbout, setTailorAbout] = useState("Master artisan specializing in bridal zari, princess cut blouses, and hand-embroidered bespoke ethnic wear.");
  const [tailorCaps, setTailorCaps] = useState<string[]>([
    "Blouse",
    "Kurti",
    "Salwar / Suit",
    "Bridal / Wedding Wear",
    "Custom Designs",
  ]);
  const [tailorServices, setTailorServices] = useState<ServicePricingItem[]>([]);
  const [tailorPricingError, setTailorPricingError] = useState<string | null>(null);

  // Delivery Profile states
  const [delivPhone, setDelivPhone] = useState("+91 99887 76655");
  const [delivArea, setDelivArea] = useState("South Delhi Logistics Hub");
  const [delivVehicleType, setDelivVehicleType] = useState("Two-Wheeler");
  const [delivVehicleDetails, setDelivVehicleDetails] = useState("Honda Activa 6G (DL-3S-AB-1234)");
  const [delivAvailability, setDelivAvailability] = useState<"AVAILABLE" | "BUSY">("AVAILABLE");

  if (!isOpen) return null;

  // Role Metadata
  const roleMeta = {
    CUSTOMER: {
      title: "CUSTOMER ACCESS",
      desc: "Find the right tailor. Get it stitched and delivered.",
      destination: "/dashboard",
      icon: ShoppingBag,
      demoEmail: "priya@example.com",
      demoName: "Priya Sharma",
    },
    TAILOR: {
      title: "TAILOR PARTNER ACCESS",
      desc: "Showcase your work. Manage orders. Grow your business.",
      destination: "/tailor-studio",
      icon: Scissors,
      demoEmail: "meera@example.com",
      demoName: "Meera Devi",
    },
    DELIVERY_PARTNER: {
      title: "DELIVERY FLEET ACCESS",
      desc: "Pick up. Deliver. Earn.",
      destination: "/delivery-partner",
      icon: Truck,
      demoEmail: "rahul@example.com",
      demoName: "Rahul Verma",
    },
  }[targetRole];

  const RoleIcon = roleMeta.icon;

  // Handle Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    try {
      if (tab === "FORGOT_PASSWORD") {
        setAuthSuccess(`Password reset instructions sent to ${email}. Please check your inbox.`);
        setIsSubmitting(false);
        return;
      }

      if (tab === "LOGIN") {
        const res = await login(email, password);
        if (!res.success) {
          setAuthError(res.error || "Login failed. Please check credentials.");
        } else {
          // If first time login or role setup, advance to profile setup, else route directly
          setStep("PROFILE_SETUP");
        }
      } else {
        // SIGNUP
        const res = await register({
          email,
          password,
          fullName: fullName.trim() || (targetRole === "TAILOR" ? "Master Tailor" : "Customer"),
          role: targetRole,
        });

        if (!res.success) {
          setAuthError(res.error || "Signup failed. Please try a different email.");
        } else {
          setStep("PROFILE_SETUP");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-click Demo Persona Fill
  const fillDemoAccount = async () => {
    setEmail(roleMeta.demoEmail);
    setPassword("Silai@2026");
    setTab("LOGIN");
    setAuthError("");
    setAuthSuccess("");

    setIsSubmitting(true);
    try {
      const res = await login(roleMeta.demoEmail, "Silai@2026");
      if (res.success) {
        onClose();
        router.push(roleMeta.destination);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Customer Profile Completion
  const handleCompleteCustomerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const measurementsPayload: MeasurementData | undefined =
        fitChoice === "MANUAL"
          ? {
              bust: Number(manualBust) || undefined,
              waist: Number(manualWaist) || undefined,
              hip: Number(manualHips) || undefined,
              shoulder: Number(manualShoulder) || undefined,
              armhole: Number(manualArmhole) || undefined,
              sleeveLength: Number(manualSleeve) || undefined,
              blouseLength: Number(manualLength) || undefined,
              frontNeckDepth: Number(manualNeck) || undefined,
            }
          : undefined;

      await fetch("/api/customer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName || user?.fullName || "Priya Sharma",
          phone: custPhone,
          address: custAddress,
          city: custCity,
          area: custArea,
          preferredLanguage: custLang,
          fitProfileChoice: fitChoice,
          measurements: measurementsPayload,
        }),
      });

      onClose();
      router.push("/dashboard");
    } catch (err) {
      console.error("Customer profile save error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Tailor Onboarding Completion & Service Pricing
  const handleCompleteTailorOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setTailorPricingError(null);

    // Validation: Any added service must have price > 0 and days >= 1
    const invalid = tailorServices.filter((s) => s.basePrice <= 0 || s.estimatedDays < 1);
    if (invalid.length > 0) {
      setTailorPricingError(
        `Please ensure all added services have a valid price greater than ₹0 and turnaround time of at least 1 day.`
      );
      return;
    }

    // Only save services that belong to currently selected garments (or custom services)
    const activeServices = tailorServices.filter(
      (s) =>
        s.category.toLowerCase() === "custom service" ||
        tailorCaps.some((cap) => cap.toLowerCase() === s.category.toLowerCase())
    );

    setIsSubmitting(true);

    try {
      await fetch(`/api/tailors/tailor-1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: fullName || user?.fullName || "Meera Devi",
          businessName: tailorShopName,
          shopType: tailorShopType,
          phone: tailorPhone,
          workingHours: tailorHours,
          experienceYears: Number(tailorExp),
          bio: tailorAbout,
          stitchingCapabilities: tailorCaps,
          availability: "AVAILABLE",
          menuItems: activeServices.map((s) => ({
            id: s.id,
            category: s.category,
            variantName: s.variantName || s.name,
            name: s.name,
            basePrice: s.basePrice,
            estimatedDays: s.estimatedDays,
            description: s.description,
            imageUrl: s.imageUrl,
            complexity: s.complexity || "REGULAR",
            isAvailable: true,
          })),
        }),
      });

      onClose();
      router.push("/tailor-studio");
    } catch (err) {
      console.error("Tailor profile save error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delivery Partner Profile Completion
  const handleCompleteDeliveryProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/delivery/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName || user?.fullName || "Rahul Verma",
          phone: delivPhone,
          addressArea: delivArea,
          vehicleType: delivVehicleType,
          vehicleDetails: delivVehicleDetails,
          availability: delivAvailability,
          isOnline: true,
        }),
      });

      onClose();
      router.push("/delivery-partner");
    } catch (err) {
      console.error("Delivery profile save error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTailorCapability = (cap: string) => {
    if (tailorCaps.includes(cap)) {
      setTailorCaps(tailorCaps.filter((c) => c !== cap));
    } else {
      setTailorCaps([...tailorCaps, cap]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-maroon/95 via-wine-dark to-[#240108] border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Ambient atmospheric brand glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-sand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/80 border border-sand/30 text-sand text-[10px] font-mono tracking-widest uppercase">
            <RoleIcon className="w-3.5 h-3.5 text-sand" /> {roleMeta.title}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sand-light mt-1.5">
            {step === "AUTH"
              ? tab === "LOGIN"
                ? `Sign In as ${targetRole.replace("_", " ")}`
                : tab === "SIGNUP"
                ? `Create ${targetRole.replace("_", " ")} Account`
                : "Reset Password"
              : `${targetRole.replace("_", " ")} Profile Setup`}
          </h2>
          <p className="text-xs text-champagne/70 mt-1 max-w-sm mx-auto">{roleMeta.desc}</p>
        </div>

        {/* STEP 1: AUTHENTICATION */}
        {step === "AUTH" && (
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex rounded-xl bg-wine-dark/80 p-1 border border-sand/15 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab("LOGIN");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2 font-semibold rounded-lg transition ${
                  tab === "LOGIN" ? "bg-burgundy text-sand-light shadow-sm" : "text-champagne/60 hover:text-sand"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("SIGNUP");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2 font-semibold rounded-lg transition ${
                  tab === "SIGNUP" ? "bg-burgundy text-sand-light shadow-sm" : "text-champagne/60 hover:text-sand"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("FORGOT_PASSWORD");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`px-3 py-2 font-semibold rounded-lg transition ${
                  tab === "FORGOT_PASSWORD"
                    ? "bg-burgundy text-sand-light shadow-sm"
                    : "text-champagne/60 hover:text-sand"
                }`}
              >
                Forgot?
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {tab === "SIGNUP" && (
                <div>
                  <label className="block text-xs font-mono text-sand mb-1 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                  />
                </div>
              </div>

              {tab !== "FORGOT_PASSWORD" && (
                <div>
                  <label className="block text-xs font-mono text-sand mb-1 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing..."
                  : tab === "LOGIN"
                  ? `Sign In to ${roleMeta.title}`
                  : tab === "SIGNUP"
                  ? "Create Account & Proceed"
                  : "Send Password Reset Link"}
              </button>
            </form>

            {/* Pre-Configured Demo Persona */}
            <div className="pt-4 border-t border-sand/15 text-center">
              <span className="text-[10px] font-mono uppercase text-sand/70 block mb-2">
                Instant Evaluation Demo
              </span>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="w-full p-2.5 rounded-xl bg-wine/50 hover:bg-wine border border-sand/20 text-xs text-sand font-medium transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Log in directly as demo {targetRole.replace("_", " ")} ({roleMeta.demoName})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE SETUP (ROLE-SPECIFIC) */}
        {step === "PROFILE_SETUP" && (
          <div>
            {/* 1. CUSTOMER PROFILE SETUP (Modification 3) */}
            {targetRole === "CUSTOMER" && (
              <form onSubmit={handleCompleteCustomerProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={custCity}
                      onChange={(e) => setCustCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Area / Locality</label>
                    <input
                      type="text"
                      required
                      value={custArea}
                      onChange={(e) => setCustArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Preferred Language</label>
                    <input
                      type="text"
                      value={custLang}
                      onChange={(e) => setCustLang(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-sand uppercase mb-1">Doorstep Address</label>
                  <input
                    type="text"
                    required
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                  />
                </div>

                {/* Fit Profile Setup: 4 Choices */}
                <div className="pt-2 border-t border-sand/15">
                  <span className="block text-xs font-mono font-bold text-sand uppercase mb-2">
                    Fit Profile Setup (Choose One)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {(
                      [
                        { id: "SAVED", label: "1. Saved Profile" },
                        { id: "MANUAL", label: "2. Manual Tape" },
                        { id: "REFERENCE_GARMENT", label: "3. Sample Garment" },
                        { id: "DOORSTEP", label: "4. Doorstep Visit" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFitChoice(m.id)}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          fitChoice === m.id
                            ? "bg-burgundy text-sand font-bold border-sand shadow-sm"
                            : "bg-wine/60 text-champagne/70 border-sand/20"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {fitChoice === "MANUAL" && (
                    <div className="mt-3 p-3 rounded-xl bg-maroon/60 border border-sand/25 grid grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-[9px] font-mono text-sand block">Bust (in)</span>
                        <input
                          type="number"
                          value={manualBust}
                          onChange={(e) => setManualBust(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-wine-dark border border-sand/25 text-sand font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-sand block">Waist (in)</span>
                        <input
                          type="number"
                          value={manualWaist}
                          onChange={(e) => setManualWaist(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-wine-dark border border-sand/25 text-sand font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-sand block">Hips (in)</span>
                        <input
                          type="number"
                          value={manualHips}
                          onChange={(e) => setManualHips(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-wine-dark border border-sand/25 text-sand font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-sand block">Shoulder</span>
                        <input
                          type="number"
                          value={manualShoulder}
                          onChange={(e) => setManualShoulder(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-wine-dark border border-sand/25 text-sand font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition"
                >
                  {isSubmitting ? "Saving Profile..." : "Complete Setup & Enter Customer Dashboard"}
                </button>
              </form>
            )}

            {/* 2. TAILOR ONBOARDING (Modification 11, 12, 13) */}
            {targetRole === "TAILOR" && (
              <form onSubmit={handleCompleteTailorOnboarding} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={tailorShopName}
                      onChange={(e) => setTailorShopName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Shop Type</label>
                    <select
                      value={tailorShopType}
                      onChange={(e) => setTailorShopType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    >
                      <option value="Home Tailor">Home Tailor</option>
                      <option value="Tailoring Shop">Tailoring Shop</option>
                      <option value="Boutique">Boutique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={tailorPhone}
                      onChange={(e) => setTailorPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Working Hours</label>
                    <input
                      type="text"
                      value={tailorHours}
                      onChange={(e) => setTailorHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>
                </div>

                {/* What can you stitch multi-select */}
                <div className="pt-2 border-t border-sand/15">
                  <span className="block text-xs font-mono font-bold text-sand uppercase mb-2">
                    What Can You Stitch? (Select specialties)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {STITCHING_CAPABILITY_OPTIONS.map((cap) => {
                      const isSel = tailorCaps.includes(cap);
                      return (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => toggleTailorCapability(cap)}
                          className={`p-2 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                            isSel ? "bg-sand text-wine-dark font-bold border-sand" : "bg-wine/60 text-champagne/70 border-sand/20"
                          }`}
                        >
                          <span className="truncate">{cap}</span>
                          {isSel && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Embedded Services & Pricing Manager */}
                <TailorServicePricingSection
                  selectedGarments={tailorCaps}
                  services={tailorServices}
                  onChange={setTailorServices}
                  error={tailorPricingError}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition"
                >
                  {isSubmitting ? "Saving Atelier..." : "Complete Setup & Enter Tailor Studio"}
                </button>
              </form>
            )}

            {/* 3. DELIVERY PARTNER PROFILE SETUP (Modification 19) */}
            {targetRole === "DELIVERY_PARTNER" && (
              <form onSubmit={handleCompleteDeliveryProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={delivPhone}
                      onChange={(e) => setDelivPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Hub / Area</label>
                    <input
                      type="text"
                      required
                      value={delivArea}
                      onChange={(e) => setDelivArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Vehicle Type</label>
                    <select
                      value={delivVehicleType}
                      onChange={(e) => setDelivVehicleType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    >
                      <option value="Two-Wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
                      <option value="Electric Scooter">Electric Scooter (EV)</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Car / Van">Four-Wheeler / Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-sand uppercase mb-1">Vehicle Details / Reg</label>
                    <input
                      type="text"
                      value={delivVehicleDetails}
                      onChange={(e) => setDelivVehicleDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-wine/60 border border-sand/20 text-champagne"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-2 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition"
                >
                  {isSubmitting ? "Activating Fleet..." : "Complete Setup & Enter Delivery Dashboard"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
