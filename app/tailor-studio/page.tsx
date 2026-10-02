"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TailorProfile, MenuItem, Order, OrderStatus } from "@/lib/types";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Scissors,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Upload,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Camera,
  Store,
  User,
  MapPin,
  Languages,
  Check,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import TailorServicePricingSection, {
  ServicePricingItem,
} from "@/components/tailors/TailorServicePricingSection";

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
  "Malayalam",
];

export default function TailorStudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tailor, setTailor] = useState<TailorProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [availability, setAvailability] = useState<"AVAILABLE" | "BUSY" | "NOT_ACCEPTING">("AVAILABLE");
  const [activeTab, setActiveTab] = useState<"ORDERS" | "MENU" | "PROFILE" | "EARNINGS">("ORDERS");
  const [isLoading, setIsLoading] = useState(true);

  // Role locking guard: prevent URL tampering
  useEffect(() => {
    if (user) {
      if (user.role === "CUSTOMER") {
        router.replace("/dashboard");
      } else if (user.role === "DELIVERY_PARTNER") {
        router.replace("/delivery-partner");
      }
    }
  }, [user, router]);

  // Profile / Onboarding Form State (Modification 4)
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [shopType, setShopType] = useState<"Home Tailor" | "Tailoring Shop" | "Boutique">("Boutique");
  const [workingHours, setWorkingHours] = useState("");
  const [experienceYears, setExperienceYears] = useState(10);
  const [bio, setBio] = useState("");
  const [avgStitchingDays, setAvgStitchingDays] = useState(3);
  const [stitchingCaps, setStitchingCaps] = useState<string[]>([]);
  const [otherCapability, setOtherCapability] = useState("");
  const [services, setServices] = useState<ServicePricingItem[]>([]);
  const [pricingValidationError, setPricingValidationError] = useState<string | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // New Menu Item State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("BLOUSE");
  const [newServicePrice, setNewServicePrice] = useState(750);
  const [newServiceDays, setNewServiceDays] = useState(4);
  const [newServiceComplexity, setNewServiceComplexity] = useState("DESIGNER");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceImage, setNewServiceImage] = useState("");
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // Finished photo upload state
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
  );

  const loadStudioData = async () => {
    setIsLoading(true);
    try {
      const [tailorRes, ordersRes] = await Promise.all([
        fetch("/api/tailors/tailor-1"),
        fetch("/api/orders?tailorId=tailor-1"),
      ]);

      if (tailorRes.ok) {
        const tData = await tailorRes.json();
        const t: TailorProfile = tData.tailor;
        setTailor(t);
        setAvailability(t.availability);

        // Populate Profile form states
        setOwnerName(t.ownerName || "Meera Devi");
        setPhone(t.phone || "+91 98712 34567");
        setEmail(t.email || "meera.zari@silai.in");
        setAvatarUrl(t.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80");
        setCity(t.city || "New Delhi");
        setAddress(t.address || "Shop 14, Hauz Khas Village, New Delhi");
        setSelectedLanguages(t.languages || ["Hindi", "English"]);
        setBusinessName(t.businessName || "Zari & Resham by Meera");
        setShopType(t.shopType || "Boutique");
        setWorkingHours(t.workingHours || "10:00 AM – 8:00 PM");
        setExperienceYears(t.experienceYears || 14);
        setBio(t.bio || "Master artisan specializing in bridal zari, princess cut blouses, and hand-embroidered bespoke ethnic wear.");
        setAvgStitchingDays(t.avgStitchingDays || 3);
        setStitchingCaps(
          t.stitchingCapabilities || [
            "Blouse",
            "Kurti",
            "Salwar / Suit",
            "Bridal / Wedding Wear",
            "Custom Designs",
            "Alterations",
          ]
        );

        if (t.menuItems && t.menuItems.length > 0) {
          setServices(
            t.menuItems.map((m) => ({
              id: m.id,
              category: m.category,
              variantName: m.variantName || m.name,
              name: m.name,
              basePrice: m.basePrice,
              estimatedDays: m.estimatedDays,
              description: m.description,
              imageUrl: m.imageUrl,
              complexity: m.complexity,
            }))
          );
        }
      }
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders);
      }
    } catch (err) {
      console.error("Failed to load tailor studio data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  // Update Availability (Modification 4.5 & Requirement 20)
  const handleAvailabilityChange = async (newStatus: "AVAILABLE" | "BUSY" | "NOT_ACCEPTING") => {
    if (!tailor) return;
    setAvailability(newStatus);
    try {
      await fetch(`/api/tailors/${tailor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: newStatus }),
      });
    } catch (err) {
      console.error("Availability update failed", err);
    }
  };

  // Save Complete Tailor Onboarding Profile & Service Pricing
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tailor) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setPricingValidationError(null);

    const finalCaps = [...stitchingCaps];
    if (otherCapability.trim() && !finalCaps.includes(otherCapability.trim())) {
      finalCaps.push(otherCapability.trim());
    }

    // Validation: Any added service must have price > 0 and days >= 1
    const invalidServices = services.filter((s) => s.basePrice <= 0 || s.estimatedDays < 1);
    if (invalidServices.length > 0) {
      setPricingValidationError(
        `Please ensure all added services have a valid price greater than ₹0 and turnaround time of at least 1 day.`
      );
      setIsSavingProfile(false);
      return;
    }

    // Only save services that belong to currently selected garments (or custom services)
    const activeServices = services.filter(
      (s) =>
        s.category.toLowerCase() === "custom service" ||
        finalCaps.some((cap) => cap.toLowerCase() === s.category.toLowerCase())
    );

    try {
      const res = await fetch(`/api/tailors/${tailor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          phone,
          email,
          avatarUrl,
          city,
          address,
          languages: selectedLanguages,
          businessName,
          shopType,
          workingHours,
          experienceYears: Number(experienceYears),
          bio,
          avgStitchingDays: Number(avgStitchingDays),
          stitchingCapabilities: finalCaps,
          availability,
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

      if (res.ok) {
        setProfileSuccessMsg("Atelier profile, custom services, and pricing saved successfully!");
        setOtherCapability("");
        await loadStudioData();
      }
    } catch (err) {
      console.error("Profile save failed", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Edit Menu Item from Tab 2 (My Menu)
  const handleEditMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tailor || !editingMenuItem) return;

    try {
      const res = await fetch(`/api/tailors/${tailor.id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: editingMenuItem.id,
          name: editingMenuItem.name,
          variantName: editingMenuItem.variantName || editingMenuItem.name,
          basePrice: Number(editingMenuItem.basePrice),
          estimatedDays: Number(editingMenuItem.estimatedDays),
          description: editingMenuItem.description,
          imageUrl: editingMenuItem.imageUrl,
          complexity: editingMenuItem.complexity,
        }),
      });

      if (res.ok) {
        setEditingMenuItem(null);
        await loadStudioData();
      }
    } catch (err) {
      console.error("Failed to edit menu item", err);
    }
  };

  // Toggle Language Selection
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Toggle Stitching Capability
  const toggleCapability = (cap: string) => {
    if (stitchingCaps.includes(cap)) {
      setStitchingCaps(stitchingCaps.filter((c) => c !== cap));
    } else {
      setStitchingCaps([...stitchingCaps, cap]);
    }
  };

  // Update Order Status (Accept, Stitching, Ready)
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, photoUrl?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          finishedGarmentPhoto: photoUrl,
        }),
      });

      if (res.ok) {
        setUploadingOrderId(null);
        await loadStudioData();
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  // Add Menu Service Item (Modification 4.4 & Requirement 21)
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tailor) return;
    setIsSavingMenu(true);

    try {
      const res = await fetch(`/api/tailors/${tailor.id}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServiceName,
          category: newServiceCategory,
          basePrice: Number(newServicePrice),
          estimatedDays: Number(newServiceDays),
          complexity: newServiceComplexity,
          description: newServiceDesc,
          imageUrl: newServiceImage || undefined,
          isAvailable: true,
        }),
      });

      if (res.ok) {
        setShowAddMenuModal(false);
        setNewServiceName("");
        setNewServiceDesc("");
        setNewServiceImage("");
        await loadStudioData();
      }
    } catch (err) {
      console.error("Failed to add menu item", err);
    } finally {
      setIsSavingMenu(false);
    }
  };

  // Delete Menu Service Item
  const handleDeleteMenuItem = async (itemId: string) => {
    if (!tailor || !confirm("Are you sure you want to remove this service from your digital menu?")) return;

    try {
      const res = await fetch(`/api/tailors/${tailor.id}/menu?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadStudioData();
      }
    } catch (err) {
      console.error("Failed to delete menu item", err);
    }
  };

  // Compute Tailor Financials
  const grossOrderValue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.stitchingPrice, 0);

  const platformContribution = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.platformCommission, 0);

  const netTailorEarnings = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.tailorEarnings, 0);

  const pendingPayout = orders
    .filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.tailorEarnings, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-sand/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-sand uppercase">
              TAILOR PARTNER STUDIO
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs px-2 py-0.5 rounded bg-sand/15 text-sand font-mono">
              {tailor?.shopType || "Boutique"}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-0.5">
            {tailor?.businessName || "Zari & Resham by Meera"}
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Manage your incoming commissions, karigari queue, digital menu pricing, and atelier setup.
          </p>
        </div>

        {/* Availability Toggle (Modification 4.5) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-wine-dark/80 border border-sand/25">
          <span className="text-xs font-mono text-sand/80 px-2 uppercase">Status:</span>
          {(["AVAILABLE", "BUSY", "NOT_ACCEPTING"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleAvailabilityChange(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                availability === status
                  ? status === "AVAILABLE"
                    ? "bg-emerald-800 text-emerald-100 shadow-sm"
                    : status === "BUSY"
                    ? "bg-amber-800 text-amber-100 shadow-sm"
                    : "bg-rose-900 text-rose-100 shadow-sm"
                  : "text-champagne/60 hover:text-champagne"
              }`}
            >
              {status === "AVAILABLE" && "● Available"}
              {status === "BUSY" && "▲ Busy"}
              {status === "NOT_ACCEPTING" && "✕ Closed"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sand/15 pb-2">
        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "ORDERS"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          Orders Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("MENU")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "MENU"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          Digital Menu Builder ({tailor?.menuItems.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "PROFILE"
              ? "bg-burgundy text-sand-light border border-sand/40 shadow-sm"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop Profile & Onboarding</span>
        </button>
        <button
          onClick={() => setActiveTab("EARNINGS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "EARNINGS"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          Financials & Payouts
        </button>
      </div>

      {/* TAB 1: ORDERS QUEUE */}
      {activeTab === "ORDERS" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-xs text-champagne/60 italic">No orders received yet.</p>
          ) : (
            orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-wine-dark/80 border border-sand/20 p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand/15 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sand">{order.orderNumber}</span>
                        <span className="text-xs text-champagne/60">• {formatDate(order.createdAt)}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-sand-light">{order.garmentName}</h3>
                      <p className="text-xs text-champagne/80">Customer: {order.customerName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Specifications & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-sand/70 font-mono text-[10px] uppercase block">
                        Net Tailor Payout
                      </span>
                      <span className="font-serif text-base font-bold text-sand">
                        {formatINR(order.tailorEarnings)}
                      </span>
                      <p className="text-[10px] text-champagne/50">
                        (Gross: {formatINR(order.stitchingPrice)} - 15% Platform)
                      </p>
                    </div>

                    <div>
                      <span className="text-sand/70 font-mono text-[10px] uppercase block">
                        Fit Profile Used
                      </span>
                      <span className="text-champagne font-medium capitalize">
                        {order.measurementType.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <span className="text-sand/70 font-mono text-[10px] uppercase block">
                        Pickup Address
                      </span>
                      <span className="text-champagne truncate block">{order.pickupAddress}</span>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="sm:text-right flex items-center justify-end gap-2">
                      {order.status === "PAID" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "WITH_TAILOR")}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-800 text-emerald-100 hover:bg-emerald-700 transition"
                        >
                          Accept & Confirm Fabric
                        </button>
                      )}

                      {order.status === "WITH_TAILOR" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "STITCHING")}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-burgundy text-sand hover:bg-maroon transition"
                        >
                          Start Stitching
                        </button>
                      )}

                      {order.status === "STITCHING" && (
                        <button
                          onClick={() => setUploadingOrderId(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-800 to-emerald-800 text-sand-light border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" /> Mark Ready & Upload Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload finished garment photo inline prompt */}
                  {uploadingOrderId === order.id && (
                    <div className="p-4 rounded-2xl bg-maroon/90 border border-sand/40 space-y-3 animate-in fade-in">
                      <h4 className="font-serif text-sm font-bold text-sand-light flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-sand" /> Upload Finished Outfit Photo For Customer Inspection
                      </h4>
                      <input
                        type="text"
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        placeholder="Image URL of finished garment..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-wine-dark border border-sand/25 text-champagne"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "READY", photoUrlInput)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-800 text-sand-light hover:bg-emerald-700"
                        >
                          Confirm & Trigger Out For Delivery
                        </button>
                        <button
                          onClick={() => setUploadingOrderId(null)}
                          className="px-3 py-2 rounded-lg text-xs text-champagne/60 hover:text-sand"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: TAILOR MENU BUILDER */}
      {activeTab === "MENU" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-sand-light">Digital Service Menu</h3>
              <p className="text-xs text-champagne/75">
                Set your custom rates, turnaround timelines, and service tiers.
              </p>
            </div>
            <button
              onClick={() => setShowAddMenuModal(true)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-burgundy text-sand border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tailor?.menuItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-3 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-burgundy/60 text-sand px-2 py-0.5 rounded border border-sand/20">
                      {item.category} • {item.complexity}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-sand-light mt-1">{item.name}</h4>
                    <p className="text-xs text-champagne/70 mt-1">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-sand">{formatINR(item.basePrice)}</span>
                    <p className="text-[10px] text-champagne/60 font-mono">~{item.estimatedDays} Days</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-sand/15 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setEditingMenuItem(item)}
                    className="text-xs text-sand hover:text-sand-light flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Price & Service
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Menu Item Modal */}
          {editingMenuItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md rounded-2xl bg-maroon/95 border border-sand/30 p-6 space-y-4 text-champagne">
                <div className="flex justify-between items-center border-b border-sand/20 pb-3">
                  <h3 className="font-serif text-xl font-bold text-sand-light">Edit Service Pricing</h3>
                  <button
                    onClick={() => setEditingMenuItem(null)}
                    className="text-champagne/60 hover:text-champagne"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleEditMenuItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-sand mb-1 uppercase">Service / Variant Name</label>
                    <input
                      type="text"
                      required
                      value={editingMenuItem.name}
                      onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Price in INR (₹)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingMenuItem.basePrice}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, basePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Estimated Days</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editingMenuItem.estimatedDays}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, estimatedDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-sand mb-1 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={editingMenuItem.description || ""}
                      onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMenuItem(null)}
                      className="px-4 py-2 rounded-xl text-xs text-champagne/60 hover:text-champagne"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Menu Item Modal */}
          {showAddMenuModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="relative w-full max-w-md rounded-2xl bg-maroon/95 border border-sand/30 p-6 space-y-4 text-champagne">
                <h3 className="font-serif text-xl font-bold text-sand-light">Add Service to Menu</h3>
                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-sand mb-1 uppercase">Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Princess Cut Padded Blouse"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Category</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                      >
                        <option value="BLOUSE">Blouse</option>
                        <option value="KURTI">Kurti</option>
                        <option value="SUIT">Salwar Suit</option>
                        <option value="LEHENGA">Lehenga</option>
                        <option value="SHIRT">Shirt</option>
                        <option value="ALTERATIONS">Alterations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Base Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-sand font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Turnaround (Days)</label>
                      <input
                        type="number"
                        required
                        value={newServiceDays}
                        onChange={(e) => setNewServiceDays(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-sand font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-sand mb-1 uppercase">Optional Image URL</label>
                      <input
                        type="text"
                        value={newServiceImage}
                        onChange={(e) => setNewServiceImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-sand mb-1 uppercase">Description</label>
                    <textarea
                      rows={2}
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="Details of cuts, inner lining, or finishing..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingMenu}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-burgundy text-sand-light border border-sand/40"
                    >
                      {isSavingMenu ? "Adding..." : "Save Service"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMenuModal(false)}
                      className="px-4 py-2.5 rounded-xl text-xs text-champagne/60 hover:text-sand"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TAILOR ONBOARDING & PROFILE SETUP (Modification 4) */}
      {activeTab === "PROFILE" && (
        <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in">
          {profileSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div className="p-6 rounded-3xl bg-wine-dark/80 border border-sand/25 space-y-4 shadow-xl">
            <div className="border-b border-sand/15 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                STEP 1 OF 3
              </span>
              <h3 className="font-serif text-xl font-bold text-sand-light">Personal Details</h3>
              <p className="text-xs text-champagne/70">Master craftsman contact and identity information</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Full Name / Master Tailor
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Personal / Residence Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>
            </div>

            {/* Languages Spoken Multi-select */}
            <div className="pt-2">
              <label className="block text-sand font-mono uppercase text-[10px] mb-2 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-sand" /> Languages Spoken (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-sand text-wine-dark font-bold shadow-sm"
                          : "bg-wine/60 text-champagne/70 border border-sand/20 hover:border-sand/40"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-wine-dark" />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Shop / Studio Details */}
          <div className="p-6 rounded-3xl bg-wine-dark/80 border border-sand/25 space-y-4 shadow-xl">
            <div className="border-b border-sand/15 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                STEP 2 OF 3
              </span>
              <h3 className="font-serif text-xl font-bold text-sand-light">Shop & Studio Details</h3>
              <p className="text-xs text-champagne/70">Establishment type, working hours, and craft background</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Shop / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Shop Type
                </label>
                <select
                  value={shopType}
                  onChange={(e) =>
                    setShopType(e.target.value as "Home Tailor" | "Tailoring Shop" | "Boutique")
                  }
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                >
                  <option value="Home Tailor">Home Tailor</option>
                  <option value="Tailoring Shop">Tailoring Shop</option>
                  <option value="Boutique">Boutique</option>
                </select>
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 10:00 AM – 8:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-champagne"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-sand font-bold"
                />
              </div>

              <div>
                <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                  Avg Stitching Turnaround (Days)
                </label>
                <input
                  type="number"
                  value={avgStitchingDays}
                  onChange={(e) => setAvgStitchingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-wine border border-sand/20 text-sand font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sand font-mono uppercase text-[10px] mb-1">
                About / Bio / Speciality Description
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Highlight your signature craft, zari embroidery, necklines, wedding lehengas..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-wine border border-sand/20 text-champagne"
              />
            </div>
          </div>

          {/* Section 3: What the Tailor Can Stitch (Multi-select) */}
          <div className="p-6 rounded-3xl bg-wine-dark/80 border border-sand/25 space-y-4 shadow-xl">
            <div className="border-b border-sand/15 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                STEP 3 OF 3
              </span>
              <h3 className="font-serif text-xl font-bold text-sand-light">
                What Can You Stitch?
              </h3>
              <p className="text-xs text-champagne/70">
                Select all garments and specialties you accept commissions for
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {STITCHING_CAPABILITY_OPTIONS.map((cap) => {
                const isSelected = stitchingCaps.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`p-3 rounded-2xl border text-left font-medium transition flex items-center justify-between ${
                      isSelected
                        ? "bg-sand text-wine-dark border-sand shadow-sm"
                        : "bg-wine/60 text-champagne/70 border-sand/20 hover:border-sand/40"
                    }`}
                  >
                    <span>{cap}</span>
                    {isSelected && <Check className="w-4 h-4 text-wine-dark" />}
                  </button>
                );
              })}
            </div>

            {/* Other / Custom Capability */}
            <div className="pt-2 flex gap-2 items-center">
              <input
                type="text"
                value={otherCapability}
                onChange={(e) => setOtherCapability(e.target.value)}
                placeholder="Other specialty (e.g. Indo-Western jackets, Sherwanis)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-wine border border-sand/20 text-champagne"
              />
              <button
                type="button"
                onClick={() => {
                  if (otherCapability.trim() && !stitchingCaps.includes(otherCapability.trim())) {
                    setStitchingCaps([...stitchingCaps, otherCapability.trim()]);
                    setOtherCapability("");
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy text-sand border border-sand/30 hover:bg-maroon"
              >
                Add Specialty
              </button>
            </div>

            {/* Embedded Services & Pricing Manager */}
            <TailorServicePricingSection
              selectedGarments={stitchingCaps}
              services={services}
              onChange={setServices}
              error={pricingValidationError}
            />
          </div>

          {/* Submit Profile */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-8 py-3.5 rounded-full font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-sand" />
              <span>{isSavingProfile ? "Saving Atelier Details..." : "Save Profile & Capabilities"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: TAILOR EARNINGS & PAYOUTS */}
      {activeTab === "EARNINGS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                Gross Order Value
              </span>
              <p className="font-serif text-2xl font-bold text-sand-light">
                {formatINR(grossOrderValue)}
              </p>
              <p className="text-[11px] text-champagne/60">Total customer orders placed</p>
            </div>

            <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                SILAI Platform Contribution
              </span>
              <p className="font-serif text-2xl font-bold text-sand-light">
                {formatINR(platformContribution)}
              </p>
              <p className="text-[11px] text-champagne/60">Standard 15% platform logistics</p>
            </div>

            <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                Net Tailor Earnings
              </span>
              <p className="font-serif text-2xl font-bold text-emerald-400">
                {formatINR(netTailorEarnings)}
              </p>
              <p className="text-[11px] text-champagne/60">Total earned by atelier</p>
            </div>

            <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                Pending Payout
              </span>
              <p className="font-serif text-2xl font-bold text-amber-400">
                {formatINR(pendingPayout)}
              </p>
              <p className="text-[11px] text-champagne/60">Transferred automatically upon delivery</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
