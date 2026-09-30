"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Order, TailorProfile, Offer } from "@/lib/types";
import { formatINR, formatDate, getStatusBadge } from "@/lib/utils";
import {
  ShoppingBag,
  Scissors,
  Ruler,
  Sparkles,
  Crown,
  Tag,
  ArrowRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import OrderTimeline from "@/components/orders/OrderTimeline";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, offersRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/admin/metrics"), // Contains offers
        ]);

        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          setOrders(oData.orders);
        }
        if (offersRes.ok) {
          const offData = await offersRes.json();
          setOffers(offData.offers || []);
        }
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeOrder = orders.find(
    (o) => o.status !== "DELIVERED" && o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/15 pb-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-sand uppercase">
            ATELIER CONCIERGE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sand-light mt-1">
            Welcome, {user?.fullName || "Priya"}
          </h1>
          <p className="text-xs sm:text-sm text-champagne/75 mt-0.5">
            Your personalized custom tailoring overview, active commissions, and privileges.
          </p>
        </div>

        {/* Membership Club Card */}
        <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-burgundy to-maroon border border-sand/40 shadow-gold-glow flex items-center gap-3">
          <Crown className="w-6 h-6 text-sand" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-sand uppercase block">
              PRIVILEGE TIER
            </span>
            <h4 className="font-serif text-sm font-bold text-sand-light">SILAI Royal Club Member</h4>
          </div>
        </div>
      </div>

      {/* Active Order Spotlight Banner */}
      {activeOrder && (
        <div className="rounded-3xl bg-gradient-to-b from-maroon/90 to-wine-dark border border-sand/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand/15 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-sand uppercase">
                ACTIVE BESPOKE ORDER
              </span>
              <h3 className="font-serif text-2xl font-bold text-sand-light mt-0.5">
                {activeOrder.garmentName}
              </h3>
              <p className="text-xs text-champagne/80">
                Crafted by <strong className="text-sand">{activeOrder.tailorName}</strong> • {activeOrder.orderNumber}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(activeOrder.status).bg}`}>
                {getStatusBadge(activeOrder.status).label}
              </span>
              <Link
                href="/orders"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-burgundy border border-sand/40 text-sand hover:bg-maroon transition flex items-center gap-1.5"
              >
                Track Live <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Timeline */}
          <OrderTimeline status={activeOrder.status} deliveryOtp={activeOrder.deliveryOtp} />
        </div>
      )}

      {/* Quick Action Concierge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/explore"
          className="p-6 rounded-2xl bg-wine-dark/70 border border-sand/20 hover:border-sand/50 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-burgundy/60 border border-sand/30 flex items-center justify-center text-sand group-hover:scale-105 transition">
            <Scissors className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-sand-light group-hover:text-sand transition">
            Browse Master Tailors
          </h3>
          <p className="text-xs text-champagne/70 leading-relaxed">
            Compare prices, turnaround speeds, and specialties across 10+ certified boutiques.
          </p>
        </Link>

        <Link
          href="/try-on"
          className="p-6 rounded-2xl bg-wine-dark/70 border border-sand/20 hover:border-sand/50 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-burgundy/60 border border-sand/30 flex items-center justify-center text-sand group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-sand-light group-hover:text-sand transition">
            AI Virtual Try-On Studio
          </h3>
          <p className="text-xs text-champagne/70 leading-relaxed">
            Visualize your blouse neckline and sleeve silhouette before committing fabric.
          </p>
        </Link>

        <Link
          href="/fit-profile"
          className="p-6 rounded-2xl bg-wine-dark/70 border border-sand/20 hover:border-sand/50 transition group space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-burgundy/60 border border-sand/30 flex items-center justify-center text-sand group-hover:scale-105 transition">
            <Ruler className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-sand-light group-hover:text-sand transition">
            Fit Vault & Measurements
          </h3>
          <p className="text-xs text-champagne/70 leading-relaxed">
            Manage your anatomical measurements or book a doorstep master measuring visit.
          </p>
        </Link>
      </div>

      {/* Active Exclusive Offers & Promos (Requirement 19) */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-sand-light flex items-center gap-2">
          <Tag className="w-4 h-4 text-sand" /> Active Bespoke Offers & Privileges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 rounded-2xl bg-wine-dark/60 border border-dashed border-sand/30 space-y-2 hover:border-sand/60 transition"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-sand bg-burgundy/80 px-2 py-0.5 rounded border border-sand/25">
                  {offer.code}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Active</span>
              </div>
              <h4 className="font-serif text-base font-bold text-sand-light">{offer.title}</h4>
              <p className="text-xs text-champagne/75 leading-relaxed">{offer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
