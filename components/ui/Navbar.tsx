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
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<"CUSTOMER" | "TAILOR" | "DELIVERY_PARTNER" | null>(null);

  const navLinks = [
    { label: t("home", "Home"), href: "/" },
    { label: t("exploreTailors", "Explore Tailors"), href: "/explore" },
    { label: t("virtualTryOn", "Virtual Try-On"), href: "/try-on", badge: "New" },
    { label: t("orders", "Orders"), href: "/orders" },
    { label: t("fitProfile", "Fit Profile"), href: "/fit-profile" },
    { label: t("account", "Account"), href: "/dashboard", mobileOnly: true },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Main Luxury Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#3B010B] dark:bg-[#080608] border-b border-sand/20 dark:border-burgundy/30 transition-all duration-300 shadow-md">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 lg:gap-4">
          {/* Logo with official visual identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative w-9 sm:w-10 h-11 sm:h-13 overflow-hidden rounded-md border border-sand/40 shadow-gold-glow group-hover:scale-105 transition-transform duration-300 bg-champagne flex-shrink-0">
              <Image
                src="/silai-logo.jpeg"
                alt="SILAI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl xl:text-2xl font-bold tracking-widest text-champagne-light uppercase group-hover:text-sand transition-colors whitespace-nowrap">
                SILAI
              </span>
              <span className="text-[8px] sm:text-[9px] xl:text-[10px] tracking-[0.16em] sm:tracking-[0.2em] text-sand font-semibold uppercase font-sans hidden sm:block whitespace-nowrap">
                Custom Made. Delivered Home.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-3.5 2xl:gap-5 flex-1 min-w-0 px-1 xl:px-3">
            {navLinks
              .filter((link) => !link.mobileOnly)
              .map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs xl:text-[13px] 2xl:text-sm tracking-wide transition-all relative py-1 px-1.5 xl:px-2 rounded-lg whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? "text-sand-light font-bold"
                        : "text-champagne hover:text-sand hover:bg-white/5 font-medium"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="hidden xl:inline-block ml-1.5 px-1.5 py-0.5 text-[9px] uppercase font-semibold bg-burgundy text-champagne-light rounded-full border border-sand/30">
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
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {/* Dedicated Role Link based on logged-in account */}
            {user?.role === "TAILOR" && (
              <Link
                href="/tailor-studio"
                className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-burgundy text-champagne border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                <Scissors className="w-3.5 h-3.5 text-sand" /> <span className="hidden xl:inline">{t("nav.tailorStudio", "Tailor Studio")}</span>
              </Link>
            )}

            {user?.role === "DELIVERY_PARTNER" && (
              <Link
                href="/delivery-partner"
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-maroon text-sand-light border border-sand/40 hover:bg-burgundy transition flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <Truck className="w-3.5 h-3.5 text-sand" /> <span className="hidden xl:inline">{t("nav.deliveryHub", "Delivery Hub")}</span>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-burgundy text-sand-light border border-sand/40 hover:bg-maroon transition flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sand" /> <span className="hidden xl:inline">{t("nav.adminConsole", "Admin Console")}</span>
              </Link>
            )}

            {user ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 xl:px-3 py-1.5 rounded-full bg-burgundy/60 dark:bg-dark-surface border border-sand/40 hover:border-sand transition"
                >
                  <div className="w-7 h-7 rounded-full bg-burgundy border border-sand/40 overflow-hidden flex items-center justify-center text-xs font-serif text-sand font-bold flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                    ) : (
                      (user.fullName || "U").charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-sand-light font-semibold max-w-[90px] xl:max-w-[120px] truncate">
                    {user.fullName || t("nav.account", "Account")}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-sand flex-shrink-0" />
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
                            <Layers className="w-4 h-4 text-burgundy dark:text-sand" /> {t("nav.customerDashboard", "Customer Dashboard")}
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <ShoppingBag className="w-4 h-4 text-burgundy dark:text-sand" /> {t("nav.myOrders", "My Orders & Stitching")}
                          </Link>
                          <Link
                            href="/fit-profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                          >
                            <Ruler className="w-4 h-4 text-burgundy dark:text-sand" /> {t("measurements.fitProfileTitle", "Fit Profile & Measurements")}
                          </Link>
                        </>
                      )}

                      {user.role === "TAILOR" && (
                        <Link
                          href="/tailor-studio"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Store className="w-4 h-4 text-burgundy dark:text-sand" /> {t("tailor.studioTitle", "Tailor Studio & Menu")}
                        </Link>
                      )}

                      {user.role === "DELIVERY_PARTNER" && (
                        <Link
                          href="/delivery-partner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <Truck className="w-4 h-4 text-burgundy dark:text-sand" /> {t("delivery.fleetPortal", "Delivery Hub & Jobs")}
                        </Link>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-wine dark:text-champagne hover:text-burgundy dark:hover:text-sand-light hover:bg-sand/30 dark:hover:bg-burgundy/40 rounded-xl transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-burgundy dark:text-sand" /> {t("nav.adminConsole", "Admin Console")}
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-burgundy/20 dark:border-burgundy/40">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-800 dark:text-rose-300 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-700 dark:text-rose-400" /> {t("nav.signOut", "Sign Out")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2.5 flex-shrink-0">
                <button
                  onClick={() => setAuthModalRole("CUSTOMER")}
                  className="px-2 xl:px-3 py-1.5 text-xs tracking-wider text-champagne/90 hover:text-sand font-medium transition whitespace-nowrap"
                >
                  {t("nav.login", "Log In")}
                </button>
                <a
                  href="/#get-started"
                  className="px-3 xl:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-gradient-to-r from-burgundy via-maroon to-burgundy text-sand-light border border-sand/40 shadow-card-luxury hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  {t("nav.getStarted", "Get Started")}
                </a>
              </div>
            )}

            {/* Language Selector & Theme Toggle (Always securely anchored) */}
            <div className="flex items-center gap-1 xl:gap-1.5 flex-shrink-0 pl-1.5 xl:pl-2 border-l border-sand/20">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile header controls */}
          <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0">
            <LanguageSelector />
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
          <div className="lg:hidden bg-[#3B010B] dark:bg-[#080608] border-b border-sand/20 dark:border-burgundy/30 px-6 py-5 space-y-4 text-champagne shadow-xl">
            {/* Dedicated Quick Language Selector Row in Drawer */}
            <div className="pb-3 border-b border-sand/20 dark:border-burgundy/30 flex items-center justify-between">
              <span className="text-xs font-semibold text-sand font-mono uppercase tracking-wider">
                {t("nav.selectLanguage", "Select Language")}
              </span>
              <LanguageSelector />
            </div>

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
                      {t("nav.customerDashboard", "Customer Dashboard")}
                    </Link>
                  )}
                  {user.role === "TAILOR" && (
                    <Link
                      href="/tailor-studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne/80 hover:text-sand py-1"
                    >
                      {t("nav.tailorStudio", "Tailor Studio")}
                    </Link>
                  )}
                  {user.role === "DELIVERY_PARTNER" && (
                    <Link
                      href="/delivery-partner"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-champagne/80 hover:text-sand py-1"
                    >
                      {t("nav.deliveryHub", "Delivery Hub")}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-xs text-rose-400 py-1"
                  >
                    {t("nav.signOut", "Sign Out")}
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
                    {t("nav.login", "Sign In")}
                  </button>
                  <a
                    href="/#get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl text-xs bg-gradient-to-r from-burgundy to-maroon text-sand-light font-bold border border-sand/40"
                  >
                    {t("nav.getStarted", "Get Started")}
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
