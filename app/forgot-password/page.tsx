"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);
    setDevResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to process request. Please try again.");
      } else {
        setMessage(data.message || "If an account exists with this email, instructions have been sent.");
        if (data.resetUrl) {
          setDevResetUrl(data.resetUrl);
        }
      }
    } catch (err: any) {
      setErrorMessage("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#560B18]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#F2D9A0]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-block group">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-serif text-3xl font-bold tracking-widest text-[#F2D9A0] group-hover:text-[#F2E5C6] transition">
              SILAI
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-[#F2D9A0]/30 text-[#F2D9A0] font-mono">
              SECURITY
            </span>
          </div>
          <p className="text-xs font-mono tracking-wider text-[#F2E5C6]/60 uppercase">
            Bespoke Custom Tailoring Marketplace
          </p>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#3B010B]/80 to-[#080608]/95 border border-[#F2D9A0]/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F2D9A0]/15">
          <div className="w-10 h-10 rounded-xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#F2D9A0]">
              {t("auth.forgotPassword", "Forgot Password")}
            </h1>
            <p className="text-xs text-[#F2E5C6]/70">
              Recover access to your SILAI account
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-300 mb-1">Request Received</p>
                <p className="text-[#F2E5C6]/80">{message}</p>
                <p className="mt-2 text-[11px] text-[#F2E5C6]/60">
                  Reset links remain valid for 20 minutes and can only be used once.
                </p>
              </div>
            </div>

            {devResetUrl && (
              <div className="p-3 rounded-xl bg-[#560B18]/50 border border-[#F2D9A0]/30 text-xs text-center space-y-2">
                <p className="text-[11px] font-mono text-[#F2D9A0]">
                  [Local Dev Quick Access]
                </p>
                <Link
                  href={devResetUrl}
                  className="inline-block px-4 py-2 rounded-lg bg-[#F2D9A0] text-[#3B010B] font-semibold text-xs hover:bg-[#F2E5C6] transition"
                >
                  Proceed to Reset Password
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#F2D9A0]/15 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setMessage(null);
                  setEmail("");
                }}
                className="text-[#F2D9A0] hover:underline"
              >
                Send to a different email
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[#F2E5C6]/70 hover:text-[#F2D9A0] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("common.back", "Return to Home")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F2D9A0] mb-1.5">
                {t("auth.email", "Registered Email Address")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#F2D9A0]/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#3B010B]/40 border border-[#F2D9A0]/30 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0] focus:ring-1 focus:ring-[#F2D9A0] transition"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#F2E5C6]/50">
                Works for Customer, Tailor Partner, and Delivery Fleet accounts.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] hover:opacity-95 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#3B010B] border-t-transparent rounded-full animate-spin" />
                  <span>{t("auth.sendingLink", "Generating Secure Link...")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#3B010B]" />
                  <span>{t("auth.sendResetLink", "Send Password Reset Instructions")}</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-[#F2D9A0]/15 flex items-center justify-between text-xs">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[#F2E5C6]/70 hover:text-[#F2D9A0] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("auth.login", "Back to Sign In")}
              </Link>
              <Link
                href="/help"
                className="text-[#F2E5C6]/50 hover:text-[#F2D9A0] transition"
              >
                {t("footer.helpCenter", "Need Help?")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
