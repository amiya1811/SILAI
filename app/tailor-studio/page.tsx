"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function TailorStudioPage() {
  const { user } = useAuth();
  const [tailor, setTailor] = useState<TailorProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [availability, setAvailability] = useState<"AVAILABLE" | "BUSY" | "NOT_ACCEPTING">("AVAILABLE");
  const [activeTab, setActiveTab] = useState<"ORDERS" | "MENU" | "EARNINGS">("ORDERS");
  const [isLoading, setIsLoading] = useState(true);

  // New Menu Item State
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("BLOUSE");
  const [newServicePrice, setNewServicePrice] = useState(750);
  const [newServiceDays, setNewServiceDays] = useState(4);
  const [newServiceComplexity, setNewServiceComplexity] = useState("DESIGNER");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  // Finished photo upload state
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
  );

  const loadStudioData = async () => {
    setIsLoading(true);
    try {
      // Load tailor-1 profile (representing demo tailor Meera Devi)
      const [tailorRes, ordersRes] = await Promise.all([
        fetch("/api/tailors/tailor-1"),
        fetch("/api/orders?tailorId=tailor-1"),
      ]);

      if (tailorRes.ok) {
        const tData = await tailorRes.json();
        setTailor(tData.tailor);
        setAvailability(tData.tailor.availability);
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

  // Update Availability
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

  // Add Menu Service Item (Requirement 21)
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
          isAvailable: true,
        }),
      });

      if (res.ok) {
        setShowAddMenuModal(false);
        setNewServiceName("");
        setNewServiceDesc("");
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

  // Compute Tailor Financials (Requirement 23)
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

  const completedPayout = netTailorEarnings - pendingPayout;

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
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-0.5">
            {tailor?.businessName || "Zari & Resham by Meera"}
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Manage your incoming commissions, karigari queue, digital menu pricing, and earnings.
          </p>
        </div>

        {/* Availability Toggle (Requirement 20) */}
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
      <div className="flex gap-3 border-b border-sand/15 pb-2">
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

      {/* TAB 1: ORDERS QUEUE (Requirements 20, 22) */}
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

                  {/* Upload finished garment photo inline prompt (Requirement 22) */}
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

      {/* TAB 2: TAILOR MENU BUILDER (Requirement 21) */}
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

                <div className="pt-2 border-t border-sand/15 flex justify-end">
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

      {/* TAB 3: TAILOR EARNINGS & PAYOUTS (Requirement 23) */}
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
