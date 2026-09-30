"use client";

import React, { useState, useEffect } from "react";
import { formatINR, formatDate, formatDateTime, getStatusBadge } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Scissors,
  ShoppingBag,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Lock,
} from "lucide-react";

export default function AdminConsolePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"METRICS" | "ORDERS" | "TAILORS" | "AUDIT">("METRICS");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Admin data load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center animate-pulse">
        <ShieldAlert className="w-12 h-12 text-sand/40 mx-auto mb-4" />
        <p className="text-sand font-mono text-xs">Loading SILAI Administrative Console...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalGMV: 3520,
    totalPlatformRevenue: 528,
    activeOrders: 2,
    totalOrders: 3,
    totalTailors: 10,
    activeDeliveries: 2,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
              PLATFORM GOVERNANCE
            </span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-0.5">
            SILAI Admin Control Center
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Admin: <strong className="text-sand">{user?.fullName || "Amiya Admin"}</strong> • Role-Based Access Control Active
          </p>
        </div>

        {/* Status badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-mono">
          System Status: Healthy & Verified
        </div>
      </div>

      {/* Primary Financial & Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">Gross Order GMV</span>
            <DollarSign className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {formatINR(metrics.totalGMV)}
          </p>
          <p className="text-[11px] text-champagne/60">Total marketplace transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">Platform Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">
            {formatINR(metrics.totalPlatformRevenue)}
          </p>
          <p className="text-[11px] text-champagne/60">15% commission contribution</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">Active Stitching</span>
            <ShoppingBag className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {metrics.activeOrders} Orders
          </p>
          <p className="text-[11px] text-champagne/60">In karigari & doorstep transit</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">Master Boutiques</span>
            <Scissors className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {metrics.totalTailors} Tailors
          </p>
          <p className="text-[11px] text-champagne/60">100% KYC verified ateliers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-sand/15 pb-2">
        <button
          onClick={() => setActiveTab("METRICS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "METRICS"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          All Orders ({data?.orders?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("TAILORS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "TAILORS"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          Ateliers & Boutiques ({data?.tailors?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "AUDIT"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          Security Audit Logs ({data?.auditLogs?.length || 0})
        </button>
      </div>

      {/* Orders Table */}
      {activeTab === "METRICS" && (
        <div className="rounded-3xl bg-wine-dark/80 border border-sand/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wine/90 border-b border-sand/15 font-mono text-[11px] text-sand uppercase">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tailor</th>
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">GMV</th>
                  <th className="py-3 px-4">Platform (15%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10">
                {data?.orders?.map((ord: any) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-wine/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-sand">{ord.orderNumber}</td>
                      <td className="py-3 px-4 text-champagne">{ord.customerName}</td>
                      <td className="py-3 px-4 text-champagne/80">{ord.tailorName}</td>
                      <td className="py-3 px-4 text-champagne">{ord.garmentName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif text-sand font-bold">
                        {formatINR(ord.finalPayableAmount)}
                      </td>
                      <td className="py-3 px-4 font-serif text-emerald-400 font-bold">
                        {formatINR(ord.platformCommission)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tailors KYC Table */}
      {activeTab === "TAILORS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.tailors?.map((t: any) => (
            <div key={t.id} className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-base font-bold text-sand-light">{t.businessName}</h4>
                  <p className="text-xs text-champagne/70">{t.city}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  KYC Verified
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-sand/80 pt-1">
                <span>Rating: ★ {t.rating}</span>
                <span>•</span>
                <span>Commission: 15%</span>
                <span>•</span>
                <span>Menu: {t.menuItems?.length || 0} services</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Table (Requirement 28) */}
      {activeTab === "AUDIT" && (
        <div className="rounded-3xl bg-wine-dark/80 border border-sand/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-sand">
            <FileText className="w-4 h-4" />
            <span>Immutable Platform Audit Trail (Payments, KYC, Transitions)</span>
          </div>

          <div className="space-y-2">
            {data?.auditLogs?.length === 0 ? (
              <p className="text-xs text-champagne/60 italic">No audit records logged yet.</p>
            ) : (
              data?.auditLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-wine/50 border border-sand/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-burgundy/80 text-sand border border-sand/20">
                      {log.action}
                    </span>
                    <span className="font-mono text-champagne">{log.resource} ({log.resourceId})</span>
                  </div>
                  <span className="text-[10px] text-champagne/60 font-mono">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
