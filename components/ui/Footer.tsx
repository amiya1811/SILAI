"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, Sparkles, Award, ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#3B010B] dark:bg-[#080608] border-t border-sand/20 dark:border-burgundy/30 text-champagne pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-sand/15">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                {t("footer.pillar1Title", "100% Fit Guarantee")}
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                {t("footer.pillar1Desc", "If the stitching does not match your measurements, we alter it for free within 7 days.")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                {t("footer.pillar2Title", "Two-Leg Doorstep Logistics")}
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                {t("footer.pillar2Desc", "Doorstep fabric pickup, secure transport to master atelier, and hanger-packed return drop.")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                {t("footer.pillar3Title", "Verified Master Tailors")}
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                {t("footer.pillar3Desc", "Every boutique and home-based karigar is manually vetted for seam density and finish.")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                {t("footer.pillar4Title", "Dispute-Proof 4-Moment Audit")}
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                {t("footer.pillar4Desc", "Photographic verification at pickup, atelier handover, and completion with 4-digit OTP.")}
              </p>
            </div>
          </div>
        </div>

        {/* Structured Multi-Column Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12 border-b border-sand/15">
          {/* Column 1: Discover */}
          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              {t("common.discover", "Discover")}
            </h5>
            <ul className="space-y-2.5 text-xs text-champagne/75">
              <li>
                <Link href="/about" className="hover:text-sand transition">
                  {t("footer.aboutUs", "About SILAI")}
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-sand transition">
                  {t("footer.exploreTailors", "Explore Master Tailors")}
                </Link>
              </li>
              <li>
                <Link href="/try-on" className="hover:text-sand transition">
                  {t("footer.virtualTryOn", "Virtual 3D Try-On")}
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-sand transition">
                  {t("footer.credits", "Atelier Credits & Offers")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-sand transition">
                  {t("footer.careers", "Careers at SILAI")}
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-sand transition">
                  {t("footer.accessibility", "Accessibility Statement")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customers */}
          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              {t("status.CUSTOMER", "Customers")}
            </h5>
            <ul className="space-y-2.5 text-xs text-champagne/75">
              <li>
                <Link href="/customer-guidelines" className="hover:text-sand transition">
                  {t("footer.customerGuidelines", "Customer Guidelines")}
                </Link>
              </li>
              <li>
                <Link href="/fit-profile" className="hover:text-sand transition">
                  {t("measurements.fitProfileTitle", "Fit Profile & Sizing")}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-sand transition">
                  {t("tracking.title", "Doorstep Order Tracking")}
                </Link>
              </li>
              <li>
                <Link href="/about#guarantee" className="hover:text-sand transition">
                  {t("footer.pillar1Title", "100% Fit Guarantee")}
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="hover:text-sand transition">
                  {t("footer.twoLegPolicy", "Two-Leg Delivery Policy")}
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-sand transition">
                  {t("footer.refunds", "Refund & Alteration Policy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tailors & Ateliers */}
          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              {t("status.TAILOR", "Tailors & Ateliers")}
            </h5>
            <ul className="space-y-2.5 text-xs text-champagne/75">
              <li>
                <Link
                  href="/tailor-studio"
                  className="hover:text-sand transition flex items-center gap-1.5"
                >
                  <span>{t("footer.joinAsTailor", "Join as Master Tailor")}</span>
                  <ExternalLink className="w-3 h-3 text-sand/70" />
                </Link>
              </li>
              <li>
                <Link href="/tailor-guidelines" className="hover:text-sand transition">
                  {t("footer.tailorGuidelines", "Tailor Atelier Guidelines")}
                </Link>
              </li>
              <li>
                <Link href="/membership-terms" className="hover:text-sand transition">
                  {t("footer.membershipTerms", "Atelier Membership Terms")}
                </Link>
              </li>
              <li>
                <Link href="/partner-with-us" className="hover:text-sand transition">
                  {t("footer.boutiquePartnerships", "Boutique Partnerships")}
                </Link>
              </li>
              <li>
                <Link href="/safety-quality" className="hover:text-sand transition">
                  {t("footer.safety", "Craftsmanship Standards")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Delivery Fleet */}
          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              {t("delivery.fleetPortal", "Delivery Fleet")}
            </h5>
            <ul className="space-y-2.5 text-xs text-champagne/75">
              <li>
                <Link
                  href="/delivery-partner"
                  className="hover:text-sand transition flex items-center gap-1.5"
                >
                  <span>{t("footer.deliverWithUs", "Deliver with SILAI Fleet")}</span>
                  <ExternalLink className="w-3 h-3 text-sand/70" />
                </Link>
              </li>
              <li>
                <Link href="/delivery-partner-guidelines" className="hover:text-sand transition">
                  {t("footer.deliveryGuidelines", "Fleet Courier Guidelines")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-sand transition">
                  {t("footer.securityEscrow", "Security & Escrow")}
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-[10px] font-mono uppercase text-sand tracking-wider block mb-1 font-bold">
                  {t("footer.activeHubs", "Active Delivery Hubs")}
                </span>
                <span className="text-[11px] text-champagne/70 block leading-relaxed">
                  Electronic City, Dodda Thogur, Indiranagar, Koramangala, HSR Layout, Whitefield
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Support Desk */}
          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              {t("footer.legalSupport", "Legal & Support")}
            </h5>
            <ul className="space-y-2.5 text-xs text-champagne/75">
              <li>
                <Link href="/terms-of-use" className="hover:text-sand transition">
                  {t("footer.terms", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-sand transition">
                  {t("footer.privacy", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-sand transition">
                  {t("footer.cookiePolicy", "Cookie Policy")}
                </Link>
              </li>
              <li>
                <Link href="/responsible-disclosure" className="hover:text-sand transition">
                  {t("footer.responsibleDisclosure", "Responsible Disclosure")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-sand transition">
                  {t("footer.helpCenter", "Help Center & FAQs")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sand transition">
                  {t("footer.contactUs", "Contact Concierge Desk")}
                </Link>
              </li>
              <li>
                <Link href="/report-issue" className="hover:text-sand transition">
                  {t("footer.reportIssue", "Report an Issue")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Concierge Desk Snapshot Bar */}
        <div className="py-6 border-b border-sand/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-champagne/80 font-mono">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sand" />
              <span>{t("footer.headquarters", "Headquarters: Electronic City Phase 1, Bengaluru 560100")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sand" />
              <a href="tel:+919019715087" className="hover:text-sand transition">
                +91 90197 15087
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sand" />
              <a href="mailto:concierge@silai.fit" className="hover:text-sand transition">
                concierge@silai.fit
              </a>
            </div>
          </div>
          <div className="text-[11px] text-sand/80">
            {t("footer.hours", "Concierge Desk: 9:00 AM – 9:00 PM IST (Mon–Sat)")}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-champagne/60 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded border border-sand/40 bg-champagne overflow-hidden">
              <Image src="/silai-logo.jpeg" alt="SILAI" fill className="object-cover" />
            </div>
            <div>
              <p>© {new Date().getFullYear()} {t("footer.copyright", "SILAI Marketplace Technologies Pvt. Ltd. All rights reserved.")}</p>
              <p className="text-[10px] text-champagne/50">{t("footer.tagline", "Custom Made. Delivered Home. · Bengaluru Metro Hub")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <Link href="/privacy-policy" className="hover:text-sand transition">
              {t("footer.privacy", "Privacy Policy")}
            </Link>
            <Link href="/terms-of-use" className="hover:text-sand transition">
              {t("footer.terms", "Terms of Use")}
            </Link>
            <Link href="/delivery-policy" className="hover:text-sand transition">
              {t("footer.twoLegPolicy", "Delivery Policy")}
            </Link>
            <Link href="/safety-quality" className="hover:text-sand transition">
              {t("footer.safety", "Safety & Standards")}
            </Link>
            <Link href="/contact" className="hover:text-sand transition">
              {t("footer.contactUs", "Contact Desk")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
