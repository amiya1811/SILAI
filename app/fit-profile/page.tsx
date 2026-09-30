"use client";

import React, { useState, useEffect } from "react";
import { MeasurementProfile, GarmentCategory } from "@/lib/types";
import { Ruler, Scissors, Truck, Plus, CheckCircle, Info, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function FitProfilePage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeGarmentTab, setActiveGarmentTab] = useState<GarmentCategory>("BLOUSE");
  const [profileName, setProfileName] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, number>>({
    bust: 36,
    underbust: 31,
    waist: 28,
    shoulder: 14.5,
    armhole: 16,
    sleeveLength: 10.5,
    blouseLength: 14.5,
    frontNeckDepth: 7,
    backNeckDepth: 9.5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/measurements");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.measurements);
      }
    } catch (err) {
      console.error("Failed to load measurements", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName,
          garmentType: activeGarmentTab,
          type: "SAVED",
          measurements,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setProfileName("");
        await loadProfiles();
      }
    } catch (err) {
      console.error("Failed to save measurement profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/15 pb-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-sand uppercase">
            ANATOMICAL PRECISION
          </span>
          <h1 className="font-serif text-3xl font-bold text-sand-light mt-1">
            My Fit Profiles & Measurement Vault
          </h1>
          <p className="text-xs text-champagne/75 mt-0.5">
            Encrypted storage of your bespoke measurements across blouses, kurtis, and trousers.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-sand" /> Add New Fit Profile
        </button>
      </div>

      {/* 3 Fit Options Explainer (Requirement 14) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-2">
          <div className="flex items-center gap-2 text-sand">
            <Ruler className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-sand-light">Saved Measurements</h4>
          </div>
          <p className="text-xs text-champagne/75 leading-relaxed">
            Record tape measurements once. Tailors match pattern paper cuts to your saved millimeters.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-2">
          <div className="flex items-center gap-2 text-sand">
            <Scissors className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-sand-light">Sample Garment Cloning</h4>
          </div>
          <p className="text-xs text-champagne/75 leading-relaxed">
            Don't have tape measurements? Send your favorite fitting blouse or shirt during fabric pickup.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-2">
          <div className="flex items-center gap-2 text-sand">
            <Truck className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-sand-light">Doorstep Master Visit</h4>
          </div>
          <p className="text-xs text-champagne/75 leading-relaxed">
            A certified tailoring master visits your home with fabric swatches and professional tapes.
          </p>
        </div>
      </div>

      {/* Add New Profile Drawer / Form */}
      {showAddForm && (
        <div className="p-6 rounded-3xl bg-maroon/90 border border-sand/30 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-sand/15 pb-4">
            <h3 className="font-serif text-xl font-bold text-sand-light">
              Create New Custom Measurement Profile
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-champagne/60 hover:text-sand"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Profile Name (e.g. Wedding Silk Blouse Fit)
                </label>
                <input
                  type="text"
                  required
                  placeholder="My Saree Blouse Fit"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne focus:outline-none focus:border-sand"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-sand mb-1 uppercase">
                  Garment Category
                </label>
                <select
                  value={activeGarmentTab}
                  onChange={(e) => setActiveGarmentTab(e.target.value as GarmentCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-wine-dark border border-sand/25 text-champagne focus:outline-none focus:border-sand"
                >
                  <option value="BLOUSE">Saree Blouse</option>
                  <option value="KURTI">Kurti / Tunic</option>
                  <option value="SUIT">Salwar Suit / Anarkali</option>
                  <option value="SHIRT">Men's Formal Shirt</option>
                  <option value="PANTS">Custom Trousers</option>
                </select>
              </div>
            </div>

            {/* Garment Specific Measurement Fields */}
            {activeGarmentTab === "BLOUSE" && (
              <div>
                <label className="block text-xs font-mono text-sand mb-3 uppercase">
                  Blouse Anatomical Measurements (in Inches)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(measurements).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-[11px] text-champagne/70 capitalize block mb-1">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <input
                        type="number"
                        step="0.25"
                        value={val}
                        onChange={(e) =>
                          setMeasurements({ ...measurements, [key]: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-sand font-mono focus:outline-none focus:border-sand"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl font-medium text-xs text-sand-light bg-gradient-to-r from-burgundy to-maroon border border-sand/40 hover:shadow-gold-glow transition disabled:opacity-50"
            >
              {isSaving ? "Saving to Vault..." : "Save Fit Profile"}
            </button>
          </form>
        </div>
      )}

      {/* List of Existing Measurement Profiles */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-sand-light">Saved Vault Profiles</h3>
        {profiles.length === 0 ? (
          <p className="text-xs text-champagne/60 italic">No measurement profiles saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((prof) => (
              <div
                key={prof.id}
                className="p-5 rounded-2xl bg-wine-dark/70 border border-sand/20 space-y-4 hover:border-sand/40 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-burgundy/60 text-sand border border-sand/20">
                      {prof.garmentType}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-sand-light mt-1">
                      {prof.profileName}
                    </h4>
                  </div>
                  {prof.isDefault && (
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      Default
                    </span>
                  )}
                </div>

                {/* Measurements Pills */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-champagne/80">
                  {Object.entries(prof.measurements)
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <div key={k} className="p-1.5 rounded bg-wine/50 border border-sand/10">
                        <span className="text-[10px] text-champagne/50 block capitalize">
                          {k.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="text-sand font-bold">{v}"</span>
                      </div>
                    ))}
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-champagne/60 font-mono">
                  <Lock className="w-3 h-3 text-sand" />
                  <span>Encrypted Customer Vault • Only accessible by you & assigned tailor</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
