"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Send, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ReportIssuePage() {
  const [orderId, setOrderId] = useState("");
  const [issueType, setIssueType] = useState("fit_discrepancy");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#F2D9A0] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#F2D9A0]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Customer Protection
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Report an Issue
            </h1>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-[#1A0710]/80 border border-emerald-500/30 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#F2D9A0]">
              Dispute & Issue Docket Registered
            </h2>
            <p className="text-xs text-[#F2E5C6]/80 max-w-md mx-auto leading-relaxed">
              Our Senior Atelier Concierge team has received your report. We prioritize active order issues and will reach out via call/WhatsApp within 4 hours.
            </p>
            <div className="pt-4">
              <Link
                href="/orders"
                className="inline-block px-6 py-2.5 rounded-xl bg-[#560B18] border border-[#F2D9A0]/30 text-xs font-semibold text-[#F2D9A0] hover:bg-[#720e20] transition"
              >
                Return to Orders
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-5">
            <div className="p-4 rounded-xl bg-[#560B18]/25 border border-[#F2D9A0]/15 flex items-start gap-3 text-xs text-[#F2E5C6]/80">
              <ShieldAlert className="w-5 h-5 text-[#F2D9A0] shrink-0 mt-0.5" />
              <span>
                All orders are covered under the SILAI 100% Fit Guarantee. If you are experiencing a sizing mismatch or transit delay, submit this ticket for priority resolution.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                Order ID (Optional)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ord_abc123"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                Category of Issue
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] focus:outline-none focus:border-[#F2D9A0]"
              >
                <option value="fit_discrepancy">Fit / Measurement Discrepancy</option>
                <option value="pickup_delay">Doorstep Pickup Delay</option>
                <option value="delivery_delay">Delivery Transit Delay</option>
                <option value="fabric_damage">Fabric or Stitching Defect</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                Describe the Issue in Detail
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what occurred and how you would like us to resolve it..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-medium text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] hover:opacity-95 shadow-md transition flex items-center justify-center gap-2 font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Issue for Immediate Review</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
