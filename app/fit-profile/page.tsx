"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ALL_GARMENT_CATEGORIES,
  getFieldsForGarmentCategory,
  MeasurementFieldDef,
} from "@/lib/garments";
import {
  Ruler,
  Scissors,
  Truck,
  Plus,
  CheckCircle,
  Info,
  Lock,
  Search,
  Trash2,
  Sparkles,
  X,
  FileText,
  Check,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface SavedFitProfile {
  id: string;
  customerId: string;
  profileName: string;
  garmentType: string;
  customGarmentName?: string;
  customDescription?: string;
  unit?: "in" | "cm";
  notes?: string;
  type: string;
  isDefault?: boolean;
  measurements: Record<string, any>;
  customFields?: Array<{ name: string; value: string | number; unit: string }>;
  createdAt: string;
}

interface CustomFieldRow {
  id: string;
  name: string;
  value: string;
  unit: "in" | "cm";
}

export default function FitProfilePage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SavedFitProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [profileName, setProfileName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Blouse");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Standard Garment Measurement Values
  const [standardValues, setStandardValues] = useState<Record<string, string>>({
    bust: "36",
    underbust: "31",
    waist: "28",
    shoulder: "14.5",
    armhole: "16",
    sleeveLength: "10.5",
    bicep: "12",
    blouseLength: "14.5",
    frontNeckDepth: "7",
    backNeckDepth: "9.5",
  });

  // Custom Garment State
  const [customGarmentName, setCustomGarmentName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customFields, setCustomFields] = useState<CustomFieldRow[]>([
    { id: "cf-1", name: "Chest / Bust", value: "38", unit: "in" },
    { id: "cf-2", name: "Shoulder Width", value: "16.5", unit: "in" },
    { id: "cf-3", name: "Garment Total Length", value: "36", unit: "in" },
  ]);

  const isCustom = selectedCategory.toLowerCase() === "custom";

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return ALL_GARMENT_CATEGORIES;
    const q = categorySearchQuery.toLowerCase();
    return ALL_GARMENT_CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [categorySearchQuery]);

  // Dynamic fields for currently selected standard category
  const dynamicFields: MeasurementFieldDef[] = useMemo(() => {
    if (isCustom) return [];
    return getFieldsForGarmentCategory(selectedCategory);
  }, [selectedCategory, isCustom]);

  // Reset standard measurement defaults when category changes
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery("");

    if (cat.toLowerCase() !== "custom") {
      const fields = getFieldsForGarmentCategory(cat);
      const defaults: Record<string, string> = {};
      fields.forEach((f) => {
        defaults[f.key] = f.placeholder || "";
      });
      setStandardValues(defaults);
    }
  };

  // Fetch profiles from PostgreSQL via Prisma
  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/measurements");
      if (res.ok) {
        const data = await res.json();
        setProfiles(Array.isArray(data?.measurements) ? data.measurements : []);
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

  // Custom Field Builder Handlers
  const handleAddCustomField = () => {
    const newField: CustomFieldRow = {
      id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      value: "",
      unit: unit,
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateCustomField = (id: string, key: "name" | "value" | "unit", val: string) => {
    setCustomFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: val } : item))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((item) => item.id !== id));
  };

  // Delete saved profile
  const handleDeleteProfile = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this Fit Profile from your vault?")) {
      return;
    }
    try {
      const res = await fetch(`/api/measurements?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadProfiles();
      }
    } catch (err) {
      console.error("Failed to delete profile", err);
    }
  };

  // Save new fit profile to PostgreSQL
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSaveSuccessMsg("");

    if (!profileName.trim()) {
      setErrorMessage("Please enter a profile name");
      return;
    }

    if (isCustom && !customGarmentName.trim()) {
      setErrorMessage("Please specify the custom garment name");
      return;
    }

    setIsSaving(true);

    try {
      let finalMeasurements: Record<string, any> = {};

      if (isCustom) {
        // Collect custom fields into measurements dictionary
        customFields.forEach((cf) => {
          if (cf.name.trim() && cf.value.trim()) {
            finalMeasurements[cf.name.trim()] = cf.value.trim();
          }
        });
      } else {
        // Collect standard fields
        dynamicFields.forEach((f) => {
          const val = standardValues[f.key];
          if (val !== undefined && val !== "") {
            finalMeasurements[f.label] = val;
          }
        });
      }

      const payload = {
        profileName: profileName.trim(),
        garmentType: selectedCategory,
        customGarmentName: isCustom ? customGarmentName.trim() : undefined,
        customDescription: isCustom ? customDescription.trim() : undefined,
        unit,
        type: "SAVED",
        measurements: finalMeasurements,
        customFields: isCustom
          ? customFields.filter((cf) => cf.name.trim()).map((cf) => ({
              name: cf.name.trim(),
              value: cf.value.trim(),
              unit: cf.unit,
            }))
          : undefined,
        notes: notes.trim() || undefined,
        isDefault,
      };

      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save measurement profile");
      }

      setSaveSuccessMsg(`Fit Profile "${profileName}" saved to your private vault!`);
      setShowAddForm(false);
      setProfileName("");
      setNotes("");
      setCustomGarmentName("");
      setCustomDescription("");
      await loadProfiles();

      setTimeout(() => {
        setSaveSuccessMsg("");
      }, 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sand/20 dark:border-burgundy/30 pb-6">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-sand dark:text-sand font-semibold uppercase">
            ANATOMICAL PRECISION VAULT
          </span>
          <h1 className="font-serif text-3xl font-bold text-champagne-light dark:text-champagne-light mt-1">
            My Fit Profiles & Measurement Vault
          </h1>
          <p className="text-xs text-sand/80 dark:text-sand/70 mt-0.5">
            Encrypted bespoke measurements tailored to each garment category, blouse cut, trouser rise, or custom artisan ensemble.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMessage("");
          }}
          className="px-5 py-2.5 rounded-full text-xs font-semibold text-champagne bg-gradient-to-r from-burgundy to-maroon border border-burgundy/40 hover:opacity-95 shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-champagne" /> {showAddForm ? "Close Form" : "Add New Fit Profile"}
        </button>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* 3 Fit Options Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#FAF4E8] border border-burgundy/20 space-y-2 text-wine shadow-sm">
          <div className="flex items-center gap-2 text-burgundy">
            <Ruler className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-wine">Garment-Specific Precision</h4>
          </div>
          <p className="text-xs text-wine/75 leading-relaxed">
            Record exact tape measurements for blouses, kurtis, trousers, or suits. Tailors receive your exact mm specifications.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAF4E8] border border-burgundy/20 space-y-2 text-wine shadow-sm">
          <div className="flex items-center gap-2 text-burgundy">
            <Sparkles className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-wine">Custom Ensemble Builder</h4>
          </div>
          <p className="text-xs text-wine/75 leading-relaxed">
            Crafting a rare couture silhouette or long coat? Define unlimited custom measurements with flexible units.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAF4E8] border border-burgundy/20 space-y-2 text-wine shadow-sm">
          <div className="flex items-center gap-2 text-burgundy">
            <Lock className="w-5 h-5" />
            <h4 className="font-serif text-base font-bold text-wine">Re-usable Ordering Vault</h4>
          </div>
          <p className="text-xs text-wine/75 leading-relaxed">
            Attach any saved fit profile with a single tap during checkout. Zero repetitive tape measuring for future orders.
          </p>
        </div>
      </div>

      {/* Add New Profile Drawer / Form */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF4E8] border border-burgundy/25 shadow-card-luxury space-y-6 animate-in fade-in text-wine">
          <div className="flex justify-between items-center border-b border-burgundy/15 pb-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-burgundy uppercase font-semibold">
                STEP-BY-STEP FIT BUILDER
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-wine mt-0.5">
                Create New Custom Fit Profile
              </h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-wine/60 hover:text-burgundy font-medium p-1 hover:bg-sand/30 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Row 1: Profile Name & Unit Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-burgundy font-semibold mb-1 uppercase">
                  Profile Name (e.g. "Amiya - Wedding Saree Blouse", "Priya - Casual Kurti")
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Anarkali Fit"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine placeholder:text-wine/40 focus:outline-none focus:border-burgundy font-medium"
                />
              </div>

              {/* Unit Selection: Inches vs Centimeters */}
              <div>
                <label className="block text-xs font-mono text-burgundy font-semibold mb-1 uppercase">
                  Measurement Unit
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#F2E5C6]/60 border border-burgundy/25 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUnit("in")}
                    className={`py-1.5 rounded-lg text-center transition ${
                      unit === "in"
                        ? "bg-gradient-to-r from-burgundy to-maroon text-champagne font-bold shadow-sm"
                        : "text-wine/70 hover:text-wine"
                    }`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("cm")}
                    className={`py-1.5 rounded-lg text-center transition ${
                      unit === "cm"
                        ? "bg-gradient-to-r from-burgundy to-maroon text-champagne font-bold shadow-sm"
                        : "text-wine/70 hover:text-wine"
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Searchable Garment Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-burgundy font-semibold uppercase flex items-center justify-between">
                <span>Select Garment Category ({ALL_GARMENT_CATEGORIES.length} Available)</span>
                <span className="text-[10px] text-wine/60 lowercase font-normal">
                  search or pick from list
                </span>
              </label>

              {/* Dropdown Container */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine flex items-center justify-between hover:border-burgundy/50 transition"
                >
                  <span className="font-semibold flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sand/60 text-burgundy font-mono text-[10px]">
                      Selected
                    </span>
                    <span className="text-sm font-serif">{selectedCategory}</span>
                    {isCustom && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono">
                        Flexible Builder
                      </span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-wine/60" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-2xl bg-[#FAF4E8] border border-burgundy/30 shadow-2xl p-3 space-y-2 animate-in fade-in">
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-wine/40 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search category (e.g. Blouse, Kurti, Pants, Sherwani, Custom)..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/20 text-wine placeholder:text-wine/40 focus:outline-none focus:border-burgundy"
                        autoFocus
                      />
                    </div>

                    {/* Scrollable list of categories */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                      {filteredCategories.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => handleSelectCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition ${
                            selectedCategory === cat
                              ? "bg-gradient-to-r from-burgundy to-maroon text-champagne font-bold"
                              : "hover:bg-[#F2E5C6]/50 text-wine"
                          }`}
                        >
                          <span>{cat}</span>
                          {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-champagne" />}
                        </div>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="p-3 text-center text-xs text-wine/60 italic">
                          No matching categories found. Choose "Custom" to build your own.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: IF CUSTOM GARMENT CHOSEN */}
            {isCustom ? (
              <div className="p-5 rounded-2xl bg-white/70 border border-burgundy/20 space-y-4">
                <div className="flex items-center gap-2 text-burgundy">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="font-serif text-sm font-bold text-wine">
                    Custom Garment Specification & Builder
                  </h4>
                </div>
                <p className="text-[11px] text-wine/75 leading-relaxed">
                  Enter your garment's name, styling goals, and add as many custom measurement coordinates as needed.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-1">
                      Garment Name * (e.g. Long Winter Trench Coat, Flared Cape)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Double-Breasted Long Coat"
                      value={customGarmentName}
                      onChange={(e) => setCustomGarmentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine focus:outline-none focus:border-burgundy font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-burgundy uppercase font-semibold mb-1">
                      Garment Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Woolen structured silhouette with peak lapels"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#F2E5C6]/40 border border-burgundy/25 text-wine focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>

                {/* Flexible Custom Measurement Builder Rows */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-burgundy uppercase font-semibold">
                      Custom Measurements ({customFields.length} Defined)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-3 py-1 rounded-lg bg-burgundy/10 text-burgundy text-[11px] font-semibold hover:bg-burgundy/20 transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Measurement
                    </button>
                  </div>

                  <div className="space-y-2">
                    {customFields.map((cf, idx) => (
                      <div
                        key={cf.id}
                        className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-[#F2E5C6]/40 border border-burgundy/15"
                      >
                        <div className="col-span-6 sm:col-span-6">
                          <input
                            type="text"
                            placeholder={`Measurement Name (e.g. Chest, Collar, Slit)`}
                            value={cf.name}
                            onChange={(e) => handleUpdateCustomField(cf.id, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/80 border border-burgundy/20 text-wine font-medium focus:outline-none focus:border-burgundy"
                          />
                        </div>

                        <div className="col-span-3 sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Value (e.g. 42)"
                            value={cf.value}
                            onChange={(e) => handleUpdateCustomField(cf.id, "value", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/80 border border-burgundy/20 text-wine font-mono font-bold focus:outline-none focus:border-burgundy"
                          />
                        </div>

                        <div className="col-span-2 sm:col-span-2">
                          <select
                            value={cf.unit}
                            onChange={(e) => handleUpdateCustomField(cf.id, "unit", e.target.value as any)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg bg-white/80 border border-burgundy/20 text-wine font-mono focus:outline-none focus:border-burgundy"
                          >
                            <option value="in">in</option>
                            <option value="cm">cm</option>
                          </select>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(cf.id)}
                            className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition"
                            title="Remove measurement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* SECTION: STANDARD GARMENT DYNAMIC MEASUREMENT FIELDS */
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-burgundy/15 pb-2">
                  <label className="text-xs font-mono text-burgundy font-semibold uppercase flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-burgundy" /> {selectedCategory} Anatomical Measurements (in {unit === "in" ? "Inches" : "Centimeters"})
                  </label>
                  <span className="text-[10px] text-wine/60 font-mono">
                    {dynamicFields.length} Relevant Fields Shown
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {dynamicFields.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-wine font-medium block">
                          {f.label} {f.required && <span className="text-burgundy">*</span>}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required={f.required}
                          value={standardValues[f.key] ?? ""}
                          onChange={(e) =>
                            setStandardValues({ ...standardValues, [f.key]: e.target.value })
                          }
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2 rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine font-mono font-bold focus:outline-none focus:border-burgundy pr-8"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] font-mono text-wine/50 font-bold">
                          {unit}
                        </span>
                      </div>
                      {f.tip && (
                        <p className="text-[10px] text-wine/55 leading-tight line-clamp-1" title={f.tip}>
                          {f.tip}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Notes & Fit Preferences */}
            <div className="space-y-1">
              <label className="block text-xs font-mono text-burgundy font-semibold uppercase">
                Custom Notes & Stitching Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Slim fit with snug armholes; prefers princess cut padding; extra 1 inch ease on sleeves..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F2E5C6]/40 border border-burgundy/25 text-wine placeholder:text-wine/40 focus:outline-none focus:border-burgundy"
              />
            </div>

            {/* Default Fit Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefaultProfile"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-burgundy/30 text-burgundy focus:ring-burgundy"
              />
              <label htmlFor="isDefaultProfile" className="text-xs text-wine/80 font-medium cursor-pointer">
                Set as default fit profile for {selectedCategory}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl font-medium text-xs text-champagne bg-gradient-to-r from-burgundy to-maroon border border-burgundy/40 hover:opacity-95 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? "Saving to PostgreSQL Vault..." : "Save Fit Profile"}
            </button>
          </form>
        </div>
      )}

      {/* List of Existing Measurement Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-sand/20 dark:border-burgundy/30 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-bold text-champagne-light dark:text-champagne-light">Saved Vault Profiles</h3>
            <span className="px-2 py-0.5 rounded-full bg-sand/20 text-sand font-mono text-xs font-bold border border-sand/30">
              {profiles.length} Profiles
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-sand/70 font-mono">
            Loading encrypted fit profiles from PostgreSQL...
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#FAF4E8] border border-burgundy/20 text-center space-y-3">
            <Ruler className="w-8 h-8 text-burgundy/60 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-wine">No Fit Profiles Saved Yet</h4>
            <p className="text-xs text-wine/70 max-w-md mx-auto leading-relaxed">
              Create your first garment-specific measurement profile above. Your tailors will automatically use your verified sizing coordinates.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-champagne bg-gradient-to-r from-burgundy to-maroon hover:opacity-95 transition"
            >
              Create My First Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((prof) => {
              const entries = Object.entries(prof?.measurements || {});
              const isCustomProfile = (prof?.garmentType || "").toLowerCase() === "custom";
              const unitLabel = prof?.unit || "in";

              return (
                <div
                  key={prof.id}
                  className="p-5 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 space-y-4 hover:border-burgundy/40 transition shadow-sm text-wine dark:text-champagne flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sand/50 dark:bg-burgundy/40 text-burgundy dark:text-sand border border-burgundy/20 dark:border-sand/30 font-bold">
                            {prof.garmentType}
                          </span>
                          {prof.customGarmentName && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-semibold">
                              {prof.customGarmentName}
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-burgundy/10 dark:bg-burgundy/30 text-burgundy dark:text-sand font-bold">
                            {unitLabel === "cm" ? "Metric (cm)" : "Imperial (in)"}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-wine dark:text-sand-light mt-1.5">
                          {prof.profileName}
                        </h4>
                        {prof.customDescription && (
                          <p className="text-[11px] text-maroon/80 dark:text-champagne/70 italic mt-0.5">
                            {prof.customDescription}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {prof.isDefault && (
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 font-semibold">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteProfile(prof.id)}
                          className="p-1.5 text-maroon/50 dark:text-champagne/50 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete fit profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Measurements Display Pills */}
                    {entries.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-wine/90 dark:text-champagne-light">
                        {entries.slice(0, 9).map(([k, v]) => (
                          <div
                            key={k}
                            className="p-1.5 rounded-lg bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/15 dark:border-burgundy/30 flex flex-col justify-between"
                          >
                            <span className="text-[9px] text-maroon/70 dark:text-sand/80 block truncate capitalize font-medium" title={k}>
                              {(k || "").replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="text-burgundy dark:text-sand font-bold">
                              {String(v)} {unitLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-maroon/60 dark:text-champagne/50 italic font-mono">
                        No individual numeric dimensions saved.
                      </p>
                    )}

                    {/* Notes if any */}
                    {prof.notes && (
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#0D080A]/80 border border-burgundy/15 dark:border-burgundy/30 text-[11px] text-maroon/90 dark:text-champagne/90">
                        <span className="font-mono text-[9px] uppercase font-bold text-burgundy dark:text-sand block mb-0.5">
                          Fit Notes:
                        </span>
                        <p className="line-clamp-2 leading-relaxed">{prof.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-burgundy/10 dark:border-burgundy/20 flex items-center justify-between text-[10px] text-maroon/70 dark:text-champagne/60 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-burgundy dark:text-sand" />
                      <span>Encrypted Vault</span>
                    </div>
                    <span>{new Date(prof.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
