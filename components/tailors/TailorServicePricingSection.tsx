"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import {
  Scissors,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  X,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

export interface ServicePricingItem {
  id: string;
  category: string;
  variantName: string;
  name: string;
  basePrice: number;
  estimatedDays: number;
  description?: string;
  imageUrl?: string;
  complexity?: string;
}

// Sensible starter presets based on standard Indian couture & tailoring
const DEFAULT_PRESETS: Record<
  string,
  Array<{ variantName: string; name: string; basePrice: number; estimatedDays: number; description: string; complexity: string }>
> = {
  Blouse: [
    {
      variantName: "Simple",
      name: "Simple Blouse",
      basePrice: 600,
      estimatedDays: 3,
      description: "Classic round or square neck with standard cotton lining",
      complexity: "SIMPLE",
    },
    {
      variantName: "Designer",
      name: "Designer Blouse",
      basePrice: 900,
      estimatedDays: 4,
      description: "Princess cut, sweetheart or boat neck, cups padding and delicate piping",
      complexity: "DESIGNER",
    },
    {
      variantName: "Heavy / Bridal",
      name: "Heavy / Bridal Blouse",
      basePrice: 1500,
      estimatedDays: 7,
      description: "Intricate zari handwork framing, latkan doris, double inner canvas support",
      complexity: "HEAVY_BRIDAL",
    },
  ],
  Kurti: [
    {
      variantName: "Simple",
      name: "Simple Kurti",
      basePrice: 500,
      estimatedDays: 3,
      description: "Straight cut cotton or linen kurti with neat side slits",
      complexity: "SIMPLE",
    },
    {
      variantName: "Designer",
      name: "Designer Kurti",
      basePrice: 800,
      estimatedDays: 4,
      description: "A-line or flared silhouette with designer neckline and lace finishing",
      complexity: "DESIGNER",
    },
  ],
  "Salwar / Suit": [
    {
      variantName: "Classic Salwar Suit",
      name: "Classic Salwar Suit",
      basePrice: 850,
      estimatedDays: 4,
      description: "Complete 3-piece tailored suit (top, bottom, and dupatta edging)",
      complexity: "REGULAR",
    },
    {
      variantName: "Anarkali / Designer",
      name: "Anarkali / Designer Suit",
      basePrice: 1400,
      estimatedDays: 6,
      description: "Kalidar flared anarkali suit with customized neckline and border work",
      complexity: "DESIGNER",
    },
  ],
  Shirt: [
    {
      variantName: "Regular",
      name: "Regular Men's Shirt",
      basePrice: 600,
      estimatedDays: 3,
      description: "Crisp formal or casual collar shirt with precision cuff stitching",
      complexity: "REGULAR",
    },
    {
      variantName: "Slim Fit / Designer",
      name: "Slim Fit Designer Shirt",
      basePrice: 750,
      estimatedDays: 4,
      description: "Contoured taper, French cuffs, and contrast collar band",
      complexity: "DESIGNER",
    },
  ],
  "Pants / Trousers": [
    {
      variantName: "Formal Trousers",
      name: "Formal Trousers",
      basePrice: 650,
      estimatedDays: 3,
      description: "Classic tailored dress pants with double concealed pockets and waistband",
      complexity: "REGULAR",
    },
  ],
  Dress: [
    {
      variantName: "Indo-Western Dress",
      name: "Indo-Western Flared Dress",
      basePrice: 1100,
      estimatedDays: 5,
      description: "Custom tailored maxi or midi dress with fitted waist and inner lining",
      complexity: "DESIGNER",
    },
  ],
  "Kids Wear": [
    {
      variantName: "Traditional Kids Outfit",
      name: "Kids Ethnic Ensemble",
      basePrice: 550,
      estimatedDays: 3,
      description: "Comfortable soft lining and child-safe seams",
      complexity: "REGULAR",
    },
  ],
  Uniforms: [
    {
      variantName: "School / Work Uniform",
      name: "Standard Uniform Set",
      basePrice: 500,
      estimatedDays: 3,
      description: "Reinforced double seams built for daily wear",
      complexity: "REGULAR",
    },
  ],
  Alterations: [
    {
      variantName: "Sleeve Alteration",
      name: "Sleeve Alteration",
      basePrice: 150,
      estimatedDays: 1,
      description: "Shortening, lengthening, or tapering sleeve width",
      complexity: "SIMPLE",
    },
    {
      variantName: "Length Alteration",
      name: "Length Alteration",
      basePrice: 100,
      estimatedDays: 1,
      description: "Hemming or trimming bottom length with original hem finish",
      complexity: "SIMPLE",
    },
  ],
  "Bridal / Wedding Wear": [
    {
      variantName: "Bridal Lehenga & Blouse",
      name: "Bridal Lehenga & Blouse",
      basePrice: 3500,
      estimatedDays: 10,
      description: "Heavy couture bridal lehenga with multiple can-can layers and zari border framing",
      complexity: "HEAVY_BRIDAL",
    },
  ],
  "Custom Designs": [
    {
      variantName: "Custom Bespoke Design",
      name: "Bespoke Custom Stitching",
      basePrice: 1600,
      estimatedDays: 6,
      description: "Tailored strictly from your sketch, reference photo, or original fabric",
      complexity: "DESIGNER",
    },
  ],
};

