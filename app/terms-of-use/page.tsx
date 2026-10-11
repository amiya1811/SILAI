import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Scale, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Use | SILAI Bespoke",
  description: "Terms and conditions of service for SILAI custom tailoring marketplace.",
};

export default function TermsOfUsePage() {
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
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Legal Agreement
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Terms of Use
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or creating an account on SILAI (&quot;the Platform&quot;), whether as a Customer, Tailor Partner,
              or Delivery Fleet Partner, you agree to comply with and be bound by these Terms of Use.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              2. Marketplace Nature of Service
            </h3>
            <p>
              SILAI connects customers requiring custom apparel tailoring with independent, verified master tailors and boutiques.
              SILAI operates the technological infrastructure, logistics orchestration, quality check verification, and customer concierge support.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. Custom Commissioning & Cancellation Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/70">
              <li><strong>Cancellation Window:</strong> Orders may be cancelled by the customer within 2 minutes of placement, prior to tailor acceptance and fabric dispatch.</li>
              <li><strong>Fabric Inspection:</strong> Our delivery partner inspects fabric during doorstep pickup and records verification photos. Fabric must be free of major tears or unworkable damage.</li>
              <li><strong>Alteration Guarantee:</strong> If a stitched garment does not conform to the approved measurement profile or design specifications, customers may request a complimentary alteration within 7 days of delivery.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              4. Payment & Cash on Delivery (COD)
            </h3>
            <p>
              Currently, orders are confirmed under Cash on Delivery (COD). Customers inspect the finished garment
              upon delivery before releasing payment to the courier partner.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              5. Intellectual Property
            </h3>
            <p>
              Bespoke embroidery motifs, sketches, and customer-uploaded inspiration designs remain the property of their
              respective creators. SILAI retains rights to the platform software, algorithms, and brand assets.
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
