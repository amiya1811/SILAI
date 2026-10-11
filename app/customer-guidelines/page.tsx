import React from "react";
import Link from "next/link";
import { UserCheck, ArrowLeft, Ruler, Sparkles, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Customer Guidelines | SILAI Bespoke",
  description: "Best practices for fabric handovers, accurate fit profiles, doorstep pickups, and dispute-free custom tailoring.",
};

export default function CustomerGuidelinesPage() {
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
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Bespoke Patron Code
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Customer Guidelines & Best Practices
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#F2D9A0]" />
              1. Fabric Preparation & Handover
            </h2>
            <p>
              To ensure flawless craftsmanship and eliminate delays, please observe the following preparation steps before our delivery courier arrives at your doorstep:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li><strong>Pre-wash or dry-clean</strong> raw cottons, silks, and linens if prone to shrinkage before handing them over.</li>
              <li>Ensure fabric yardage matches your tailor’s digital menu requirement (typically 2.5–3m for shirts/kurtas, 5–6m for sarees/lehengas).</li>
              <li>Include lining fabric, borders, buttons, or custom zippers in the parcel if not opted for atelier sourcing.</li>
              <li>Hand over your parcel in clean packaging; our courier will photograph the parcel condition for the dispute-proof audit log.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2D9A0]" />
              2. Accurate Measurements & Sample Garments
            </h2>
            <p>
              Your Fit Profile forms the blueprint of every custom cut. You have three flexible options:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20">
                <span className="text-xs font-mono font-bold text-[#F2D9A0] block">Send Best-Fitting Garment</span>
                <p className="text-[11px] text-[#F2E5C6]/75 mt-1">Our courier will pick up a sample outfit alongside your fabric for the tailor to copy 1:1.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20">
                <span className="text-xs font-mono font-bold text-[#F2D9A0] block">Digital Fit Profile</span>
                <p className="text-[11px] text-[#F2E5C6]/75 mt-1">Input chest, waist, hips, and shoulder measurements directly in your SILAI dashboard.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20">
                <span className="text-xs font-mono font-bold text-[#F2D9A0] block">Doorstep Measurement</span>
                <p className="text-[11px] text-[#F2E5C6]/75 mt-1">Request an in-person measurement visit by an authorized tailoring specialist.</p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F2D9A0]" />
              3. Doorstep Handover & 4-Digit OTP Verification
            </h2>
            <p>
              Every delivery handover is safeguarded by cryptographic one-time passwords:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Never share your 4-digit Delivery OTP over the phone or messaging apps.</li>
              <li>Only share your delivery OTP when the courier stands at your door with the physically inspected garment.</li>
              <li>Verify the garment tags and invoice before sharing the completion OTP.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F2D9A0]" />
              4. 7-Day Fit Guarantee Window
            </h2>
            <p>
              We provide a <strong>100% Fit Guarantee</strong>. If your finished garment does not fit exactly as requested, initiate a free doorstep alteration request through your dashboard within 7 calendar days of delivery.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
