import React from "react";
import Link from "next/link";
import { Scissors, ArrowLeft, ShieldCheck, CheckCircle2, Clock, Camera, Award } from "lucide-react";

export const metadata = {
  title: "Master Tailor & Atelier Guidelines | SILAI Bespoke",
  description: "Standard operating procedures, craftsmanship criteria, order acceptance deadlines, and quality checks for SILAI tailoring partners.",
};

export default function TailorGuidelinesPage() {
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
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Artisan Craftsmanship Protocol
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Tailor Atelier Guidelines & Standards
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F2D9A0]" />
              1. Order Acceptance & Turnaround Commitments
            </h2>
            <p>
              Certified Master Tailors and Boutiques on SILAI agree to maintain swift operational responses to preserve patron trust:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li>Review and respond to incoming orders within <strong>4 operational hours</strong> via Tailor Studio.</li>
              <li>Mark status updates accurately: <em>FABRIC_RECEIVED → STITCHING → QUALITY_CHECK → READY_FOR_PICKUP</em>.</li>
              <li>Strictly adhere to the agreed delivery turnaround timeline (typically 3–5 working days). If unforeseen fabric issues occur, notify the patron via the concierge desk immediately.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#F2D9A0]" />
              2. Handover & Delivery Verification Protocol
            </h2>
            <p>
              To maintain our zero-dispute guarantee across two-leg deliveries:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-xs text-[#F2D9A0] font-mono block">Fabric Intake Photo</span>
                <p className="text-[11px] text-[#F2E5C6]/75">Upon Leg 1 delivery arrival, inspect raw fabric for tears, stains, or yardage deficits before confirming receipt.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/20 space-y-1">
                <span className="font-bold text-xs text-[#F2D9A0] font-mono block">Leg 2 Packaging Verification</span>
                <p className="text-[11px] text-[#F2E5C6]/75">Ensure finished garment is pressed, steamed, and sealed in an authorized dust cover before handing to the delivery partner.</p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F2D9A0]" />
              3. Quality Checkpoints & Seam Allowances
            </h2>
            <p>
              Every garment crafted under the SILAI emblem must meet luxury finishing standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/90">
              <li><strong>Margin Allowance:</strong> Minimum 1.5 to 2.0 inches of internal side seam allowance must be preserved for future alterations.</li>
              <li><strong>Finishing & Interfacing:</strong> High-grade fusible canvas for collars/cuffs, overlocked or French seams for unlined garments.</li>
              <li><strong>Zero Thread Hanging:</strong> All loose threads must be clipped; buttons reinforced with security stitching.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F2D9A0]" />
              4. Free Alteration Resolution
            </h2>
            <p>
              Under our 100% Fit Guarantee, if a garment differs from patron specifications, the atelier must complete minor alterations free of charge within 48 operational hours of courier handover.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
