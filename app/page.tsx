"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Ruler,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  Store,
} from "lucide-react";
import { INITIAL_TAILORS } from "@/lib/db/seed-data";
import { formatINR } from "@/lib/utils";
import TailorCard from "@/components/tailors/TailorCard";
import { useAuth } from "@/lib/auth/AuthContext";
import UnifiedRoleAuthModal from "@/components/auth/UnifiedRoleAuthModal";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredTailors, setFeaturedTailors] = useState(INITIAL_TAILORS.slice(0, 3));

  // Role Auth Modal state
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<"CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER" | null>(null);

  const handleSelectRole = (role: "CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER") => {
    if (user && user.role === role) {
      if (role === "CUSTOMER") router.push("/dashboard");
      else if (role === "TAILOR") router.push("/tailor-studio");
      else if (role === "DELIVERY_PARTNER") router.push("/delivery-partner");
      return;
    }
    setSelectedRoleForAuth(role);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. CINEMATIC HERO SECTION (Requirement 1, 7) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#3B010B_0%,#560B18_25%,#75162D_60%,#F2D9A0_88%,#F2E5C6_100%)] dark:bg-[linear-gradient(135deg,#080608_0%,#160B0E_25%,#3B010B_65%,#560B18_100%)] border-b border-sand/20 dark:border-burgundy/30 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        {/* Atmospheric radial glows */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-burgundy/25 dark:bg-burgundy/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-96 h-96 bg-sand/30 dark:bg-burgundy/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Animated Golden Thread Curves Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
            <path
              d="M-100,200 C300,50 600,450 1000,150 C1300,-50 1400,350 1600,250"
              stroke="#F2D9A0"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              className="animate-pulse"
            />
            <path
              d="M-50,600 C250,750 700,300 1100,650 C1350,850 1500,450 1650,550"
              stroke="#F2D9A0"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 py-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon/90 border border-sand/40 text-sand text-xs font-mono tracking-[0.25em] uppercase shadow-gold-glow animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-sand" />
            CUSTOM TAILORING, REIMAGINED
          </div>

          {/* Main Cinematic Headline */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-champagne-light drop-shadow-sm leading-[1.08]">
            Your Design. <br />
            <span className="bg-gradient-to-r from-sand via-champagne to-sand-light bg-clip-text text-transparent italic">
              Your Tailor.
            </span>{" "}
            Your Fit.
          </h1>

          {/* Secondary Editorial Copy */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-champagne font-sans font-light leading-relaxed drop-shadow-sm">
            “Discover trusted tailors, compare stitching prices, customize your design, and get your finished outfit delivered to your doorstep.”
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#get-started"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-sm text-sand-light bg-gradient-to-r from-burgundy via-maroon to-burgundy border border-sand/50 shadow-gold-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4 text-sand" /> Get Started with SILAI
              <ArrowRight className="w-4 h-4 text-sand" />
            </a>

            <Link
              href="/try-on"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-sm text-sand-light bg-maroon/90 hover:bg-maroon border border-sand/50 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-sand" /> Virtual Try-On Studio
            </Link>
          </div>

          {/* Trust Metrics Pill */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono text-champagne/90 border-t border-sand/25 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sand" />
              <span>100% Fit Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sand" />
              <span>Doorstep Pickup & Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-sand fill-sand" />
              <span>4.9★ Average Karigar Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GET STARTED WITH SILAI / SELECT YOUR ROLE (Modification 1) */}
      <section id="get-started" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-[0.25em] text-sand font-semibold uppercase">
            GET STARTED WITH SILAI
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-champagne-light mt-2">
            Select Your Role
          </h2>
          <p className="text-sm text-champagne/80 mt-2">
            Choose your tailored experience to enter your dedicated portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OPTION 1: CUSTOMER */}
          <div
            onClick={() => handleSelectRole("CUSTOMER")}
            className="group relative rounded-3xl bg-[#FAF4E8] sm:bg-[#FAF4E8]/95 border border-burgundy/20 p-8 hover:border-burgundy/50 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-maroon border border-sand/40 flex items-center justify-center text-champagne group-hover:scale-110 shadow-sm transition">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-sand/30 text-maroon border border-burgundy/20 font-semibold">
                  For Patrons
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-wine group-hover:text-burgundy transition">
                CUSTOMER
              </h3>
              <p className="text-xs sm:text-sm text-maroon/80 leading-relaxed">
                Find the right tailor. Get it stitched and delivered.
              </p>
            </div>

            <div className="pt-4 border-t border-burgundy/15 flex items-center justify-between text-xs text-burgundy font-bold">
              <span>Enter Customer Experience</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* OPTION 2: TAILOR */}
          <div
            onClick={() => handleSelectRole("TAILOR")}
            className="group relative rounded-3xl bg-[#FAF4E8] sm:bg-[#FAF4E8]/95 border border-burgundy/20 p-8 hover:border-burgundy/50 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-maroon border border-sand/40 flex items-center justify-center text-champagne group-hover:scale-110 shadow-sm transition">
                  <Scissors className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-sand/30 text-maroon border border-burgundy/20 font-semibold">
                  For Boutiques & Tailors
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-wine group-hover:text-burgundy transition">
                TAILOR
              </h3>
              <p className="text-xs sm:text-sm text-maroon/80 leading-relaxed">
                Showcase your work. Manage orders. Grow your business.
              </p>
            </div>

            <div className="pt-4 border-t border-burgundy/15 flex items-center justify-between text-xs text-burgundy font-bold">
              <span>Enter Tailor Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* OPTION 3: DELIVERY AGENT */}
          <div
            onClick={() => handleSelectRole("DELIVERY_PARTNER")}
            className="group relative rounded-3xl bg-[#FAF4E8] sm:bg-[#FAF4E8]/95 border border-burgundy/20 p-8 hover:border-burgundy/50 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-burgundy to-maroon border border-sand/40 flex items-center justify-center text-champagne group-hover:scale-110 shadow-sm transition">
                  <Truck className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-sand/30 text-maroon border border-burgundy/20 font-semibold">
                  For Logistics Fleet
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-wine group-hover:text-burgundy transition">
                DELIVERY AGENT
              </h3>
              <p className="text-xs sm:text-sm text-maroon/80 leading-relaxed">
                Pick up. Deliver. Earn.
              </p>
            </div>

            <div className="pt-4 border-t border-burgundy/15 flex items-center justify-between text-xs text-burgundy font-bold">
              <span>Enter Delivery Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW SILAI WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-[0.25em] text-sand font-semibold uppercase">
            THE ATELIER AT YOUR DOORSTEP
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-champagne-light mt-2">
            How Custom Tailoring Works
          </h2>
          <p className="text-sm text-champagne/80 mt-2">
            No more haggling or traveling to crowded markets. Experience effortless couture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-6 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/15 dark:border-burgundy/40 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-maroon border border-sand/30 flex items-center justify-center text-sand font-serif text-xl font-bold">
              01
            </div>
            <h3 className="font-serif text-xl font-semibold text-wine dark:text-champagne">
              Choose or Upload Design
            </h3>
            <p className="text-xs text-maroon/80 dark:text-champagne/75 leading-relaxed">
              Pick from standard blouse/kurti styles, upload a Pinterest inspiration photo, or configure necklines and sleeves in our AI Try-On.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/15 dark:border-burgundy/40 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-maroon border border-sand/30 flex items-center justify-center text-sand font-serif text-xl font-bold">
              02
            </div>
            <h3 className="font-serif text-xl font-semibold text-wine dark:text-champagne">
              Doorstep Fabric Pickup
            </h3>
            <p className="text-xs text-maroon/80 dark:text-champagne/75 leading-relaxed">
              A SILAI logistics partner arrives at your door to safely collect your unstitched fabric and optional sample fitting garment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/15 dark:border-burgundy/40 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-maroon border border-sand/30 flex items-center justify-center text-sand font-serif text-xl font-bold">
              03
            </div>
            <h3 className="font-serif text-xl font-semibold text-wine dark:text-champagne">
              Master Craftsmanship
            </h3>
            <p className="text-xs text-maroon/80 dark:text-champagne/75 leading-relaxed">
              Your chosen boutique cuts and stitches with precision interlining, reinforced seams, and custom finishing details.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/15 dark:border-burgundy/40 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-burgundy to-maroon border border-sand/30 flex items-center justify-center text-sand font-serif text-xl font-bold">
              04
            </div>
            <h3 className="font-serif text-xl font-semibold text-wine dark:text-champagne">
              Doorstep Delivery & Guarantee
            </h3>
            <p className="text-xs text-maroon/80 dark:text-champagne/75 leading-relaxed">
              Receive your steam-pressed, ready-to-wear outfit. Need a slight nip or tuck? We provide free doorstep alteration pickup!
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED MASTER TAILORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] text-sand font-semibold uppercase">
              CURATED ATELIERS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-champagne-light mt-1">
              Top Rated Master Tailors
            </h2>
            <p className="text-sm text-champagne/80 mt-1">
              Compare transparent digital menus, stitching turnarounds, and verified customer reviews.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-sand hover:text-sand-light flex items-center gap-1.5 transition"
          >
            Explore all 10+ partner boutiques <ChevronRight className="w-4 h-4 text-sand" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(featuredTailors || []).map((tailor) => (
            <TailorCard key={tailor.id} tailor={tailor} />
          ))}
        </div>
      </section>

      {/* 5. VIRTUAL TRY-ON CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-burgundy via-maroon to-burgundy border-2 border-sand/40 p-8 sm:p-14 shadow-xl text-champagne">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sand/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/15 text-sand text-xs font-mono tracking-widest uppercase border border-sand/30">
              <Sparkles className="w-3.5 h-3.5" /> Virtual Try-On Studio
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-champagne-light leading-tight">
              Visualize Your Silhouette Before You Stitch.
            </h2>
            <p className="text-sm text-champagne/90 leading-relaxed">
              Upload your photo and your dream design. Our virtual studio visualizes your outfit preview while keeping your original reference design intact for your tailor.
            </p>
            <div className="pt-2">
              <Link
                href="/try-on"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-wine bg-gradient-to-r from-sand via-champagne to-sand-light border border-sand/60 hover:shadow-gold-glow hover:scale-[1.02] transition"
              >
                <span>Open Virtual Studio</span>
                <ArrowRight className="w-4 h-4 text-wine" />
              </Link>
            </div>
            <p className="text-[11px] text-champagne/70 italic">
              *Virtual preview only. Actual stitching and fit will be handled by your chosen tailor.
            </p>
          </div>
        </div>
      </section>

      {/* Unified Role Auth & Onboarding Modal */}
      {selectedRoleForAuth && (
        <UnifiedRoleAuthModal
          isOpen={!!selectedRoleForAuth}
          targetRole={selectedRoleForAuth}
          onClose={() => setSelectedRoleForAuth(null)}
        />
      )}
    </div>
  );
}
