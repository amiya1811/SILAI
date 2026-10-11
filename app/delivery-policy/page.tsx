import React from "react";
import Link from "next/link";
import { Truck, ArrowLeft, KeyRound, MapPin, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Delivery & Pickup Policy | SILAI Bespoke",
  description: "Two-leg doorstep logistics, secure OTP verification, and transit guidelines.",
};

export default function DeliveryPolicyPage() {
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
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Logistics Excellence
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Doorstep Delivery & Pickup Policy
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#F2D9A0]" />
              1. Two-Leg Doorstep Logistics System
            </h2>
            <p>
              SILAI operates a dedicated two-stage courier fleet across Bengaluru to eliminate transit friction between you and your master artisan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#560B18]/20 border border-[#F2D9A0]/20">
                <span className="text-[11px] font-mono text-[#F2D9A0] block font-bold mb-1">LEG 1: PICKUP</span>
                <p className="text-xs text-[#F2E5C6]/80">
                  Customer Doorstep → SILAI Courier → Master Tailor Atelier. We pick up raw fabric, measurement reference garments, or sketches.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#560B18]/20 border border-[#F2D9A0]/20">
                <span className="text-[11px] font-mono text-[#F2D9A0] block font-bold mb-1">LEG 2: FINAL DROP</span>
                <p className="text-xs text-[#F2E5C6]/80">
                  Master Tailor Atelier → SILAI Courier → Customer Doorstep. Finished garments arrive pressed, inspected, and hanger-packed.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F2D9A0]" />
              2. Secure 4-Digit OTP Handover Verification
            </h3>
            <p>
              To ensure unmatched safety and zero misplaced parcels:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#F2E5C6]/70">
              <li>Every pickup and final delivery requires a unique 4-digit One-Time Password (OTP) displayed directly on your SILAI Order Screen.</li>
              <li>The delivery partner cannot complete transit in the system without you verbally sharing this secure code at your doorstep.</li>
              <li>A digital proof-of-delivery signature and inspection timestamp are recorded in immutable logs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F2D9A0]" />
              3. Service Areas & Coverage
            </h3>
            <p>
              Our active delivery hubs currently cover all prominent neighborhoods in Bengaluru Metro:
              Electronic City, Dodda Thogur, Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, Malleshwaram, and Bellandur.
            </p>
          </section>

          <div className="pt-6 border-t border-[#F2D9A0]/15 flex items-center justify-between text-[11px] font-mono text-[#F2E5C6]/50">
            <span>Last Updated: October 2026 · Bengaluru, India</span>
            <Link href="/help" className="text-[#F2D9A0] hover:underline">
              Visit Help Center →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
