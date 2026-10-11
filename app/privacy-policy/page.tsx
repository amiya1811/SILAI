import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SILAI Bespoke",
  description: "Privacy and data protection policy for SILAI custom tailoring marketplace.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Legal & Trust
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Privacy Policy
            </h1>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#F2E5C6]/80 leading-relaxed font-sans">
          <section className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#F2D9A0] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F2D9A0]" />
              1. Our Commitment to Your Privacy
            </h2>
            <p>
              At SILAI, we cherish the bespoke artistry and the intimacy of custom garment creation.
              Protecting your personal data, body measurement profiles, fit preferences, and delivery locations
              is fundamental to our craft. We never sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              2. Information We Collect
            </h3>
            <p>
              When you use SILAI, we collect information necessary to deliver personalized tailoring services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/70">
              <li><strong>Account Credentials:</strong> Full name, email address, contact phone number.</li>
              <li><strong>Fit & Body Profiles:</strong> Body dimensions, posture preferences, reference garment measurements.</li>
              <li><strong>Location Data:</strong> Doorstep pickup and delivery addresses, including precise GPS coordinates in Bengaluru.</li>
              <li><strong>Design References:</strong> Uploaded images, sketches, fabric photographs, and tailoring notes.</li>
              <li><strong>Order History:</strong> Commission details, tailor interactions, alteration requests, and proof-of-delivery timestamps.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              3. How We Use Your Data
            </h3>
            <p>
              Your data is strictly utilized to facilitate your bespoke orders:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#F2E5C6]/70">
              <li>Sharing sizing profiles and design references exclusively with your assigned master tailor.</li>
              <li>Routing our logistics concierge to your pickup and delivery address.</li>
              <li>Transmitting two-factor SMS OTPs for secure doorstep handovers.</li>
              <li>Providing continuous AI virtual try-on previews and fit recommendations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              4. Data Security & Storage
            </h3>
            <p>
              All passwords are encrypted using industry-standard bcrypt hashing. Uploaded media and design files
              are stored in encrypted object storage. Access to internal administrative metrics is restricted
              via strict Role-Based Access Control (RBAC).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#F2D9A0]">
              5. Contact Our Data Protection Officer
            </h3>
            <p>
              For data access requests, deletion, or privacy inquiries, contact our team at{" "}
              <a href="mailto:privacy@silai.co" className="text-[#F2D9A0] underline">privacy@silai.co</a>.
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
