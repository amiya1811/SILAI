"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Role } from "@/lib/types";
import { Scissors, ShoppingBag, Truck, ArrowRight, X } from "lucide-react";
import UnifiedRoleAuthModal from "./UnifiedRoleAuthModal";

interface RoleOption {
  role: Role;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  destination: string;
  demoEmail: string;
}

const ROLES: RoleOption[] = [
  {
    role: "CUSTOMER",
    title: "CUSTOMER",
    badge: "For Patrons",
    tagline: "Custom Made. Delivered Home.",
    description: "Find the right tailor. Get it stitched and delivered.",
    icon: ShoppingBag,
    destination: "/dashboard",
    demoEmail: "priya@example.com",
  },
  {
    role: "TAILOR",
    title: "TAILOR",
    badge: "For Boutiques & Karigars",
    tagline: "Your Craft. Your Prices.",
    description: "Showcase your work. Manage orders. Grow your business.",
    icon: Scissors,
    destination: "/tailor-studio",
    demoEmail: "meera@example.com",
  },
  {
    role: "DELIVERY_PARTNER",
    title: "DELIVERY AGENT",
    badge: "For Fleet Partners",
    tagline: "Doorstep Transit Network.",
    description: "Pick up. Deliver. Earn.",
    icon: Truck,
    destination: "/delivery-partner",
    demoEmail: "rahul@example.com",
  },
];

export default function FirstScreenRoleSelector({
  forceOpen = false,
  onClose,
}: {
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const { user, switchDemoRole } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [forceOpen]);

  const handleSelectRole = (option: RoleOption) => {
    setSelectedRole(option.role);
    setIsOpen(false);
    if (onClose) onClose();
    if (user && user.role === option.role) {
      router.push(option.destination);
    } else {
      setIsAuthOpen(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="relative w-full max-w-4xl rounded-3xl bg-gradient-to-b from-maroon/95 via-wine-dark to-[#200005] border-2 border-sand/30 shadow-2xl p-6 sm:p-10 text-champagne overflow-hidden">
          {/* Subtle atmospheric gold glows */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-sand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-burgundy/40 rounded-full blur-3xl pointer-events-none" />

          {/* Close button if user wants to browse as guest */}
          <button
            onClick={() => {
              setIsOpen(false);
              sessionStorage.setItem("silai_role_selected", "browsing");
              if (onClose) onClose();
            }}
            className="absolute top-5 right-5 p-2 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
            title="Browse Website"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/80 border border-sand/40 text-sand text-[11px] font-mono tracking-[0.25em] uppercase">
              SELECT YOUR EXPERIENCE
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sand-light">
              Welcome to SILAI
            </h2>
            <p className="text-xs sm:text-sm text-champagne/75 leading-relaxed">
              How would you like to use SILAI today? Choose your role to enter the tailored portal.
            </p>
          </div>

          {/* 3 Role Options (Requirement: MODIFICATION 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.role}
                  onClick={() => handleSelectRole(opt)}
                  className="group relative rounded-2xl bg-gradient-to-b from-wine/70 to-wine-dark/90 border border-sand/25 p-6 hover:border-sand/70 hover:shadow-card-luxury hover:scale-[1.03] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-burgundy/70 border border-sand/40 flex items-center justify-center text-sand group-hover:scale-110 group-hover:shadow-gold-glow transition">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sand/10 text-sand border border-sand/20">
                        {opt.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-sand-light group-hover:text-sand transition">
                        {opt.title}
                      </h3>
                      <p className="text-[11px] font-mono text-sand/70 mt-0.5">
                        {opt.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-champagne/80 leading-relaxed min-h-[36px]">
                      "{opt.description}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sand/15 flex items-center justify-between text-xs font-semibold text-sand group-hover:text-sand-light transition">
                    <span>Enter as {opt.title}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-sand/15 text-center text-[11px] text-champagne/60 font-mono">
            SILAI Bespoke Platform • 100% Fit Guarantee
          </div>
        </div>
      </div>

      {isAuthOpen && selectedRole && (
        <UnifiedRoleAuthModal
          isOpen={isAuthOpen}
          targetRole={selectedRole === "ADMIN" ? "CUSTOMER" : selectedRole}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </>
  );
}
