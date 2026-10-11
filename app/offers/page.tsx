import React from "react";
import Link from "next/link";
import { Tag, ArrowLeft, Sparkles, Gift, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Special Offers & Atelier Credits | SILAI Bespoke",
  description: "Exclusive promotions, first-order atelier benefits, and referral rewards at SILAI.",
};

export default function OffersPage() {
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
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Privileges & Promotions
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Special Offers & Atelier Credits
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#560B18]/60 text-[#F2D9A0] text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CODE: FIRSTFIT200</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
              ₹200 Off Your First Commission
            </h2>
            <p className="text-xs text-[#F2E5C6]/75 leading-relaxed">
              Experience the unmatched luxury of master tailoring. Apply code at checkout on your first stitching order above ₹999.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F2D9A0] hover:underline"
              >
                <span>Find a Master Tailor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#560B18]/60 text-[#F2D9A0] text-xs font-mono">
              <Gift className="w-3.5 h-3.5" />
              <span>COMPLIMENTARY PICKUP</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
              Free Doorstep Pickup Across Bengaluru
            </h2>
            <p className="text-xs text-[#F2E5C6]/75 leading-relaxed">
              Doorstep fabric and sample collection is fully free for all orders placed within our active Bengaluru delivery zones.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#F2D9A0] hover:underline"
              >
                <span>Book Doorstep Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-[#16050C]/80 border border-[#F2D9A0]/15 space-y-3">
          <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
            Terms & Conditions on Offers
          </h3>
          <p className="text-xs text-[#F2E5C6]/70 leading-relaxed">
            Promo codes can be applied during checkout in the Order Summary section. One promo code per commission.
            Discounts do not apply to direct artisan express stitching surcharges.
          </p>
        </div>
      </main>
    </div>
  );
}
