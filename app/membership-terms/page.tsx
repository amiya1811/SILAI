import React from "react";
import Link from "next/link";
import { Crown, ArrowLeft, Shield, Sparkles } from "lucide-react";

export const metadata = {
  title: "Membership Terms | SILAI Bespoke",
  description: "Terms and privileges for SILAI Atelier members and patron accounts.",
};

export default function MembershipTermsPage() {
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
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Privileges & Guild Rules
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Atelier Membership Terms
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2D9A0]" />
              1. SILAI Atelier Patron Status
            </h2>
            <p>
              By commissioning custom garments through SILAI, customers are invited into the Atelier Guild.
              Members gain persistent digital fit profiles, priority scheduling during festive seasons, and dedicated master artisan matching.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              2. Fair Artisan Pricing Standard
            </h3>
            <p>
              SILAI upholds fair wages and ethical treatment for independent tailors and karigars.
              All pricing tiers listed by our craftsmen are transparent and respected. Unreasonable exploitation or harassment of craftspeople results in immediate account suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. Measurement Integrity & Fit Guarantee
            </h3>
            <p>
              Members maintain responsibility for providing accurate reference garments or taking recommended measurement checkpoints.
              SILAI guarantees fit adherence against confirmed measurements.
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
