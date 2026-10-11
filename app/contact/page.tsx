"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-[#080608] text-[#F2E5C6] flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#F2D9A0] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#F2D9A0]/20">
          <div className="w-12 h-12 rounded-2xl bg-[#560B18]/60 border border-[#F2D9A0]/30 flex items-center justify-center text-[#F2D9A0]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#F2D9A0]/70">
              Customer Concierge
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#F2D9A0]">
              Contact SILAI
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#1A0710]/70 border border-[#F2D9A0]/15 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
                Atelier Concierge Desk
              </h2>
              <p className="text-xs sm:text-sm text-[#F2E5C6]/75 leading-relaxed">
                Have questions regarding custom garment stitching, courier pickup, or an ongoing commission?
                Our customer care team is here to assist you.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-[#F2E5C6]/90">
                  <div className="w-8 h-8 rounded-lg bg-[#560B18]/50 border border-[#F2D9A0]/20 flex items-center justify-center text-[#F2D9A0] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F2D9A0] font-mono block">EMAIL</span>
                    <a href="mailto:support@silai.co" className="hover:underline">support@silai.co</a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#F2E5C6]/90">
                  <div className="w-8 h-8 rounded-lg bg-[#560B18]/50 border border-[#F2D9A0]/20 flex items-center justify-center text-[#F2D9A0] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F2D9A0] font-mono block">PHONE & WHATSAPP</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <a href="tel:+919019715087" className="hover:underline font-mono">+91 90197 15087</a>
                      <span className="text-[#F2D9A0]/40">•</span>
                      <a
                        href="https://wa.me/919019715087"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F2D9A0] hover:underline text-[11px]"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#F2E5C6]/90">
                  <div className="w-8 h-8 rounded-lg bg-[#560B18]/50 border border-[#F2D9A0]/20 flex items-center justify-center text-[#F2D9A0] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#F2D9A0] font-mono block">FLAGSHIP HEADQUARTERS</span>
                    <span>SILAI Atelier House, Electronic City, Dodda Thogur, Bengaluru, Karnataka</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#560B18]/30 border border-[#F2D9A0]/15 text-xs text-[#F2E5C6]/70">
              Operating Hours: Monday – Saturday, 9:00 AM – 8:00 PM IST
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="p-6 rounded-2xl bg-[#16050C]/80 border border-[#F2D9A0]/20">
            {isSent ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
                  Message Received
                </h2>
                <p className="text-xs text-[#F2E5C6]/80 max-w-xs mx-auto">
                  Thank you for reaching out. A member of our concierge team will reply within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-serif text-lg font-bold text-[#F2D9A0]">
                  Send an Inquiry
                </h2>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F2D9A0] mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our styling concierge assist you today?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#1D0811] border border-[#F2D9A0]/25 text-[#F2E5C6] placeholder:text-[#F2E5C6]/30 focus:outline-none focus:border-[#F2D9A0]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-medium text-xs text-[#3B010B] bg-gradient-to-r from-[#F2D9A0] via-[#F2E5C6] to-[#F2D9A0] hover:opacity-95 shadow-md transition flex items-center justify-center gap-2 font-semibold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
