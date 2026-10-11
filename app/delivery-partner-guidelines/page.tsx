import React from "react";
import Link from "next/link";
import { Truck, ArrowLeft, ShieldCheck, Camera, KeyRound, MapPin, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Delivery Partner Guidelines | SILAI Logistics",
  description: "Standard protocols for doorstep garment couriers: 4-moment photo audit, OTP verification, masked privacy, and safe handling.",
};

export default function DeliveryPartnerGuidelinesPage() {
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
              Fleet Logistics Standard
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Delivery Partner Fleet Guidelines
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#F2D9A0]" />
              1. The Mandatory 4-Moment Photo Audit
            </h2>
            <p>
              To protect customers, tailors, and delivery partners from disputes or damaged goods claims, riders must complete photo logs through the Delivery Fleet Portal at four critical moments:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-[#F2D9A0] font-mono block">Moment 1: Customer Pickup</span>
                <p className="text-[#F2E5C6]/75">Capture clear photo of the fabric parcel at customer doorstep; note packaging condition.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-[#F2D9A0] font-mono block">Moment 2: Tailor Handover</span>
                <p className="text-[#F2E5C6]/75">Photograph handover of fabric parcel at the master tailor’s studio.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-[#F2D9A0] font-mono block">Moment 3: Finished Garment Pickup</span>
                <p className="text-[#F2E5C6]/75">Photograph sealed garment bag when collecting ready outfit from atelier for final Leg 2 drop.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-[#F2D9A0] font-mono block">Moment 4: Final Handover & OTP</span>
                <p className="text-[#F2E5C6]/75">Capture final delivery photo at patron’s doorstep and enter the patron's 4-digit secret OTP.</p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F2D9A0]" />
              2. Strict OTP Protocol
            </h2>
            <p>
              Deliveries cannot be completed without the correct patron OTP verified by the server:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Never mark a job as delivered without entering the customer's verified 4-digit PIN in the app.</li>
              <li>Do not ask patrons for the PIN over telephone prior to physical arrival.</li>
              <li>Prompt the patron to inspect the garment bag before requesting the verification PIN.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F2D9A0]" />
              3. Garment Care & Weather Protection
            </h2>
            <p>
              Bespoke garments are high-value delicate works of art:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Always transport garments inside SILAI waterproof courier bags.</li>
              <li>Keep suits and sherwanis flat or hanging inside garment cases to prevent creasing.</li>
              <li>In the event of heavy rain or road obstruction, inform dispatch support immediately.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F2D9A0]" />
              4. Payouts & Transparent Settlements
            </h2>
            <p>
              Fleet partners earn fair, transparent per-kilometer and milestone-based payouts directly credited to their registered bank accounts weekly, with zero hidden platform deductions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
