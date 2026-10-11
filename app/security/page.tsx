import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, KeyRound, Server, UserCheck } from "lucide-react";

export const metadata = {
  title: "Security & Escrow Protection | SILAI Bespoke",
  description: "Enterprise data encryption, payment escrow safety, and courier OTP protocols.",
};

export default function SecurityPage() {
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
              Trust & Integrity
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Security & Escrow Protection
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F2D9A0]" />
              1. Escrow-Style Milestone Payment Protection
            </h2>
            <p>
              When you pay for a custom tailoring commission on SILAI, your payment is held securely in escrow.
              The artisan tailor receives disbursement only once the garment is stitched to specification, inspected, and confirmed delivered to your satisfaction.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F2D9A0]" />
              2. Two-Factor Doorstep Handover Verification
            </h3>
            <p>
              Both Leg 1 (Fabric Pickup) and Leg 2 (Final Outfit Delivery) require matching digital OTPs.
              A parcel cannot be closed as delivered without explicit physical confirmation at your door, guarding against lost parcels and fraudulent claims.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F2D9A0]" />
              3. Data Encryption & Profile Privacy
            </h3>
            <p>
              Your fit profiles, measurement charts, and private design reference photos are stored with encrypted access controls.
              Passwords utilize high-entropy bcrypt hashing with salted rounds, and customer authentication is guarded by HTTP-only strict cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#F2D9A0]" />
              4. Verified Artisan & Fleet Background Checks
            </h3>
            <p>
              Every master tailor atelier and delivery rider on the SILAI platform undergoes identity verification, workshop address validation, and craftsmanship testing before receiving customer orders.
            </p>
          </section>

          <div className="pt-6 border-t border-[#F2D9A0]/15 text-[11px] font-mono text-[#F2E5C6]/50">
            Last Updated: October 2026 · Bengaluru, India
          </div>
        </div>
      </main>
    </div>
  );
}
