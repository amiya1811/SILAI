import React from "react";
import Link from "next/link";
import { Eye, ArrowLeft, Globe, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Accessibility Statement | SILAI Bespoke",
  description: "Accessibility standards and multilingual support on SILAI.",
};

export default function AccessibilityPage() {
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
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Inclusion & Standards
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Accessibility Statement
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
              1. Our Commitment to Universal Access
            </h2>
            <p>
              SILAI is dedicated to ensuring that bespoke fashion and tailoring services are accessible to everyone,
              regardless of ability, device, or linguistic background. We aim to conform with the Web Content Accessibility
              Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#F2D9A0]" />
              2. Multilingual Vernacular Support
            </h3>
            <p>
              To honor India's rich cultural diversity and empower master tailors and patrons alike, SILAI provides
              support across 12 Indian languages: English, Hindi, Kannada, Tamil, Telugu, Malayalam, Odia, Bengali,
              Gujarati, Marathi, Punjabi, and Assamese.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. Interface Features & Assistive Compatibility
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-[#F2E5C6]/70">
              <li>High-contrast palette designed for readability across luxury deep tones.</li>
              <li>Semantic HTML5 elements and ARIA roles for screen readers.</li>
              <li>Full keyboard navigation support across dialogs, language selectors, and checkout forms.</li>
              <li>Responsive zoom support up to 200% without loss of content integrity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              4. Accessibility Feedback
            </h3>
            <p>
              If you experience any accessibility barriers while navigating SILAI, please email our team at{" "}
              <a href="mailto:accessibility@silai.co" className="text-[#F2D9A0] underline">accessibility@silai.co</a>.
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
