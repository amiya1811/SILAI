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
import ThemeToggle from "@/components/ui/ThemeToggle";

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
      <header className="sticky top-0 z-40 bg-[#3B010B] dark:bg-[#080608] border-b border-sand/20 dark:border-burgundy/30 transition-all duration-300 shadow-md">
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
              <span className="font-serif text-2xl font-bold tracking-widest text-champagne-light uppercase group-hover:text-sand transition-colors">
                SILAI
              </span>
              <span className="text-[10px] tracking-[0.22em] text-sand font-semibold uppercase font-sans">
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
                      ? "text-sand-light font-bold"
                      : "text-champagne hover:text-sand font-medium"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-burgundy text-champagne-light rounded-full border border-sand/30">
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
                className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide bg-burgundy text-champagne border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5 text-sand" /> Tailor Studio
              </Link>
            )}

            {user?.role === "DELIVERY_PARTNER" && (
              <Link
                href="/delivery-partner"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-maroon text-sand-light border border-sand/40 hover:bg-burgundy transition flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5 text-sand" /> Delivery Hub
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-burgundy text-sand-light border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sand" /> Admin Console
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-burgundy/60 dark:bg-dark-surface border border-sand/40 hover:border-sand transition"
                >
                  <div className="w-7 h-7 rounded-full bg-burgundy border border-sand/40 overflow-hidden flex items-center justify-center text-xs font-serif text-sand font-bold">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      (user.fullName || "U").charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-sand-light font-semibold max-w-[120px] truncate">
                    {user.fullName || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-sand" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/30 dark:border-sand/30 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-wine dark:text-champagne">
                    <div className="px-3 py-2 border-b border-burgundy/20 dark:border-burgundy/40">
                      <p className="text-xs font-bold text-deep-wine dark:text-sand-light">{user.fullName || "User"}</p>
                      <p className="text-[11px] text-maroon dark:text-champagne/80 font-medium truncate">{user.email || ""}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-burgundy text-sand-light border border-sand/30 font-semibold">
                        {(user.role || "CUSTOMER").replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === "CUSTOMER" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <Layers className="w-4 h-4 text-burgundy dark:text-sand" /> Customer Dashboard
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-burgundy dark:text-sand" /> My Orders & Stitching
                          </Link>
                          <Link
                            href="/fit-profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <Ruler className="w-4 h-4 text-burgundy dark:text-sand" /> Fit Profile & Measurements
                          </Link>
                        </>
                      )}

                      {user.role === "TAILOR" && (
                        <Link
                          href="/tailor-studio"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Store className="w-4 h-4 text-burgundy dark:text-sand" /> Tailor Studio & Menu
                        </Link>
                      )}

                      {user.role === "DELIVERY_PARTNER" && (
                        <Link
                          href="/delivery-partner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Truck className="w-4 h-4 text-burgundy dark:text-sand" /> Delivery Hub & Jobs
                        </Link>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-burgundy dark:text-sand" /> Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-burgundy/20 dark:border-burgundy/40">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-700 dark:text-rose-400" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAuthModalRole("CUSTOMER")}
                  className="px-4 py-2 text-xs tracking-wider text-champagne/90 hover:text-sand font-medium transition"
                >
                  Log In
                </button>
                <a
                  href="/#get-started"
                  className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider bg-gradient-to-r from-burgundy via-maroon to-burgundy text-sand-light border border-sand/40 shadow-card-luxury hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile header controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-champagne hover:bg-burgundy/25 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#3B010B] dark:bg-[#080608] border-b border-sand/20 dark:border-burgundy/30 px-6 py-6 space-y-4 text-champagne shadow-xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-champagne hover:text-sand-light transition py-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-sand/20 dark:border-burgundy/30 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 pb-2">
                    <span className="text-xs font-bold text-champagne">{user.fullName}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-burgundy text-champagne border border-sand/30">
                      {user.role}
                    </span>
                  </div>
                  {user.role === "CUSTOMER" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne/80 hover:text-sand py-1"
                    >
                      Customer Dashboard
                    </Link>
                  )}
                  {user.role === "TAILOR" && (
                    <Link
                      href="/tailor-studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne/80 hover:text-sand py-1"
                    >
                      Tailor Studio
                    </Link>
                  )}
                  {user.role === "DELIVERY_PARTNER" && (
                    <Link
                      href="/delivery-partner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne/80 hover:text-sand py-1"
                    >
                      Delivery Hub
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-xs text-rose-400 py-1"
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
                    className="flex-1 py-2 rounded-xl text-xs text-champagne bg-burgundy/50 border border-sand/30 font-medium"
                  >
                    Sign In
                  </button>
                  <a
                    href="/#get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl text-xs bg-gradient-to-r from-burgundy to-maroon text-sand-light font-bold border border-sand/40"
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
