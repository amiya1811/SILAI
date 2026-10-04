"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TailorProfile } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  Star,
  Clock,
  MapPin,
  ShieldCheck,
  Scissors,
  ChevronRight,
  Sparkles,
  Store,
  Languages,
} from "lucide-react";

export default function TailorCard({ tailor }: { tailor: TailorProfile }) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Compute lowest menu starting price
  const startingPrice =
    Array.isArray(tailor?.menuItems) && tailor.menuItems.length > 0
      ? Math.min(...tailor.menuItems.map((m) => m?.basePrice || 450))
      : 450;

  const capabilitiesToShow =
    Array.isArray(tailor?.stitchingCapabilities) && tailor.stitchingCapabilities.length > 0
      ? tailor.stitchingCapabilities
      : Array.isArray(tailor?.specializations)
      ? tailor.specializations
      : [];

  return (
    <div className="group rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 overflow-hidden hover:border-burgundy/50 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between shadow-sm">
      {/* Cover / Profile Photo */}
      <div className="relative h-44 w-full overflow-hidden bg-wine">
        {tailor.coverImageUrl ? (
          <Image
            src={tailor.coverImageUrl}
            alt={tailor.businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-burgundy to-wine flex items-center justify-center">
            <Scissors className="w-12 h-12 text-sand/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wine via-wine/40 to-transparent" />

        {/* Top Left: Availability Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {tailor.availability === "AVAILABLE" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm">
              ● Accepting Orders
            </span>
          )}
          {tailor.availability === "BUSY" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/50 shadow-sm">
              ▲ High Demand (Limited Slots)
            </span>
          )}
          {tailor.availability === "NOT_ACCEPTING" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-500/50 shadow-sm">
              ✕ Not Accepting Orders
            </span>
          )}
        </div>

        {/* Top Right: Shop Type Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-black/85 border border-sand/30 text-[10px] font-mono text-sand flex items-center gap-1">
            <Store className="w-3 h-3 text-sand" /> {tailor.shopType || "Boutique"}
          </span>
          {tailor.distanceKm && (
            <span className="px-2 py-1 rounded-lg bg-black/85 border border-sand/25 text-[10px] font-mono text-champagne flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-sand" /> {tailor.distanceKm} km
            </span>
          )}
        </div>

        {/* Tailor Avatar & Name Header */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11 rounded-full border-2 border-sand overflow-hidden bg-burgundy shadow-md flex-shrink-0">
              {tailor.avatarUrl ? (
                <Image src={tailor.avatarUrl} alt={tailor.businessName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-sand font-bold">
                  {(tailor?.businessName || "T").charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-base sm:text-lg font-bold text-sand-light group-hover:text-sand transition line-clamp-1">
                  {tailor?.businessName || "Master Tailor"}
                </h3>
                {tailor.isVerified && (
                  <span title="SILAI Certified Master Tailor">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-champagne/80 truncate max-w-[200px]">
                {tailor.city} • {tailor.experienceYears} yrs exp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3.5 text-wine dark:text-champagne">
        {/* Rating, Stitching Time, and Starting Price */}
        <div className="flex items-center justify-between text-xs py-1 border-b border-burgundy/15 dark:border-burgundy/30">
          <div className="flex items-center gap-1 text-wine dark:text-champagne font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{tailor.rating}</span>
            <span className="text-maroon/70 dark:text-champagne/60 font-normal">({tailor.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-maroon/90 dark:text-champagne/80 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
            <span>Avg {tailor.avgStitchingDays} Days</span>
          </div>

          <div className="text-burgundy dark:text-sand-light font-bold text-xs">
            From {formatINR(startingPrice)}
          </div>
        </div>

        {/* Working Hours & Languages */}
        <div className="flex items-center justify-between text-[11px] text-maroon/90 dark:text-champagne/80 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-burgundy dark:text-sand" />
            <span>{tailor.workingHours || "10:00 AM – 8:00 PM"}</span>
          </div>
          {tailor.languages && tailor.languages.length > 0 && (
            <div className="flex items-center gap-1">
              <Languages className="w-3 h-3 text-burgundy dark:text-sand" />
              <span>{tailor.languages.slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>

        {/* Bio / Tagline */}
        <p className="text-xs text-maroon/85 dark:text-champagne/80 line-clamp-2 leading-relaxed">
          {tailor.tagline || tailor.bio}
        </p>

        {/* What They Stitch: Badges / Tags (Modification 7) */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-maroon/80 dark:text-sand uppercase font-semibold block">What they stitch:</span>
          <div className="flex flex-wrap gap-1.5">
            {capabilitiesToShow.slice(0, 4).map((cap) => (
              <span
                key={cap}
                className="px-2 py-0.5 rounded text-[10px] bg-sand/30 dark:bg-burgundy/40 text-wine dark:text-champagne border border-burgundy/15 dark:border-sand/25 font-medium"
              >
                {cap}
              </span>
            ))}
            {capabilitiesToShow.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-sand/20 dark:bg-burgundy/25 text-maroon/70 dark:text-champagne/60 border border-burgundy/10 dark:border-sand/15">
                +{capabilitiesToShow.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Digital Menu Snippet preview */}
        <div className="bg-[#F2E5C6]/70 dark:bg-[#0D080A]/80 rounded-xl p-2.5 border border-burgundy/15 dark:border-burgundy/30 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono text-maroon dark:text-sand font-semibold">
            <span>POPULAR SERVICES</span>
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="text-burgundy dark:text-sand underline hover:text-maroon dark:hover:text-sand-light transition"
            >
              {showQuickMenu ? "Hide" : "Preview Menu"}
            </button>
          </div>
          <div className="space-y-1">
            {(tailor?.menuItems || []).slice(0, showQuickMenu ? 5 : 2).map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-wine dark:text-champagne">
                <span className="truncate pr-2">{item.name}</span>
                <span className="font-bold text-burgundy dark:text-sand-light font-mono">{formatINR(item?.basePrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/tailors/${tailor.id}`}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-champagne bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:bg-maroon hover:shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <span>View Digital Menu & Book</span>
            <ChevronRight className="w-3.5 h-3.5 text-champagne" />
          </Link>
        </div>
      </div>
    </div>
  );
}