interface TailorServicePricingSectionProps {
  selectedGarments: string[];
  services: ServicePricingItem[];
  onChange: (services: ServicePricingItem[]) => void;
  error?: string | null;
}

export default function TailorServicePricingSection({
  selectedGarments,
  services,
  onChange,
  error,
}: TailorServicePricingSectionProps) {
  // State for adding a new service variant inside a specific garment category
  const [addingForCategory, setAddingForCategory] = useState<string | null>(null);
  const [varName, setVarName] = useState("");
  const [varPrice, setVarPrice] = useState<number | "">("");
  const [varDays, setVarDays] = useState<number | "">("");
  const [varDesc, setVarDesc] = useState("");
  const [varImage, setVarImage] = useState("");
  const [variantFormError, setVariantFormError] = useState<string | null>(null);

  // State for editing an existing service
  const [editingItem, setEditingItem] = useState<ServicePricingItem | null>(null);

  // State for adding a completely custom service
  const [isAddingCustomService, setIsAddingCustomService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState("");
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [customDays, setCustomDays] = useState<number | "">("");
  const [customDesc, setCustomDesc] = useState("");
  const [customImage, setCustomImage] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  // Auto-seed presets when garments are selected for the first time
  useEffect(() => {
    let updated = [...services];
    let hasChanges = false;

    selectedGarments.forEach((garment) => {
      const existingForGarment = updated.filter(
        (s) => s.category.toLowerCase() === garment.toLowerCase()
      );

      if (existingForGarment.length === 0 && DEFAULT_PRESETS[garment]) {
        // Seed default presets for this garment
        const presets = DEFAULT_PRESETS[garment].map((p, idx) => ({
          id: `srv-${Date.now()}-${garment.toLowerCase().replace(/[^a-z0-9]/g, "")}-${idx}`,
          category: garment,
          variantName: p.variantName,
          name: p.name,
          basePrice: p.basePrice,
          estimatedDays: p.estimatedDays,
          description: p.description,
          complexity: p.complexity,
        }));
        updated = [...updated, ...presets];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      onChange(updated);
    }
  }, [selectedGarments]);

  // Handle adding another service variant
  const handleSaveNewVariant = (category: string) => {
    setVariantFormError(null);
    if (!varName.trim()) {
      setVariantFormError("Service / Variant name is required.");
      return;
    }
    const numPrice = Number(varPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setVariantFormError("Price must be a valid number greater than ₹0.");
      return;
    }
    const numDays = Number(varDays);
    if (isNaN(numDays) || numDays < 1) {
      setVariantFormError("Estimated stitching time must be at least 1 day.");
      return;
    }

    const newItem: ServicePricingItem = {
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      variantName: varName.trim(),
      name: `${category} — ${varName.trim()}`,
      basePrice: numPrice,
      estimatedDays: numDays,
      description: varDesc.trim() || undefined,
      imageUrl: varImage.trim() || undefined,
      complexity: numPrice >= 2000 ? "HEAVY_BRIDAL" : numPrice >= 800 ? "DESIGNER" : "REGULAR",
    };

    onChange([...services, newItem]);
    // Reset form
    setAddingForCategory(null);
    setVarName("");
    setVarPrice("");
    setVarDays("");
    setVarDesc("");
    setVarImage("");
  };

  // Handle saving an edited service
  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.variantName.trim() && !editingItem.name.trim()) {
      alert("Service name cannot be empty.");
      return;
    }
    if (editingItem.basePrice <= 0) {
      alert("Price must be greater than ₹0.");
      return;
    }
    if (editingItem.estimatedDays < 1) {
      alert("Estimated stitching time must be at least 1 day.");
      return;
    }

    const updated = services.map((s) => (s.id === editingItem.id ? editingItem : s));
    onChange(updated);
    setEditingItem(null);
  };

  // Handle deleting a service variant
  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    onChange(updated);
  };

  // Handle adding completely custom service
  const handleSaveCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!customServiceName.trim()) {
      setCustomError("Service name is required (e.g. Indo-Western Jacket).");
      return;
    }
    const numPrice = Number(customPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setCustomError("Price must be greater than ₹0.");
      return;
    }
    const numDays = Number(customDays);
    if (isNaN(numDays) || numDays < 1) {
      setCustomError("Estimated stitching time must be at least 1 day.");
      return;
    }

    const newItem: ServicePricingItem = {
      id: `srv-custom-${Date.now()}`,
      category: "Custom Service",
      variantName: customServiceName.trim(),
      name: customServiceName.trim(),
      basePrice: numPrice,
      estimatedDays: numDays,
      description: customDesc.trim() || undefined,
      imageUrl: customImage.trim() || undefined,
      complexity: "DESIGNER",
    };

    onChange([...services, newItem]);
    // Reset custom form
    setIsAddingCustomService(false);
    setCustomServiceName("");
    setCustomPrice("");
    setCustomDays("");
    setCustomDesc("");
    setCustomImage("");
  };

  // Categories to display: selected standard garments + any categories present in services (e.g. Custom Service)
  const allDisplayCategories = Array.from(
    new Set([...selectedGarments, ...services.map((s) => s.category)])
  );

  return (
    <div className="space-y-6 pt-4 border-t border-sand/20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-sand uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sand" /> SERVICE PRICING & TURNAROUND
          </span>
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-sand-light mt-0.5">
            Set Your Services & Prices
          </h4>
          <p className="text-xs text-champagne/75 max-w-2xl leading-relaxed mt-1">
            Define your service variants, custom pricing in INR (₹), and turnaround times for each garment you stitch.
            Each tailor controls their own independent prices.
          </p>
        </div>

        {/* Button to add custom service */}
        <button
          type="button"
          onClick={() => setIsAddingCustomService(!isAddingCustomService)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-wine-dark/80 text-sand border border-sand/30 hover:border-sand/60 hover:bg-wine transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Service</span>
        </button>
      </div>

      {/* Global Validation Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom Service Drawer / Card if triggered */}
      {isAddingCustomService && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-wine-dark via-burgundy/40 to-wine-dark border border-sand/40 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex justify-between items-center border-b border-sand/15 pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sand">NEW SPECIALTY</span>
              <h5 className="font-serif text-base font-bold text-sand-light">Add Custom Service</h5>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingCustomService(false)}
              className="p-1 rounded-lg text-champagne/60 hover:text-champagne hover:bg-wine/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {customError && (
            <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/40">
              {customError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                Service Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Indo-Western Jacket"
                value={customServiceName}
                onChange={(e) => setCustomServiceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 focus:outline-none focus:border-sand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                Price in INR (₹) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 1200"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 focus:outline-none focus:border-sand font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                Estimated Time (Days) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 focus:outline-none focus:border-sand font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Custom designer bandhgala jacket with raw silk lining"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 focus:outline-none focus:border-sand"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                Sample Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 focus:outline-none focus:border-sand"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCustomService(false)}
              className="px-4 py-2 rounded-xl text-xs text-champagne/70 hover:text-champagne"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCustomService}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition shadow-sm"
            >
              Save Custom Service
            </button>
          </div>
        </div>
      )}

      {/* Zero Garments Selected State */}
      {allDisplayCategories.length === 0 ? (
        <div className="p-8 rounded-2xl bg-wine-dark/40 border border-sand/15 text-center space-y-2">
          <Scissors className="w-8 h-8 text-sand/40 mx-auto" />
          <p className="text-xs text-champagne/70">
            Please select at least one garment from <span className="text-sand font-semibold">"What Can You Stitch?"</span> above to configure its services and prices.
          </p>
        </div>
      ) : (
        /* Garment Categories List */
        <div className="space-y-6">
          {allDisplayCategories.map((category) => {
            const catServices = services.filter(
              (s) => s.category.toLowerCase() === category.toLowerCase()
            );
            const hasNoServices = catServices.length === 0;

            return (
              <div
                key={category}
                className={`p-5 sm:p-6 rounded-3xl bg-wine-dark/70 border transition space-y-4 ${
                  hasNoServices
                    ? "border-rose-500/60 shadow-lg shadow-rose-950/20"
                    : "border-sand/20 hover:border-sand/35"
                }`}
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand/15 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-sand" />
                    <div>
                      <h5 className="font-serif text-lg font-bold text-sand-light uppercase tracking-wide">
                        {category}
                      </h5>
                      <p className="text-[11px] text-champagne/60 font-mono">
                        {catServices.length} {catServices.length === 1 ? "Service Variant" : "Service Variants"} configured
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAddingForCategory(addingForCategory === category ? null : category);
                      setVariantFormError(null);
                      setVarName("");
                      setVarPrice("");
                      setVarDays("");
                      setVarDesc("");
                      setVarImage("");
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-burgundy/80 text-sand border border-sand/30 hover:bg-maroon hover:border-sand/60 transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Service</span>
                  </button>
                </div>

                {/* Validation Warning if Category has 0 Services */}
                {hasNoServices && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>
                      At least one service variant with a price greater than ₹0 is required for <strong>{category}</strong>.
                    </span>
                  </div>
                )}

                {/* Inline form to add another service variant for this category */}
                {addingForCategory === category && (
                  <div className="p-4 rounded-2xl bg-maroon/80 border border-sand/35 space-y-3 animate-in fade-in">
                    <div className="flex justify-between items-center border-b border-sand/15 pb-1.5">
                      <span className="text-[10px] font-mono uppercase text-sand">
                        Add New Variant to {category}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingForCategory(null)}
                        className="text-champagne/50 hover:text-champagne"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {variantFormError && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                        {variantFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Service Variant Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Princess Cut / Heavy Zari"
                          value={varName}
                          onChange={(e) => setVarName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-champagne placeholder:text-champagne/30 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Price in INR (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 950"
                          value={varPrice}
                          onChange={(e) => setVarPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-champagne placeholder:text-champagne/30 font-mono font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Estimated Time (Days) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 4"
                          value={varDays}
                          onChange={(e) => setVarDays(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-champagne placeholder:text-champagne/30 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Padded cups, concealed side zipper, premium lining"
                          value={varDesc}
                          onChange={(e) => setVarDesc(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-champagne placeholder:text-champagne/30 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={varImage}
                          onChange={(e) => setVarImage(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/20 text-champagne placeholder:text-champagne/30 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAddingForCategory(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-champagne/60 hover:text-champagne"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNewVariant(category)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition"
                      >
                        Save Service Variant
                      </button>
                    </div>
                  </div>
                )}

                {/* Services List for this Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-2xl bg-wine/50 border border-sand/20 hover:border-sand/40 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono uppercase bg-burgundy/70 text-sand px-2 py-0.5 rounded border border-sand/20 font-bold">
                            {srv.variantName || srv.name}
                          </span>
                          <span className="font-serif text-lg font-bold text-sand">
                            {formatINR(srv.basePrice)}
                          </span>
                        </div>

                        <h6 className="font-serif text-sm font-bold text-sand-light leading-snug">
                          {srv.name}
                        </h6>

                        {srv.description && (
                          <p className="text-[11px] text-champagne/70 line-clamp-2 leading-relaxed">
                            {srv.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-sand/10 text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-champagne/60 font-mono">
                          <Clock className="w-3 h-3 text-sand" />
                          <span>~{srv.estimatedDays} {srv.estimatedDays === 1 ? "day" : "days"}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(srv)}
                            className="p-1.5 rounded-lg bg-wine-dark/80 text-sand hover:text-sand-light border border-sand/20 hover:border-sand/40 transition"
                            title="Edit Service & Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 rounded-lg bg-wine-dark/80 text-rose-300 hover:text-rose-200 border border-rose-500/20 hover:border-rose-500/40 transition"
                            title="Delete Service Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-maroon/95 border border-sand/40 p-6 space-y-4 shadow-2xl text-champagne">
            <div className="flex justify-between items-center border-b border-sand/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-sand">
                  EDIT SERVICE PRICING
                </span>
                <h4 className="font-serif text-xl font-bold text-sand-light">
                  {editingItem.category} — {editingItem.variantName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl text-champagne/60 hover:text-champagne hover:bg-wine"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                  Service / Variant Name
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.variantName}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      variantName: e.target.value,
                      name: `${editingItem.category} — ${e.target.value}`,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                    Price in INR (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingItem.basePrice}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, basePrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                    Estimated Time (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingItem.estimatedDays}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, estimatedDays: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="Details of cuts, padding, lining, or finish..."
                  className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingItem.imageUrl || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-wine-dark border border-sand/25 text-champagne text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-sand/15">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs text-champagne/70 hover:text-champagne"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
