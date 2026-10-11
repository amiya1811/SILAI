"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ResetPasswordContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
          Invalid or Missing Token
        </h2>
        <p className="text-xs text-[#F2E5C6]/70 leading-relaxed">
          The password reset link is missing a verification token or is invalid. Please request a new link from the forgot password page.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#F2D9A0] text-[#3B010B] font-semibold text-xs hover:bg-[#F2E5C6] transition"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password. Link may have expired.");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
          Password Reset Complete
        </h2>
        <p className="text-xs text-[#F2E5C6]/80 leading-relaxed">
          Your password has been securely updated. Your previous password has been deactivated. You can now log in to SILAI.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block w-full py-3 px-4 rounded-xl font-semibold text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] to-[#F2E5C6] hover:opacity-95 shadow-md transition"
          >
            {t("auth.login", "Go to SILAI & Sign In")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#F2D9A0] mb-1.5">
          {t("auth.password", "New Password")}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#F2D9A0]/50" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#3B010B]/40 border border-[#F2D9A0]/30 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0] focus:ring-1 focus:ring-[#F2D9A0] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-[#F2D9A0]/60 hover:text-[#F2D9A0]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#F2D9A0] mb-1.5">
          {t("auth.password", "Confirm New Password")}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#F2D9A0]/50" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type your new password"
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#3B010B]/40 border border-[#F2D9A0]/30 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0] focus:ring-1 focus:ring-[#F2D9A0] transition"
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#560B18]/30 border border-[#F2D9A0]/15 text-[11px] text-[#F2E5C6]/70 space-y-1">
        <p className="font-semibold text-[#F2D9A0]">Security Requirements:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>At least 8 characters in length</li>
          <li>Never share your credentials with anyone</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-xl font-medium text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] hover:opacity-95 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-semibold"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-[#3B010B] border-t-transparent rounded-full animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-[#3B010B]" />
            <span>Set New Password & Deactivate Old</span>
          </>
        )}
      </button>

      <div className="pt-4 border-t border-[#F2D9A0]/15 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#F2E5C6]/70 hover:text-[#F2D9A0] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("common.back", "Back to Home")}
        </Link>
        <Link
          href="/forgot-password"
          className="text-[#F2E5C6]/50 hover:text-[#F2D9A0] transition"
        >
          Request Fresh Link
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient glows */}
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

      {/* Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-[#3B010B]/80 to-[#080608]/95 border border-[#F2D9A0]/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F2D9A0]/15">
          <div className="w-10 h-10 rounded-xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#F2D9A0]">
              Create New Password
            </h1>
            <p className="text-xs text-[#F2E5C6]/70">
              Enter your new credentials below
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="py-12 text-center text-xs text-[#F2E5C6]/60">
            <div className="w-5 h-5 mx-auto border-2 border-[#F2D9A0] border-t-transparent rounded-full animate-spin mb-2" />
            Loading reset session...
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
