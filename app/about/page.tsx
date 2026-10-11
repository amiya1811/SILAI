import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowLeft, ShieldCheck, Truck, Award, Users } from "lucide-react";

export const metadata = {
  title: "About SILAI | The Bespoke Tailoring Marketplace",
  description: "Learn about the mission, heritage, and technology behind SILAI custom tailoring.",
};

export default function AboutPage() {
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

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#F2D9A0]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Heritage & Vision
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              About SILAI
            </h1>
          </div>
        </div>

        <div className="space-y-10 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-8 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/20 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#F2D9A0]">
              Custom Made. Delivered Home.
            </h2>
            <p className="text-sm leading-relaxed">
              In an era of mass-manufactured fast fashion and ill-fitting ready-to-wear clothing, the ancient artistry
              of bespoke tailoring remains India’s true sartorial soul.
            </p>
            <p className="text-sm leading-relaxed">
              SILAI is the premier bespoke tailoring marketplace connecting discerning patrons with verified master tailors,
              neighborhood karigars, and luxury boutique ateliers across Bengaluru. We bridge generational craft with modern doorstep convenience.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#16050C]/80 border border-[#F2D9A0]/15 space-y-2">
              <Award className="w-6 h-6 text-[#F2D9A0] mb-2" />
              <h3 className="font-serif text-base font-bold text-[#F2D9A0]">Vetted Craftsmen</h3>
              <p className="text-xs text-[#F2E5C6]/70">
                Every tailor is verified for cutting precision, stitching quality, finishing finesse, and punctual delivery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#16050C]/80 border border-[#F2D9A0]/15 space-y-2">
              <Truck className="w-6 h-6 text-[#F2D9A0] mb-2" />
              <h3 className="font-serif text-base font-bold text-[#F2D9A0]">Two-Leg Logistics</h3>
              <p className="text-xs text-[#F2E5C6]/70">
                Doorstep fabric pickup and hanger delivery with live GPS courier tracking and secure OTP handovers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#16050C]/80 border border-[#F2D9A0]/15 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#F2D9A0] mb-2" />
              <h3 className="font-serif text-base font-bold text-[#F2D9A0]">100% Fit Guarantee</h3>
              <p className="text-xs text-[#F2E5C6]/70">
                If the garment does not match your specified measurements, we alter it for free within 7 calendar days.
              </p>
            </div>
          </div>

          <section id="guarantee" className="p-6 rounded-2xl bg-[#560B18]/30 border border-[#F2D9A0]/20 space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#F2D9A0]">
              Our Atelier Promise
            </h3>
            <p className="text-xs sm:text-sm text-[#F2E5C6]/85">
              We empower local karigars with digital reach, steady income, and professional tools, while giving customers the luxury of made-to-measure clothing that fits like a second skin.
            </p>
          </section>

          <div className="pt-6 border-t border-[#F2D9A0]/15 flex items-center justify-between text-xs text-[#F2E5C6]/60">
            <span>SILAI Technologies Pvt. Ltd. · Bengaluru</span>
            <Link href="/explore" className="text-[#F2D9A0] hover:underline font-semibold">
              Explore Master Tailors →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
