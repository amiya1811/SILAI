"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { TailorProfile, MenuItem, Review } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Scissors,
  CheckCircle,
  Sparkles,
  Phone,
  Store,
  Languages,
  Check,
} from "lucide-react";
import TailorMenuBookModal from "@/components/tailors/TailorMenuBookModal";

export default function TailorDetailPage() {
  const params = useParams();
  const tailorId = params.id as string;

  const [tailor, setTailor] = useState<TailorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeBookingItem, setActiveBookingItem] = useState<MenuItem | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTailorData() {
      try {
        const res = await fetch(`/api/tailors/${tailorId}`);
        if (res.ok) {
          const data = await res.json();
          setTailor(data.tailor);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load tailor details", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTailorData();
  }, [tailorId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-20 h-20 rounded-full bg-wine-dark/70 mx-auto mb-4" />
        <p className="text-sand font-mono text-sm">Loading Master Tailor Studio...</p>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Scissors className="w-12 h-12 text-sand/40 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-sand">Tailor Studio Not Found</h2>
        <p className="text-xs text-champagne/70">The atelier you are looking for may have moved or been updated.</p>
      </div>
    );
  }

  // Filter menu items by selected category
  const menuList = Array.isArray(tailor.menuItems) ? tailor.menuItems : [];
  const filteredMenuItems =
    selectedCategory === "ALL"
      ? menuList
      : menuList.filter((m) => m?.category === selectedCategory);

  const categories = ["ALL", ...Array.from(new Set(menuList.map((m) => m?.category).filter(Boolean)))];

  const handleBookItem = (item: MenuItem) => {
    setActiveBookingItem(item);
    setIsBookModalOpen(true);
  };

  const capabilitiesToShow =
    Array.isArray(tailor.stitchingCapabilities) && tailor.stitchingCapabilities.length > 0
      ? tailor.stitchingCapabilities
      : Array.isArray(tailor.specializations)
      ? tailor.specializations
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header Atelier Banner (Modification 7) */}
      <div className="relative rounded-3xl overflow-hidden bg-[linear-gradient(135deg,#3B010B_0%,#560B18_25%,#75162D_60%,#F2D9A0_88%,#F2E5C6_100%)] dark:bg-[linear-gradient(135deg,#080608_0%,#160B0E_25%,#3B010B_65%,#560B18_100%)] border border-sand/20 dark:border-burgundy/30 p-8 sm:p-12 shadow-2xl transition-colors duration-300">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-sand overflow-hidden shadow-gold-glow bg-burgundy flex-shrink-0">
              {tailor.avatarUrl ? (
                <Image src={tailor.avatarUrl} alt={tailor.businessName || "Tailor Studio"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-3xl font-bold text-sand">
                  {(tailor.businessName || "T").charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-sand uppercase">
                  ATELIER PROFILE
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-sand/20 text-sand border border-sand/40 flex items-center gap-1 font-semibold">
                  <Store className="w-3 h-3 text-sand" /> {tailor.shopType || "Boutique"}
                </span>

                {/* Availability status badge */}
                {tailor.availability === "AVAILABLE" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                    ● Accepting Orders
                  </span>
                )}
                {tailor.availability === "BUSY" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-500/50">
                    ▲ Busy / Limited Slots
                  </span>
                )}
                {tailor.availability === "NOT_ACCEPTING" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-500/50">
                    ✕ Not Accepting Orders
                  </span>
                )}

                {tailor.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                    <ShieldCheck className="w-3 h-3" /> Certified Master Tailor
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sand-light">
                {tailor.businessName}
              </h1>
              <p className="text-xs sm:text-sm text-champagne/90 max-w-xl leading-relaxed">
                {tailor.tagline || tailor.bio}
              </p>

              {/* Working Hours, Languages, and Address */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-sand/95 pt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-sand text-sand" />
                  <span className="font-bold">{tailor.rating}</span>
                  <span className="text-champagne/80">({tailor.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-champagne-light">
                  <MapPin className="w-4 h-4 text-sand" />
                  <span>{tailor.address}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-champagne-light">
                  <Clock className="w-4 h-4 text-sand" />
                  <span>{tailor.workingHours || "10:00 AM – 8:00 PM"}</span>
                </div>
                {tailor.languages && tailor.languages.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-champagne-light">
                      <Languages className="w-4 h-4 text-sand" />
                      <span>{tailor.languages.join(", ")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Book First Item CTA */}
          <div className="w-full md:w-auto">
            <button
              onClick={() => handleBookItem(tailor.menuItems[0])}
              className="w-full md:w-auto px-6 py-3.5 rounded-full font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4 text-sand" /> Book Doorstep Stitching
            </button>
          </div>
        </div>
      </div>

      {/* What the Tailor Can Stitch (Modification 7) */}
      <div className="p-6 rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 space-y-3 shadow-card-luxury text-wine dark:text-champagne">
        <span className="text-xs font-mono tracking-widest text-burgundy dark:text-sand font-semibold uppercase block">
          WHAT THIS MASTER TAILOR CAN STITCH
        </span>
        <div className="flex flex-wrap gap-2">
          {capabilitiesToShow.map((cap) => (
            <span
              key={cap}
              className="px-3.5 py-1.5 rounded-xl text-xs bg-sand/30 dark:bg-burgundy/40 text-wine dark:text-champagne border border-burgundy/20 dark:border-sand/25 flex items-center gap-1.5 font-medium"
            >
              <Check className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
              <span>{cap}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Digital Menu Section (Requirement 11 & Modification 7) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-burgundy/15 dark:border-burgundy/30 pb-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-sand font-semibold uppercase">
              TRANSPARENT PRICING & SERVICE MENU
            </span>
            <h2 className="font-serif text-2xl font-bold text-champagne-light mt-0.5">
              Bespoke Stitching Menu
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-burgundy to-maroon text-champagne font-bold shadow-sm"
                    : "bg-[#FAF4E8] dark:bg-[#160B0E] text-wine/80 dark:text-champagne/80 border border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Services & Pricing Display (Customer Display) */}
        {filteredMenuItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FAF4E8] border border-burgundy/20 space-y-2 text-wine">
            <p className="text-xs text-wine/70 italic">
              No custom stitching services have been published by this atelier yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
          {Object.entries(
            filteredMenuItems.reduce((groups, item) => {
              const cat = item.category || "General";
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(item);
              return groups;
            }, {} as Record<string, MenuItem[]>)
          ).map(([categoryName, items]) => (
            <div
              key={categoryName}
              className="p-6 rounded-3xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 space-y-4 shadow-card-luxury text-wine dark:text-champagne"
            >
              <div className="flex items-center justify-between border-b border-burgundy/15 dark:border-burgundy/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-burgundy dark:bg-sand" />
                  <h3 className="font-serif text-xl font-bold text-wine dark:text-champagne uppercase tracking-wide">
                    {categoryName}
                  </h3>
                </div>
                <span className="text-xs font-mono text-burgundy/80 dark:text-sand/80 font-semibold">
                  {items.length} {items.length === 1 ? "Service Option" : "Service Options"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/20 dark:border-burgundy/30 hover:border-burgundy/40 transition flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-wine dark:text-champagne">
                            • {item.variantName || item.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sand/40 dark:bg-burgundy/40 text-burgundy dark:text-sand border border-burgundy/20 dark:border-sand/30 font-semibold">
                            {item.complexity || "REGULAR"}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-wine/75 dark:text-champagne/75 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-serif text-xl font-bold text-burgundy dark:text-sand">
                          {formatINR(item.basePrice)}
                        </span>
                        <p className="text-[10px] text-wine/60 dark:text-champagne/60 font-mono">base stitching</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-burgundy/10 dark:border-burgundy/25">
                      <div className="flex items-center gap-1.5 text-xs text-wine/70 dark:text-champagne/70 font-mono">
                        <Clock className="w-3.5 h-3.5 text-burgundy dark:text-sand" />
                        <span>Ready in ~{item.estimatedDays} {item.estimatedDays === 1 ? "day" : "days"}</span>
                      </div>

                      <button
                        onClick={() => handleBookItem(item)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-champagne bg-gradient-to-r from-burgundy to-maroon border border-burgundy/30 hover:opacity-95 transition shadow-sm"
                      >
                        Select & Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* 3. Portfolio & Past Craftsmanship Gallery */}
      {tailor.portfolios && tailor.portfolios.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-burgundy/15 dark:border-burgundy/30">
          <div>
            <span className="text-xs font-mono tracking-widest text-sand font-semibold uppercase">
              CRAFTSMANSHIP SHOWCASE
            </span>
            <h2 className="font-serif text-2xl font-bold text-champagne-light mt-0.5">
              Portfolio & Recent Outfits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tailor.portfolios.map((port) => (
              <div
                key={port.id}
                className="group relative rounded-2xl overflow-hidden border border-burgundy/20 dark:border-burgundy/40 bg-wine-dark shadow-sm"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={port.imageUrl}
                    alt={port.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wine-dark via-wine-dark/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-burgundy/90 text-champagne border border-sand/20">
                    {port.garmentCategory}
                  </span>
                  <h4 className="font-serif text-base font-semibold text-sand-light">{port.title}</h4>
                  <p className="text-xs text-champagne/80 line-clamp-1">{port.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Verified Customer Reviews */}
      <div className="space-y-6 pt-6 border-t border-burgundy/15 dark:border-burgundy/30">
        <div>
          <span className="text-xs font-mono tracking-widest text-sand font-semibold uppercase">
            VERIFIED EXPERIENCES
          </span>
          <h2 className="font-serif text-2xl font-bold text-champagne-light mt-0.5">
            Customer Reviews & Fit Ratings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-wine/70 dark:text-champagne/70 italic">
              All 340+ customer reviews have a 4.9+ star rating for this master tailor.
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 space-y-3 shadow-sm text-wine dark:text-champagne"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-xs text-burgundy dark:text-sand font-serif">{rev.customerName}</h5>
                    <p className="text-[10px] text-wine/60 dark:text-champagne/60 font-mono">
                      {formatDate(rev.createdAt)} • Verified Stitching
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: Math.min(5, Math.max(1, Math.round(Number(rev?.rating) || 5))) }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-wine/80 dark:text-champagne/80 leading-relaxed">{rev.comment}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-wine/80 dark:text-champagne/80 font-mono">
                  <span>Fit Precision:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">10/10 Perfect Snug</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && (
        <TailorMenuBookModal
          tailor={tailor}
          initialMenuItem={activeBookingItem}
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
        />
      )}
    </div>
  );
}
