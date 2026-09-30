import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, Sparkles, Award, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-wine-dark border-t border-sand/20 text-champagne pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-sand/15">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                100% Fit Guarantee
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                If the stitching does not match your measurements, we alter it for free.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                Doorstep Pickup & Drop
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                We pick up your raw fabric and sample garment right from your doorstep.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                Verified Master Tailors
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                Every boutique and home-based karigar is manually vetted for craftsmanship.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-burgundy/40 border border-sand/30 text-sand">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-sand-light">
                Transparent Pricing
              </h4>
              <p className="text-xs text-champagne/70 mt-1 leading-relaxed">
                Every tailor sets their own rates. Compare digital menus before booking.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-sand/15">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-12 rounded border border-sand/40 bg-champagne overflow-hidden">
                <Image src="/silai-logo.jpeg" alt="SILAI" fill className="object-cover" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-widest text-sand-light uppercase">
                  SILAI
                </span>
                <p className="text-[10px] tracking-[0.2em] text-champagne/80 uppercase">
                  Custom Made. Delivered Home.
                </p>
              </div>
            </div>
            <p className="text-xs text-champagne/75 leading-relaxed max-w-sm">
              The premier bespoke tailoring marketplace connecting discerning customers with certified
              master tailors, independent karigars, and boutique ateliers across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-sand/80 pt-2">
              <Globe className="w-4 h-4 text-sand" />
              <span>Available Languages: English, हिन्दी, বাংলা, தமிழ், मराठी</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              Explore Tailoring
            </h5>
            <ul className="space-y-2 text-xs text-champagne/75">
              <li><Link href="/explore?category=BLOUSE" className="hover:text-sand transition">Saree Blouses</Link></li>
              <li><Link href="/explore?category=KURTI" className="hover:text-sand transition">Kurtis & Tunics</Link></li>
              <li><Link href="/explore?category=SUIT" className="hover:text-sand transition">Salwar Suits & Anarkalis</Link></li>
              <li><Link href="/explore?category=LEHENGA" className="hover:text-sand transition">Bridal Lehengas</Link></li>
              <li><Link href="/explore?category=SHIRT" className="hover:text-sand transition">Bespoke Men's Shirts</Link></li>
              <li><Link href="/explore?category=ALTERATIONS" className="hover:text-sand transition">Alterations & Resizing</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              For Partners
            </h5>
            <ul className="space-y-2 text-xs text-champagne/75">
              <li><Link href="/tailor-studio" className="hover:text-sand transition">Tailor Partner Studio</Link></li>
              <li><Link href="/delivery-partner" className="hover:text-sand transition">Delivery Fleet Hub</Link></li>
              <li><Link href="/admin" className="hover:text-sand transition">Platform Governance</Link></li>
              <li><span className="text-champagne/50">Tailor Standards & Quality</span></li>
              <li><span className="text-champagne/50">Payout Protection</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold tracking-widest uppercase text-sand mb-4">
              Active Cities
            </h5>
            <ul className="space-y-2 text-xs text-champagne/75">
              <li>Delhi NCR (South Ex, GK, CP)</li>
              <li>Mumbai (Bandra, Juhu, Colaba)</li>
              <li>Bengaluru (Indiranagar, Koramangala)</li>
              <li>Jaipur (Johari & Bapu Bazaar)</li>
              <li>Kolkata (Gariahat, Salt Lake)</li>
              <li>Lucknow (Hazratganj, Chowk)</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-champagne/60 gap-4">
          <p>© {new Date().getFullYear()} SILAI Marketplace Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-sand cursor-pointer">Privacy Policy</span>
            <span className="hover:text-sand cursor-pointer">Terms of Service</span>
            <span className="hover:text-sand cursor-pointer">100% Fit Guarantee Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
