"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";
import { Plus, Trash2, Edit2, Check, X, AlertCircle } from "lucide-react";

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
  // Inline add state: which garment category currently has the "+ Add Service" form open
  const [activeGarmentCategory, setActiveGarmentCategory] = useState<string | null>(null);
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [priceInput, setPriceInput] = useState<number | "">("");
  const [daysInput, setDaysInput] = useState<number | "">("");
  const [formError, setFormError] = useState<string | null>(null);

  // Edit state: which service is currently being edited
  const [editingItem, setEditingItem] = useState<ServicePricingItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editDays, setEditDays] = useState<number | "">("");

  // Custom service adder state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [customDays, setCustomDays] = useState<number | "">("");
  const [customError, setCustomError] = useState<string | null>(null);

  // Open inline add form for a garment
  const handleOpenAdd = (garment: string) => {
    setActiveGarmentCategory(garment);
    setServiceNameInput("");
    setPriceInput("");
    setDaysInput("");
    setFormError(null);
  };

  // Save new service under a garment
  const handleSaveService = (garment: string) => {
    setFormError(null);
    if (!serviceNameInput.trim()) {
      setFormError("Service name is required (e.g. Simple Blouse, Designer Kurti).");
      return;
    }
    const numPrice = Number(priceInput);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError("Price must be a valid number greater than ₹0.");
      return;
    }
    const numDays = Number(daysInput);
    if (isNaN(numDays) || numDays < 1) {
      setFormError("Estimated time must be at least 1 day.");
      return;
    }

    const newItem: ServicePricingItem = {
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: garment,
      variantName: serviceNameInput.trim(),
      name: serviceNameInput.trim(),
      basePrice: numPrice,
      estimatedDays: numDays,
      complexity: numPrice >= 2000 ? "HEAVY_BRIDAL" : numPrice >= 800 ? "DESIGNER" : "REGULAR",
    };

    onChange([...services, newItem]);
    setActiveGarmentCategory(null);
    setServiceNameInput("");
    setPriceInput("");
    setDaysInput("");
  };

  // Delete a service
  const handleDeleteService = (id: string) => {
    onChange(services.filter((s) => s.id !== id));
  };

  // Start editing a service
  const handleStartEdit = (item: ServicePricingItem) => {
    setEditingItem(item);
    setEditName(item.name || item.variantName);
    setEditPrice(item.basePrice);
    setEditDays(item.estimatedDays);
  };

  // Save edited service
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editName.trim()) {
      alert("Service name cannot be empty.");
      return;
    }
    const numPrice = Number(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("Price must be greater than ₹0.");
      return;
    }
    const numDays = Number(editDays);
    if (isNaN(numDays) || numDays < 1) {
      alert("Estimated time must be at least 1 day.");
      return;
    }

    const updated = services.map((s) =>
      s.id === editingItem.id
        ? {
            ...s,
            name: editName.trim(),
            variantName: editName.trim(),
            basePrice: numPrice,
            estimatedDays: numDays,
          }
        : s
    );

    onChange(updated);
    setEditingItem(null);
  };

  // Save custom service
  const handleSaveCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!customName.trim()) {
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
      setCustomError("Estimated time must be at least 1 day.");
      return;
    }

    const newItem: ServicePricingItem = {
      id: `srv-custom-${Date.now()}`,
      category: "Custom Service",
      variantName: customName.trim(),
      name: customName.trim(),
      basePrice: numPrice,
      estimatedDays: numDays,
      complexity: "DESIGNER",
    };

    onChange([...services, newItem]);
    setIsAddingCustom(false);
    setCustomName("");
    setCustomPrice("");
    setCustomDays("");
  };

  // Custom services already added
  const customServices = services.filter((s) => s.category.toLowerCase() === "custom service");

  return (
    <div className="space-y-6 pt-6 border-t border-sand/20 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand/15 pb-3">
        <div>
          <h4 className="font-serif text-xl font-bold text-sand-light">
            Set Your Services & Prices
          </h4>
          <p className="text-xs text-champagne/70 mt-0.5">
            Add service names, prices, and turnaround times for the garments you selected.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-burgundy/80 text-sand border border-sand/30 hover:bg-maroon hover:border-sand/60 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Custom Service</span>
        </button>
      </div>

      {/* Global Validation Error */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom Service Drawer */}
      {isAddingCustom && (
        <div className="p-4 rounded-2xl bg-maroon/90 border border-sand/35 space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-sand/15 pb-2">
            <h5 className="font-serif text-sm font-bold text-sand-light uppercase tracking-wider">
              Add Custom Service
            </h5>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-champagne/60 hover:text-champagne"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {customError && (
            <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
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
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 text-xs"
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
                className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono font-bold text-xs"
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
                className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1 rounded-lg text-xs text-champagne/60 hover:text-champagne"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCustomService}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition"
            >
              Save Custom Service
            </button>
          </div>
        </div>
      )}

      {/* 3. IF NO GARMENT IS SELECTED */}
      {selectedGarments.length === 0 && customServices.length === 0 ? (
        <div className="py-6 text-center rounded-2xl bg-wine-dark/40 border border-sand/15">
          <p className="text-xs text-champagne/70 italic">
            Select a garment above to add your services and prices.
          </p>
        </div>
      ) : (
        /* 2. ONLY SELECTED GARMENTS SHOULD APPEAR BELOW */
        <div className="space-y-4">
          {selectedGarments.map((garment) => {
            const garmentServices = services.filter(
              (s) => s.category.toLowerCase() === garment.toLowerCase()
            );

            return (
              <div
                key={garment}
                className="p-4 sm:p-5 rounded-2xl bg-wine-dark/60 border border-sand/20 space-y-3"
              >
                {/* Garment Title Header */}
                <div className="flex items-center justify-between border-b border-sand/10 pb-2">
                  <h5 className="font-serif text-base font-bold text-sand uppercase tracking-wider">
                    {garment}
                  </h5>

                  <button
                    type="button"
                    onClick={() => handleOpenAdd(garment)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-wine border border-sand/25 text-sand hover:bg-burgundy hover:border-sand/50 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Service</span>
                  </button>
                </div>

                {/* Inline Add Form */}
                {activeGarmentCategory === garment && (
                  <div className="p-3.5 rounded-xl bg-maroon/70 border border-sand/30 space-y-3 animate-in fade-in">
                    <div className="flex justify-between items-center border-b border-sand/10 pb-1">
                      <span className="text-[11px] font-mono text-sand uppercase">
                        New Service for {garment}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveGarmentCategory(null)}
                        className="text-champagne/50 hover:text-champagne"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {formError && (
                      <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Simple Blouse"
                          value={serviceNameInput}
                          onChange={(e) => setServiceNameInput(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne placeholder:text-champagne/30 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Price in INR (₹) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 600"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                          Estimated Time (Days) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 3"
                          value={daysInput}
                          onChange={(e) => setDaysInput(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveGarmentCategory(null)}
                        className="px-3 py-1 rounded-lg text-xs text-champagne/60 hover:text-champagne"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveService(garment)}
                        className="px-4 py-1 rounded-lg text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. ONLY ADDED SERVICES SHOULD BE DISPLAYED */}
                {garmentServices.length === 0 ? (
                  <p className="text-xs text-champagne/50 italic py-1">
                    No services added yet. Click <span className="text-sand font-medium">+ Add Service</span> above to define pricing.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-sand/15 text-[10px] font-mono text-sand/80 uppercase">
                          <th className="py-2 pr-4 font-normal">Service Name</th>
                          <th className="py-2 px-4 font-normal">Price</th>
                          <th className="py-2 px-4 font-normal">Time</th>
                          <th className="py-2 pl-4 text-right font-normal">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand/10">
                        {garmentServices.map((srv) => (
                          <tr key={srv.id} className="hover:bg-wine/30 transition">
                            <td className="py-2.5 pr-4 font-serif font-bold text-sand-light text-sm">
                              {srv.name}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-sand text-sm">
                              {formatINR(srv.basePrice)}
                            </td>
                            <td className="py-2.5 px-4 text-champagne/80 font-mono">
                              {srv.estimatedDays} {srv.estimatedDays === 1 ? "day" : "days"}
                            </td>
                            <td className="py-2.5 pl-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(srv)}
                                  className="px-2 py-1 rounded bg-wine text-sand hover:text-sand-light hover:bg-maroon transition text-[11px] flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="px-2 py-1 rounded bg-wine text-rose-300 hover:text-rose-200 hover:bg-rose-950/60 transition text-[11px] flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Services Section if any were added */}
          {customServices.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-wine-dark/60 border border-sand/20 space-y-3">
              <div className="flex items-center justify-between border-b border-sand/10 pb-2">
                <h5 className="font-serif text-base font-bold text-sand uppercase tracking-wider">
                  Custom Services
                </h5>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-wine border border-sand/25 text-sand hover:bg-burgundy hover:border-sand/50 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Custom Service</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-sand/15 text-[10px] font-mono text-sand/80 uppercase">
                      <th className="py-2 pr-4 font-normal">Service Name</th>
                      <th className="py-2 px-4 font-normal">Price</th>
                      <th className="py-2 px-4 font-normal">Time</th>
                      <th className="py-2 pl-4 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/10">
                    {customServices.map((srv) => (
                      <tr key={srv.id} className="hover:bg-wine/30 transition">
                        <td className="py-2.5 pr-4 font-serif font-bold text-sand-light text-sm">
                          {srv.name}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-sand text-sm">
                          {formatINR(srv.basePrice)}
                        </td>
                        <td className="py-2.5 px-4 text-champagne/80 font-mono">
                          {srv.estimatedDays} {srv.estimatedDays === 1 ? "day" : "days"}
                        </td>
                        <td className="py-2.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(srv)}
                              className="px-2 py-1 rounded bg-wine text-sand hover:text-sand-light hover:bg-maroon transition text-[11px] flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(srv.id)}
                              className="px-2 py-1 rounded bg-wine text-rose-300 hover:text-rose-200 hover:bg-rose-950/60 transition text-[11px] flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simple Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-maroon border border-sand/40 p-5 space-y-4 shadow-2xl text-champagne">
            <div className="flex justify-between items-center border-b border-sand/20 pb-2">
              <h5 className="font-serif text-base font-bold text-sand-light">
                Edit {editingItem.category} Service
              </h5>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-champagne/60 hover:text-champagne"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                    Price in INR (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-sand uppercase mb-1">
                    Time (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editDays}
                    onChange={(e) => setEditDays(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-wine-dark border border-sand/25 text-champagne font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-sand/15">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1 rounded-lg text-xs text-champagne/60 hover:text-champagne"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sand text-wine-dark hover:bg-sand-light transition"
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
