import React from "react";
import Link from "next/link";
import { Cookie, ArrowLeft, Shield, Info } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | SILAI Bespoke",
  description: "Cookie and tracking technology practices of the SILAI marketplace.",
};

export default function CookiePolicyPage() {
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
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Legal & Transparency
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Cookie Policy
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F2D9A0]" />
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small data fragments stored securely on your browser when you interact with SILAI.
              They enable our system to remember your session authentication, language preference, and bespoke cart selections
              without compromising your privacy.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              2. Essential Cookies
            </h3>
            <p>
              These cookies are mandatory for the application to function securely:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/70">
              <li><strong>Authentication Tokens (HTTP-Only):</strong> Maintains your authenticated user session with high security.</li>
              <li><strong>Security & CSRF Protection:</strong> Guard against cross-site scripting and unauthorized state mutations.</li>
              <li><strong>Theme & Language Preferences:</strong> Remembers your chosen vernacular language and dark/light presentation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. Analytics & Operational Cookies
            </h3>
            <p>
              We measure interface performance to enhance pickup routing, tailor discovery, and page loading speed.
              We do not use invasive tracking pixels or cross-site commercial ad network beacons.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              4. Managing Your Cookie Settings
            </h3>
            <p>
              You may manage or disable cookies via your browser settings at any time. Note that disabling essential session cookies
              will prevent logging in to your customer atelier or tailor studio.
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
