import React from "react";
import Link from "next/link";
import { Briefcase, ArrowLeft, Send, Sparkles, MapPin } from "lucide-react";

export const metadata = {
  title: "Careers | SILAI Bespoke",
  description: "Join the team modernizing custom tailoring and bespoke fashion across India.",
};

export default function CareersPage() {
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
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Join Our Atelier
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Careers at SILAI
            </h1>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
              Reimagining Bespoke Fashion Craftsmanship
            </h2>
            <p className="text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed">
              We are a passionate team of fashion curators, software engineers, operations specialists, and logistics experts headquartered in Bengaluru. We are building technology that honors artisanal heritage while delighting modern patrons.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#F2D9A0]">
              Open Opportunities
            </h3>

            <div className="p-5 rounded-xl bg-[#16050C]/80 border border-[#F2D9A0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F2D9A0] block">OPERATIONS</span>
                <h4 className="font-serif text-base font-bold text-[#F2E5C6]">Atelier Quality Lead</h4>
                <div className="flex items-center gap-3 text-xs text-[#F2E5C6]/60 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Bengaluru (Electronic City / Indiranagar)</span>
                  <span>• Full-Time</span>
                </div>
              </div>
              <a
                href="mailto:careers@silai.co?subject=Application:%20Atelier%20Quality%20Lead"
                className="px-4 py-2 rounded-xl bg-[#560B18] border border-[#F2D9A0]/30 text-xs font-semibold text-[#F2D9A0] hover:bg-[#720e20] transition text-center"
              >
                Apply via Email
              </a>
            </div>

            <div className="p-5 rounded-xl bg-[#16050C]/80 border border-[#F2D9A0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F2D9A0] block">LOGISTICS</span>
                <h4 className="font-serif text-base font-bold text-[#F2E5C6]">City Logistics Dispatch Manager</h4>
                <div className="flex items-center gap-3 text-xs text-[#F2E5C6]/60 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Bengaluru Metro</span>
                  <span>• Full-Time</span>
                </div>
              </div>
              <a
                href="mailto:careers@silai.co?subject=Application:%20City%20Logistics%20Dispatch%20Manager"
                className="px-4 py-2 rounded-xl bg-[#560B18] border border-[#F2D9A0]/30 text-xs font-semibold text-[#F2D9A0] hover:bg-[#720e20] transition text-center"
              >
                Apply via Email
              </a>
            </div>

            <div className="p-5 rounded-xl bg-[#16050C]/80 border border-[#F2D9A0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F2D9A0] block">ENGINEERING</span>
                <h4 className="font-serif text-base font-bold text-[#F2E5C6]">Full Stack Engineer (Next.js / TypeScript)</h4>
                <div className="flex items-center gap-3 text-xs text-[#F2E5C6]/60 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Bengaluru / Hybrid</span>
                  <span>• Full-Time</span>
                </div>
              </div>
              <a
                href="mailto:careers@silai.co?subject=Application:%20Full%20Stack%20Engineer"
                className="px-4 py-2 rounded-xl bg-[#560B18] border border-[#F2D9A0]/30 text-xs font-semibold text-[#F2D9A0] hover:bg-[#720e20] transition text-center"
              >
                Apply via Email
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#560B18]/30 border border-[#F2D9A0]/20 text-center space-y-2">
            <h4 className="font-serif text-base font-bold text-[#F2D9A0]">Don't see your exact role?</h4>
            <p className="text-xs text-[#F2E5C6]/75">
              Send your portfolio or resume to <a href="mailto:careers@silai.co" className="text-[#F2D9A0] underline">careers@silai.co</a>. We are always seeking passionate individuals.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
