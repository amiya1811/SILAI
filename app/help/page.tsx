import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Scissors, Truck, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Help Center & FAQs | SILAI Bespoke",
  description: "Frequently asked questions and support for SILAI custom tailoring marketplace.",
};

const FAQS = [
  {
    q: "How does doorstep fabric pickup work?",
    a: "After you book a master tailor on SILAI, our delivery partner arrives at your scheduled address in Bengaluru with tamper-evident garment bags. You hand over the unstitched fabric and any optional reference piece. The courier verifies the material and transports it securely to the boutique.",
  },
  {
    q: "What if the stitched outfit doesn't fit me perfectly?",
    a: "Every SILAI commission comes with our 7-Day Fit Guarantee. If the garment requires adjustments, request an alteration from your Orders page. We will pick up the outfit, return it to your tailor for alterations, and deliver it back to your doorstep at no additional charge.",
  },
  {
    q: "Which payment methods are accepted?",
    a: "Currently, SILAI operates exclusively on Cash on Delivery (COD). You inspect the finished garment at your doorstep before handing over cash or paying the delivery partner.",
  },
  {
    q: "Where is SILAI currently available?",
    a: "We currently provide full two-leg doorstep service across the Bengaluru Metropolitan Area, including Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, and Malleshwaram.",
  },
  {
    q: "How do I measure myself if I don't know my sizes?",
    a: "You can either use our Guided Step-by-Step Measurement tool, select 'Duplicate a Reference Garment' so we measure your best-fitting outfit, or choose 'Doorstep Master Tailor Visit' to have an artisan measure you in person.",
  },
];

export default function HelpPage() {
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
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Customer Support
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Help Center & FAQs
            </h1>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link
            href="/explore"
            className="p-5 rounded-2xl bg-[#1A0710]/80 border border-[#F2D9A0]/20 hover:border-[#F2D9A0]/50 transition group"
          >
            <Scissors className="w-6 h-6 text-[#F2D9A0] mb-3 group-hover:scale-110 transition" />
            <h2 className="font-serif text-base font-bold text-[#F2D9A0] mb-1">
              Find Master Tailors
            </h2>
            <p className="text-xs text-[#F2E5C6]/70">
              Browse ateliers by embroidery specialty and reviews.
            </p>
          </Link>

          <Link
            href="/orders"
            className="p-5 rounded-2xl bg-[#1A0710]/80 border border-[#F2D9A0]/20 hover:border-[#F2D9A0]/50 transition group"
          >
            <Truck className="w-6 h-6 text-[#F2D9A0] mb-3 group-hover:scale-110 transition" />
            <h2 className="font-serif text-base font-bold text-[#F2D9A0] mb-1">
              Track Active Orders
            </h2>
            <p className="text-xs text-[#F2E5C6]/70">
              Live status from fabric pickup to doorstep delivery.
            </p>
          </Link>

          <Link
            href="/contact"
            className="p-5 rounded-2xl bg-[#1A0710]/80 border border-[#F2D9A0]/20 hover:border-[#F2D9A0]/50 transition group"
          >
            <ShieldCheck className="w-6 h-6 text-[#F2D9A0] mb-3 group-hover:scale-110 transition" />
            <h2 className="font-serif text-base font-bold text-[#F2D9A0] mb-1">
              Concierge Support
            </h2>
            <p className="text-xs text-[#F2E5C6]/70">
              Reach our dedicated customer care team in Bengaluru.
            </p>
          </Link>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#F2D9A0] mb-4">
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#16050C]/70 border border-[#F2D9A0]/15 space-y-2"
            >
              <h3 className="font-serif text-base font-semibold text-[#F2D9A0]">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
