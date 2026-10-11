import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Bug, KeyRound } from "lucide-react";

export const metadata = {
  title: "Responsible Disclosure | SILAI Bespoke",
  description: "Vulnerability coordination and responsible disclosure guidelines for SILAI.",
};

export default function ResponsibleDisclosurePage() {
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
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Information Security
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Responsible Disclosure Policy
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F2D9A0]" />
              Commitment to Platform Integrity
            </h2>
            <p>
              We value the contributions of independent cybersecurity researchers and ethical white-hat developers.
              If you discover a vulnerability within SILAI&apos;s digital infrastructure, APIs, or user authentication flows,
              we appreciate your assistance in disclosing it to us responsibly.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              Guidelines for Responsible Reporting
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/70">
              <li>Do not access, alter, delete, or exfiltrate private customer or tailor data.</li>
              <li>Do not perform Denial of Service (DoS) attacks or disrupt production operations.</li>
              <li>Provide reasonable time (minimum 30 days) for our engineering team to remediate vulnerabilities prior to public disclosure.</li>
              <li>Avoid automated aggressive web scanners that generate abnormal traffic spikes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              Safe Harbor Agreement
            </h3>
            <p>
              If you conduct security research in compliance with these guidelines and act in good faith,
              SILAI will not pursue legal action against you or request law enforcement investigation regarding your research.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              How to Submit Reports
            </h3>
            <p>
              Please direct detailed vulnerability reports including reproduction steps and proof-of-concept payloads to:
            </p>
            <div className="p-4 rounded-xl bg-[#2C0A15]/60 border border-[#F2D9A0]/25 text-xs font-mono text-[#F2D9A0]">
              security@silai.co
            </div>
            <p className="text-[11px] text-[#F2E5C6]/60">
              Our security team will acknowledge receipt of valid submissions within 48 hours.
            </p>
          </section>

          <div className="pt-6 border-t border-[#F2D9A0]/15 text-[11px] font-mono text-[#F2E5C6]/50">
            Version 1.2 · SILAI Security Team · Bengaluru
          </div>
        </div>
      </main>
    </div>
  );
}
