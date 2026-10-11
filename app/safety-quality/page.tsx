import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Award, Sparkles, Lock, CheckCircle2, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "Safety, Quality & Artisan Standards | SILAI Bespoke",
  description: "Our uncompromising commitment to textile safety, craftsmanship auditing, background checks, and patron satisfaction.",
};

export default function SafetyQualityPage() {
  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#F2D9A0] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F2D9A0]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Uncompromising Excellence
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Safety, Quality & Craftsmanship Standards
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F2D9A0]" />
              1. Tailor Vetting & Verification Process
            </h2>
            <p>
              Not all tailors join SILAI. Every atelier, boutique, and master craftsman undergoes a rigorous 4-stage onboarding inspection:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li><strong>Physical Atelier Inspection:</strong> On-site audit of sewing machinery, irons, cutting tables, and clean fabric storage.</li>
              <li><strong>Sample Craftsmanship Test:</strong> Tailors produce a benchmark test garment assessed for stitch density, symmetry, and lining durability.</li>
              <li><strong>Identity & KYC Verification:</strong> Government-issued ID, business licenses, and background checks.</li>
              <li><strong>Patron Feedback Threshold:</strong> Ateliers must maintain an average customer fit rating of 4.5+ stars to remain active on the platform.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2D9A0]" />
              2. Textile Care & Loss Protection
            </h2>
            <p>
              Patrons trust us with heirloom silks, wedding lehengas, and bespoke suiting fabrics. We honor that trust with comprehensive safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Every fabric parcel is tagged with a unique encrypted barcode at doorstep pickup.</li>
              <li>High-value fabrics are covered under transit insurance against loss, transit water damage, or misplacement.</li>
              <li>Unused remnant fabrics and leftover borders are packaged and returned to the patron upon garment delivery.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F2D9A0]" />
              3. Courier Privacy & Customer Masking
            </h2>
            <p>
              We protect patron personal information through systemic privacy layers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Customer contact numbers are strictly masked via VoIP routing during delivery coordination.</li>
              <li>Delivery partners only see masked customer identifiers until active dispatch navigation begins.</li>
              <li>GPS tracking is restricted exclusively to active trip windows (15s pings while transit is underway, completely terminated upon OTP verification).</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#F2D9A0]" />
              4. Fair Labor & Artisan Welfare
            </h2>
            <p>
              SILAI is dedicated to the economic dignity of Indian karigars and tailors. Our artisans set their own prices transparently, receive direct weekly bank deposits, and benefit from free digital storefront tools with zero predatory commissions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
