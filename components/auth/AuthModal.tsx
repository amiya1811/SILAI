"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { X, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { Role } from "@/lib/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (tab === "LOGIN") {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Login failed");
        } else {
          onClose();
          if (res.user?.role === "ADMIN") {
            router.push("/admin");
          } else if (res.user?.role === "TAILOR") {
            router.push("/tailor-studio");
          } else if (res.user?.role === "DELIVERY_PARTNER") {
            router.push("/delivery-partner");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        const res = await register({ email, password, fullName, role });
        if (!res.success) {
          setErrorMessage(res.error || "Registration failed");
        } else {
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Silai@2026");
    setTab("LOGIN");
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-maroon/95 to-wine-dark border border-sand/30 shadow-2xl p-6 sm:p-8 text-champagne overflow-hidden">
        {/* Decorative gold ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-sand/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-champagne/60 hover:text-sand hover:bg-wine/40 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono tracking-[0.25em] text-sand uppercase">
            SILAI ACCESS
          </span>
          <h2 className="font-serif text-2xl font-bold text-sand-light mt-1">
            {tab === "LOGIN" ? "Welcome Back" : "Join SILAI Bespoke"}
          </h2>
          <p className="text-xs text-champagne/70 mt-1">
            Custom Made. Delivered Home.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-wine-dark/80 p-1 mb-6 border border-sand/15">
          <button
            onClick={() => {
              setTab("LOGIN");
              setErrorMessage("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              tab === "LOGIN"
                ? "bg-burgundy text-sand-light shadow-sm"
                : "text-champagne/60 hover:text-champagne"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab("REGISTER");
              setErrorMessage("");
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              tab === "REGISTER"
                ? "bg-burgundy text-sand-light shadow-sm"
                : "text-champagne/60 hover:text-champagne"
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "REGISTER" && (
            <div>
              <label className="block text-xs font-medium text-sand/80 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-sand/80 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-sand/80 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-sand/50" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-wine/60 border border-sand/20 text-champagne focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition"
              />
            </div>
          </div>

          {tab === "REGISTER" && (
            <div>
              <label className="block text-xs font-medium text-sand/80 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-wine/80 border border-sand/20 text-champagne focus:outline-none focus:border-sand focus:ring-1 focus:ring-sand transition"
              >
                <option value="CUSTOMER">Customer (Order Custom Stitching)</option>
                <option value="TAILOR">Tailor / Boutique (Receive Stitching Orders)</option>
                <option value="DELIVERY_PARTNER">Delivery Partner (Doorstep Logistics)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 rounded-lg font-medium text-sm text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Authenticating..."
              : tab === "LOGIN"
              ? "Sign In to SILAI"
              : "Register Account"}
          </button>
        </form>

        {/* Fast 1-Click Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-sand/15">
          <p className="text-[11px] font-mono tracking-wider text-sand/70 text-center uppercase mb-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sand" /> Pre-Configured Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillDemoAccount("priya@example.com")}
              className="p-1.5 rounded bg-wine/70 hover:bg-burgundy/50 border border-sand/20 text-champagne text-left transition"
            >
              <p className="font-semibold text-sand">Priya Sharma</p>
              <p className="text-[10px] text-champagne/60">Customer</p>
            </button>
            <button
              onClick={() => fillDemoAccount("meera@example.com")}
              className="p-1.5 rounded bg-wine/70 hover:bg-burgundy/50 border border-sand/20 text-champagne text-left transition"
            >
              <p className="font-semibold text-sand">Meera Devi</p>
              <p className="text-[10px] text-champagne/60">Master Tailor</p>
            </button>
            <button
              onClick={() => fillDemoAccount("rahul@example.com")}
              className="p-1.5 rounded bg-wine/70 hover:bg-burgundy/50 border border-sand/20 text-champagne text-left transition"
            >
              <p className="font-semibold text-sand">Rahul Verma</p>
              <p className="text-[10px] text-champagne/60">Delivery Partner</p>
            </button>
          </div>
          <p className="text-[10px] text-center text-champagne/50 mt-2">
            Default Password: <code className="text-sand">Silai@2026</code>
          </p>
        </div>
      </div>
    </div>
  );
}
