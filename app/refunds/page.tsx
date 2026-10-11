import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

export const metadata = {
  title: "Refunds & Fit Guarantee | SILAI Bespoke",
  description: "100% Fit Guarantee, free alterations, and cancellation policies at SILAI.",
};

export default function RefundsPage() {
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
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Customer Assurance
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Refund & Fit Guarantee Policy
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              1. The SILAI 100% Fit Guarantee
            </h2>
            <p>
              Custom tailoring is an art of personal precision. If your garment does not match the measurements or fit profile
              agreed upon in your order, SILAI will coordinate free alteration pickup and revision by the master tailor within 7 calendar days of delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F2D9A0]" />
              2. Order Cancellations
            </h3>
            <p>
              Because bespoke tailoring involves reserved artisan hours and physical fabric transit, our cancellation policy operates by stage:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#F2E5C6]/70">
              <li>
                <strong>Before Tailor Acceptance:</strong> Full 100% refund initiated instantly to the original payment source.
              </li>
              <li>
                <strong>Before Fabric Pickup:</strong> Full cancellation permitted with no courier penalty.
              </li>
              <li>
                <strong>After Fabric Pickup (In Transit to Tailor):</strong> You may cancel; fabric will be safely returned to your doorstep (nominal return courier fee of ₹99 may apply).
              </li>
              <li>
                <strong>After Stitching Has Begun:</strong> Once cutting and crafting commences, full cancellation is not permitted due to irreversible fabric alteration.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. Refund Processing Timelines
            </h3>
            <p>
              Eligible refunds approved by our concierge desk are transmitted directly to the source account via Razorpay within 3 to 5 business days, depending on your banking provider.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              4. Fabric Protection & Damaged Goods
            </h3>
            <p>
              In the unlikely event of fabric damage during transit or cutting error beyond alteration repair, SILAI guarantees full fabric reimbursement up to assessed value or replacement support upon inspection.
            </p>
          </section>

          <div className="pt-6 border-t border-[#F2D9A0]/15 flex items-center justify-between text-[11px] font-mono text-[#F2E5C6]/50">
            <span>Last Updated: October 2026</span>
            <Link href="/contact" className="text-[#F2D9A0] hover:underline">
              Contact Concierge Desk →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
