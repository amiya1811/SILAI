"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Home, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#560B18]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#F2D9A0]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Decorative Brand Emblem / SILAI Logo */}
      <div className="relative z-10 mb-6 text-center">
        <div className="relative w-16 h-20 mx-auto rounded-xl border border-[#F2D9A0]/40 bg-[#F2E5C6] overflow-hidden shadow-2xl mb-4">
          <Image src="/silai-logo.jpeg" alt="SILAI" fill className="object-cover" priority />
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F2D9A0]/80">
          SILAI ATELIER
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg bg-gradient-to-b from-[#3B010B]/70 to-[#080608]/90 border border-[#F2D9A0]/20 rounded-2xl p-8 sm:p-10 shadow-2xl text-center relative z-10 backdrop-blur-md">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#F2D9A0] mb-3">
          {t("common.error", "We couldn't find that page.")}
        </h1>
        <p className="text-sm sm:text-base text-[#F2E5C6]/80 leading-relaxed max-w-sm mx-auto mb-8 font-sans">
          The page may have moved, but your perfect fit is still waiting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] text-[#3B010B] font-semibold text-xs tracking-wider uppercase hover:opacity-95 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{t("nav.exploreTailors", "Explore Tailors")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#560B18]/60 hover:bg-[#560B18] border border-[#F2D9A0]/40 text-[#F2D9A0] font-semibold text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t("nav.home", "Back to Home")}</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F2D9A0]/15 text-[11px] font-mono text-[#F2E5C6]/50">
          SILAI Bespoke Custom Tailoring Marketplace · Bengaluru
        </div>
      </div>
    </div>
  );
}
