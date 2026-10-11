import React from "react";
import Link from "next/link";
import { Handshake, ArrowLeft, Store, Scissors, Truck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Partner With Us | SILAI Bespoke",
  description: "Partnership opportunities for boutique studios, fabric houses, and master artisans.",
};

export default function PartnerWithUsPage() {
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
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Commercial Collaborations
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Partner With SILAI
            </h1>
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <p className="text-base text-[#F2E5C6]">
            Whether you operate an established boutique atelier, an independent tailoring studio, a handloom fabric house, or a delivery logistics fleet, SILAI provides the digital infrastructure to scale your craftsmanship.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <Scissors className="w-6 h-6 text-[#F2D9A0]" />
                <h3 className="font-serif text-base font-bold text-[#F2D9A0]">Master Tailors</h3>
                <p className="text-xs text-[#F2E5C6]/70">
                  Expand your client base across Bengaluru without paying rent for retail high-street storefronts.
                </p>
              </div>
              <Link
                href="/tailor-studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F2D9A0] hover:underline pt-2"
              >
                <span>Join Tailor Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <Store className="w-6 h-6 text-[#F2D9A0]" />
                <h3 className="font-serif text-base font-bold text-[#F2D9A0]">Boutiques & Fabric Mills</h3>
                <p className="text-xs text-[#F2E5C6]/70">
                  List curated textiles and ready reference cuts for bespoke orders directly in the SILAI catalog.
                </p>
              </div>
              <a
                href="mailto:partners@silai.co?subject=Boutique%20Partnership"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F2D9A0] hover:underline pt-2"
              >
                <span>Inquire as Boutique</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <Truck className="w-6 h-6 text-[#F2D9A0]" />
                <h3 className="font-serif text-base font-bold text-[#F2D9A0]">Logistics Fleet</h3>
                <p className="text-xs text-[#F2E5C6]/70">
                  Join our verified two-leg courier fleet with predictable neighborhood routes and guaranteed compensation.
                </p>
              </div>
              <Link
                href="/delivery-partner"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F2D9A0] hover:underline pt-2"
              >
                <span>Deliver With SILAI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#560B18]/30 border border-[#F2D9A0]/20 text-center space-y-2">
            <h4 className="font-serif text-base font-bold text-[#F2D9A0]">Have a Custom Enterprise Partnership Proposal?</h4>
            <p className="text-xs text-[#F2E5C6]/75">
              Contact our alliance desk at <a href="mailto:partners@silai.co" className="text-[#F2D9A0] underline">partners@silai.co</a> or phone <a href="tel:+919019715087" className="text-[#F2D9A0] underline">+91 90197 15087</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
