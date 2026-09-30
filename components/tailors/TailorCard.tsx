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
} from "lucide-react";

export default function TailorCard({ tailor }: { tailor: TailorProfile }) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Compute lowest menu starting price
  const startingPrice = Math.min(...tailor.menuItems.map((m) => m.basePrice), 450);

  return (
    <div className="group rounded-2xl bg-gradient-to-b from-maroon/70 to-wine-dark border border-sand/20 overflow-hidden hover:border-sand/50 hover:shadow-card-luxury transition-all duration-300 flex flex-col justify-between">
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
        <div className="absolute inset-0 bg-gradient-to-t from-wine-dark via-wine-dark/40 to-transparent" />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          {tailor.availability === "AVAILABLE" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 backdrop-blur-sm">
              ● Accepting Orders
            </span>
          )}
          {tailor.availability === "BUSY" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/50 backdrop-blur-sm">
              ▲ High Demand (Limited Slots)
            </span>
          )}
          {tailor.availability === "NOT_ACCEPTING" && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/50 backdrop-blur-sm">
              ✕ Currently Full
            </span>
          )}
        </div>

        {/* Distance tag */}
        {tailor.distanceKm && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-sand/25 text-[11px] font-mono text-sand flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sand" /> {tailor.distanceKm} km
          </div>
        )}

        {/* Tailor Avatar & Name Header */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11 rounded-full border-2 border-sand overflow-hidden bg-burgundy shadow-md">
              {tailor.avatarUrl ? (
                <Image src={tailor.avatarUrl} alt={tailor.businessName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-sand font-bold">
                  {tailor.businessName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-lg font-bold text-sand-light group-hover:text-sand transition">
                  {tailor.businessName}
                </h3>
                {tailor.isVerified && (
                  <span title="SILAI Certified Master Tailor">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-champagne/75 truncate max-w-[200px]">
                {tailor.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
        {/* Rating and Stitching Time metrics */}
        <div className="flex items-center justify-between text-xs py-1 border-b border-sand/15">
          <div className="flex items-center gap-1 text-sand">
            <Star className="w-3.5 h-3.5 fill-sand text-sand" />
            <span className="font-bold">{tailor.rating}</span>
            <span className="text-champagne/60 font-normal">({tailor.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-champagne/80 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sand" />
            <span>Avg {tailor.avgStitchingDays} Days</span>
          </div>

          <div className="text-sand font-semibold text-xs">
            From {formatINR(startingPrice)}
          </div>
        </div>

        {/* Bio / Tagline */}
        <p className="text-xs text-champagne/80 line-clamp-2 leading-relaxed">
          {tailor.tagline || tailor.bio}
        </p>

        {/* Specialization Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tailor.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2 py-0.5 rounded text-[10px] bg-wine/80 text-sand border border-sand/20"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Digital Menu Snippet preview */}
        <div className="bg-wine-dark/70 rounded-xl p-2.5 border border-sand/10 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono text-sand/80">
            <span>POPULAR SERVICES</span>
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="text-sand underline hover:text-sand-light"
            >
              {showQuickMenu ? "Hide" : "Preview Menu"}
            </button>
          </div>
          <div className="space-y-1">
            {tailor.menuItems.slice(0, showQuickMenu ? 5 : 2).map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-champagne/90">
                <span className="truncate pr-2">{item.name}</span>
                <span className="font-medium text-sand">{formatINR(item.basePrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/tailors/${tailor.id}`}
            className="w-full py-2.5 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/30 hover:border-sand/60 hover:shadow-gold-glow transition flex items-center justify-center gap-1.5"
          >
            <span>View Digital Menu & Book</span>
            <ChevronRight className="w-3.5 h-3.5 text-sand" />
          </Link>
        </div>
      </div>
    </div>
  );
}
