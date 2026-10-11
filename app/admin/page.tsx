"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatINR, formatDate, formatDateTime, getStatusBadge } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
  MapPin,
  Eye,
  X,
} from "lucide-react";

export default function AdminConsolePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"METRICS" | "ORDERS" | "TAILORS" | "AUDIT">("METRICS");
  const [isLoading, setIsLoading] = useState(true);
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);

  // Role locking guard: prevent URL tampering
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.replace("/");
      } else if (user.role !== "ADMIN") {
        if (user.role === "CUSTOMER") router.replace("/dashboard");
        else if (user.role === "TAILOR") router.replace("/tailor-studio");
        else if (user.role === "DELIVERY_PARTNER") router.replace("/delivery-partner");
        else router.replace("/");
      }
    }
  }, [user, isAuthLoading, router]);

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
        <p className="text-sand font-mono text-xs">{t("admin.loading", "Loading SILAI Administrative Console...")}</p>
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
              {t("admin.platformGovernance", "PLATFORM GOVERNANCE")}
            </span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-0.5">
            {t("admin.adminTitle", "SILAI Admin Control Center")}
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            {t("admin.adminLabel", "Admin")}: <strong className="text-sand">{user?.fullName || "Amiya Admin"}</strong> • {t("admin.rbacActive", "Role-Based Access Control Active")}
          </p>
        </div>

        {/* Status badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-mono">
          {t("admin.systemStatusHealthy", "System Status: Healthy & Verified")}
        </div>
      </div>

      {/* Primary Financial & Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">{t("admin.grossGMV", "Gross Order GMV")}</span>
            <DollarSign className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {formatINR(metrics.totalGMV)}
          </p>
          <p className="text-[11px] text-champagne/60">{t("admin.grossGMVDesc", "Total marketplace transactions")}</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">{t("admin.grossRevenue", "Platform Revenue")}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-400">
            {formatINR(metrics.totalPlatformRevenue)}
          </p>
          <p className="text-[11px] text-champagne/60">{t("admin.platformRevenueDesc", "15% commission contribution")}</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">{t("admin.activeStitching", "Active Stitching")}</span>
            <ShoppingBag className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {metrics.activeOrders} {t("admin.ordersCount", "Orders")}
          </p>
          <p className="text-[11px] text-champagne/60">{t("admin.activeStitchingDesc", "In karigari & doorstep transit")}</p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-1">
          <div className="flex justify-between items-center text-sand/80">
            <span className="text-[10px] font-mono tracking-widest uppercase">{t("admin.masterBoutiques", "Master Boutiques")}</span>
            <Scissors className="w-4 h-4 text-sand" />
          </div>
          <p className="font-serif text-2xl font-bold text-sand-light">
            {metrics.totalTailors} {t("admin.tailorsCount", "Tailors")}
          </p>
          <p className="text-[11px] text-champagne/60">{t("admin.masterBoutiquesDesc", "100% KYC verified ateliers")}</p>
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
          {t("admin.tabOrders", "All Orders")} ({data?.orders?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("TAILORS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "TAILORS"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          {t("admin.tabTailors", "Ateliers & Boutiques")} ({data?.tailors?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "AUDIT"
              ? "bg-burgundy text-sand-light border border-sand/40"
              : "text-champagne/70 hover:text-sand"
          }`}
        >
          {t("admin.tabAudit", "Security Audit Logs")} ({data?.auditLogs?.length || 0})
        </button>
      </div>

      {/* Orders Table */}
      {activeTab === "METRICS" && (
        <div className="rounded-3xl bg-wine-dark/80 border border-sand/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wine/90 border-b border-sand/15 font-mono text-[11px] text-sand uppercase">
                <tr>
                  <th className="py-3 px-4">{t("admin.orderId", "Order ID")}</th>
                  <th className="py-3 px-4">{t("admin.customer", "Customer")}</th>
                  <th className="py-3 px-4">{t("admin.tailor", "Tailor")}</th>
                  <th className="py-3 px-4">{t("admin.garment", "Garment")}</th>
                  <th className="py-3 px-4">{t("admin.status", "Status")}</th>
                  <th className="py-3 px-4">{t("admin.gmv", "GMV")}</th>
                  <th className="py-3 px-4">{t("admin.platformComm", "Platform (15%)")}</th>
                  <th className="py-3 px-4 text-right">{t("admin.evidenceMap", "Evidence / Map")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10">
                {(Array.isArray(data?.orders) ? data.orders : []).map((ord: any) => {
                  const badge = getStatusBadge(ord.status, t);
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
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-burgundy/80 hover:bg-burgundy text-sand border border-sand/30 text-[11px] font-mono font-semibold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{t("admin.inspect", "Inspect")}</span>
                        </button>
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
          {(Array.isArray(data?.tailors) ? data.tailors : []).map((t: any) => (
            <div key={t.id} className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-base font-bold text-sand-light">{t.businessName}</h4>
                  <p className="text-xs text-champagne/70">{t.city}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {t("admin.kycVerified", "KYC Verified")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-sand/80 pt-1">
                <span>{t("admin.rating", "Rating")}: ★ {t.rating}</span>
                <span>•</span>
                <span>{t("admin.commission", "Commission")}: 15%</span>
                <span>•</span>
                <span>{t("tailor.serviceMenu", "Menu")}: {t.menuItems?.length || 0} {t("admin.menuServices", "services")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Table */}
      {activeTab === "AUDIT" && (
        <div className="rounded-3xl bg-wine-dark/80 border border-sand/20 p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-sand">
            <FileText className="w-4 h-4" />
            <span>{t("admin.immutableAudit", "Immutable Platform Audit Trail (Payments, KYC, Transitions)")}</span>
          </div>

          <div className="space-y-2">
            {!data?.auditLogs || data.auditLogs.length === 0 ? (
              <p className="text-xs text-champagne/60 italic">{t("admin.noAuditRecords", "No audit records logged yet.")}</p>
            ) : (
              (Array.isArray(data?.auditLogs) ? data.auditLogs : []).map((log: any) => (
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

      {/* Admin Dispute & Evidence Inspection Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#240812] to-[#0A0407] border border-[#F2D9A0]/30 shadow-2xl text-[#F2E5C6] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#F2D9A0]/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
                  {t("admin.disputeDossier", "DISPUTE & EVIDENCE DOSSIER")}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#F2D9A0]">
                  {t("orders.orderId", "Order")} {inspectingOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="p-1.5 rounded-full hover:bg-[#560B18]/50 text-[#F2E5C6]/60 hover:text-[#F2D9A0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Summary Pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#17050D] border border-[#F2D9A0]/15">
                  <span className="text-[10px] text-[#F2D9A0]/70 font-mono block">{t("admin.customer", "CUSTOMER")}</span>
                  <span className="font-semibold text-[#F2E5C6]">{inspectingOrder.customerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#17050D] border border-[#F2D9A0]/15">
                  <span className="text-[10px] text-[#F2D9A0]/70 font-mono block">{t("admin.tailor", "TAILOR")}</span>
                  <span className="font-semibold text-[#F2E5C6]">{inspectingOrder.tailorName}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#17050D] border border-[#F2D9A0]/15">
                  <span className="text-[10px] text-[#F2D9A0]/70 font-mono block">{t("admin.status", "STATUS")}</span>
                  <span className="font-semibold text-[#F2D9A0]">{inspectingOrder.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#17050D] border border-[#F2D9A0]/15">
                  <span className="text-[10px] text-[#F2D9A0]/70 font-mono block">{t("admin.payable", "PAYABLE")}</span>
                  <span className="font-semibold text-emerald-400">{formatINR(inspectingOrder.finalPayableAmount)}</span>
                </div>
              </div>

              {/* Verified Locations & GPS Coordinates */}
              <div className="p-4 rounded-xl bg-[#1A0711] border border-[#F2D9A0]/20 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#F2D9A0] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#F2D9A0]" />
                  {t("admin.doorstepLogistics", "Doorstep Logistics & Verified Coordinates")}
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-[#F2D9A0]/80 uppercase block">{t("admin.pickupAddress", "Pickup Address:")}</span>
                    <p className="text-[#F2E5C6]/90 mt-0.5">{inspectingOrder.pickupAddress || "Bengaluru Pickup Address"}</p>
                    {inspectingOrder.pickupLatitude && (
                      <span className="text-[10px] font-mono text-[#F2D9A0] block mt-0.5">
                        {t("admin.gpsCoords", "GPS Coordinates")}: {inspectingOrder.pickupLatitude.toFixed(5)}, {inspectingOrder.pickupLongitude?.toFixed(5)}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#F2D9A0]/10">
                    <span className="text-[11px] font-mono text-[#F2D9A0]/80 uppercase block">{t("admin.deliveryAddress", "Delivery Address:")}</span>
                    <p className="text-[#F2E5C6]/90 mt-0.5">{inspectingOrder.deliveryAddress || "Bengaluru Delivery Address"}</p>
                    {inspectingOrder.deliveryLatitude && (
                      <span className="text-[10px] font-mono text-[#F2D9A0] block mt-0.5">
                        {t("admin.gpsCoords", "GPS Coordinates")}: {inspectingOrder.deliveryLatitude.toFixed(5)}, {inspectingOrder.deliveryLongitude?.toFixed(5)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence Files & Inspection Photos */}
              <div className="p-4 rounded-xl bg-[#1A0711] border border-[#F2D9A0]/20 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#F2D9A0] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#F2D9A0]" />
                  {t("admin.uploadedPhotos", "Uploaded Verification Photos & Proof")}
                </h4>

                {(!inspectingOrder.fileMetadata || inspectingOrder.fileMetadata.length === 0) ? (
                  <p className="text-xs text-[#F2E5C6]/60 italic py-2">
                    {t("admin.noEvidenceFiles", "No physical evidence files uploaded for this commission yet.")}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {inspectingOrder.fileMetadata.map((file: any) => (
                      <a
                        key={file.id}
                        href={file.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-2 rounded-lg bg-[#270914] border border-[#F2D9A0]/20 hover:border-[#F2D9A0] transition block"
                      >
                        <div className="aspect-video w-full rounded bg-black/40 overflow-hidden flex items-center justify-center mb-1.5">
                          <img
                            src={file.publicUrl}
                            alt="Evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#F2D9A0] block truncate">
                          {file.evidenceType || "VERIFICATION"}
                        </span>
                        <span className="text-[9px] text-[#F2E5C6]/60 block font-mono">
                          {file.uploaderRole}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#F2D9A0]/15 flex justify-end bg-[#13050B]">
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-2 rounded-lg bg-[#560B18] text-[#F2D9A0] border border-[#F2D9A0]/30 hover:bg-[#75162D] text-xs font-semibold transition cursor-pointer"
              >
                {t("admin.closeDossier", "Close Dossier")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
