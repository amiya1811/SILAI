"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Scissors,
  Sparkles,
  ShoppingBag,
  Ruler,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Truck,
  Layers,
  Store,
  ShieldCheck,
} from "lucide-react";
import UnifiedRoleAuthModal from "@/components/auth/UnifiedRoleAuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<"CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER" | null>(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Tailors", href: "/explore" },
    { label: "Virtual Try-On", href: "/try-on", badge: "New" },
    { label: "Orders", href: "/orders" },
    { label: "Fit Profile", href: "/fit-profile" },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Main Luxury Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-wine/85 border-b border-sand/15 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with official visual identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-14 overflow-hidden rounded-md border border-sand/40 shadow-gold-glow group-hover:scale-105 transition-transform duration-300 bg-champagne">
              <Image
                src="/silai-logo.jpeg"
                alt="SILAI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-widest text-sand-light uppercase group-hover:text-sand transition-colors">
                SILAI
              </span>
              <span className="text-[10px] tracking-[0.22em] text-champagne/80 uppercase font-sans">
                Custom Made. Delivered Home.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all relative py-1 ${
                    isActive
                      ? "text-sand font-medium"
                      : "text-champagne/80 hover:text-sand-light"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-burgundy text-sand-light rounded-full border border-sand/30">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sand to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Account & Actions (Role Locked) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dedicated Role Link based on logged-in account */}
            {user?.role === "TAILOR" && (
              <Link
                href="/tailor-studio"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide bg-burgundy/80 text-sand border border-sand/40 hover:bg-burgundy transition flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-sand" /> Tailor Studio
              </Link>
            )}

            {user?.role === "DELIVERY_PARTNER" && (
              <Link
                href="/delivery-partner"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide bg-maroon/80 text-sand border border-sand/40 hover:bg-burgundy transition flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-sand" /> Delivery Hub
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-wine-light/50 border border-sand/30 hover:border-sand/60 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-burgundy border border-sand/40 overflow-hidden flex items-center justify-center text-xs font-serif text-sand font-bold">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-champagne font-medium max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-sand/70" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-gradient-to-b from-maroon to-wine-dark border border-sand/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-sand/15">
                      <p className="text-xs font-semibold text-sand">{user.fullName}</p>
                      <p className="text-[11px] text-champagne/60 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-burgundy text-sand border border-sand/30">
                        {user.role.replace("_", " ")}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === "CUSTOMER" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-champagne hover:text-sand hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <Layers className="w-4 h-4 text-sand" /> Customer Dashboard
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-champagne hover:text-sand hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-sand" /> My Orders & Stitching
                          </Link>
                          <Link
                            href="/fit-profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-champagne hover:text-sand hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <Ruler className="w-4 h-4 text-sand" /> Fit Profile & Measurements
                          </Link>
                        </>
                      )}

                      {user.role === "TAILOR" && (
                        <Link
                          href="/tailor-studio"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-champagne hover:text-sand hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Store className="w-4 h-4 text-sand" /> Tailor Studio & Menu
                        </Link>
                      )}

                      {user.role === "DELIVERY_PARTNER" && (
                        <Link
                          href="/delivery-partner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-champagne hover:text-sand hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Truck className="w-4 h-4 text-sand" /> Delivery Hub & Jobs
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-sand/15">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAuthModalRole("CUSTOMER")}
                  className="px-4 py-2 text-xs tracking-wider text-sand hover:text-champagne transition"
                >
                  Log In
                </button>
                <a
                  href="/#get-started"
                  className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider bg-gradient-to-r from-burgundy to-maroon text-sand-light border border-sand/40 hover:shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-sand hover:bg-burgundy/30 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-wine-dark/95 border-b border-sand/20 px-6 py-6 space-y-4 backdrop-blur-xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-champagne hover:text-sand transition py-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-sand/15 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 pb-2">
                    <span className="text-xs font-bold text-sand">{user.fullName}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sand/10 text-sand">
                      {user.role}
                    </span>
                  </div>
                  {user.role === "CUSTOMER" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne py-1"
                    >
                      Customer Dashboard
                    </Link>
                  )}
                  {user.role === "TAILOR" && (
                    <Link
                      href="/tailor-studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne py-1"
                    >
                      Tailor Studio
                    </Link>
                  )}
                  {user.role === "DELIVERY_PARTNER" && (
                    <Link
                      href="/delivery-partner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne py-1"
                    >
                      Delivery Hub
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-xs text-rose-300 py-1"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalRole("CUSTOMER");
                    }}
                    className="flex-1 py-2 rounded-xl text-xs text-sand bg-wine border border-sand/30"
                  >
                    Sign In
                  </button>
                  <a
                    href="/#get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl text-xs bg-burgundy text-sand-light font-bold"
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Unified Role Auth Modal */}
      {authModalRole && (
        <UnifiedRoleAuthModal
          isOpen={!!authModalRole}
          targetRole={authModalRole}
          onClose={() => setAuthModalRole(null)}
        />
      )}
    </>
  );
}
