"use client";

import React from "react";
import { Search, ArrowUpDown } from "lucide-react";

interface FilterState {
  search: string;
  category: string;
  availability: string;
  minRating: number;
  maxPrice: number;
  sort: string;
}

interface TailorFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Garments" },
  { id: "BLOUSE", label: "Blouse" },
  { id: "KURTI", label: "Kurti" },
  { id: "SALWAR", label: "Salwar" },
  { id: "SUIT", label: "Suit" },
  { id: "SHIRT", label: "Shirt" },
  { id: "PANTS", label: "Pants" },
  { id: "DRESS", label: "Dress" },
  { id: "KIDS", label: "Kids Wear" },
  { id: "UNIFORM", label: "Uniform" },
  { id: "BRIDAL", label: "Bridal / Wedding Wear" },
  { id: "ALTERATIONS", label: "Alteration" },
  { id: "CUSTOM", label: "Custom Design" },
];

export default function TailorFilterBar({ filters, onChange }: TailorFilterBarProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-burgundy/70 dark:text-sand/70" />
          <input
            type="text"
            placeholder="Search by tailor, locality (Indiranagar, Koramangala, HSR), or specialty..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF4E8] dark:bg-[#0D080A] border border-burgundy/25 dark:border-burgundy/40 text-wine dark:text-champagne placeholder:text-maroon/40 dark:placeholder:text-champagne/40 focus:outline-none focus:border-burgundy transition shadow-sm"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-burgundy dark:text-sand" />
          <span className="text-xs text-maroon dark:text-sand font-mono font-semibold">SORT:</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl bg-[#FAF4E8] dark:bg-[#0D080A] border border-burgundy/25 dark:border-burgundy/40 text-wine dark:text-champagne focus:outline-none focus:border-burgundy shadow-sm"
          >
            <option value="recommended">Recommended & Featured</option>
            <option value="rating_desc">Highest Rated (★ 4.9+)</option>
            <option value="price_asc">Lowest Starting Price</option>
            <option value="price_desc">Premium Bridal First</option>
            <option value="fastest">Fastest Stitching (Days)</option>
            <option value="nearest">Nearest Location</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange({ ...filters, category: cat.id })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filters.category === cat.id
                ? "bg-gradient-to-r from-burgundy to-maroon text-champagne border border-sand/40 shadow-sm font-semibold"
                : "bg-[#FAF4E8] dark:bg-[#160B0E] text-wine/80 dark:text-champagne/80 border border-burgundy/20 dark:border-burgundy/40 hover:border-burgundy/50 hover:text-wine dark:hover:text-sand shadow-sm"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary Quick Toggles (Availability, Rating, Max Price) */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-burgundy/15 dark:border-burgundy/30">
        <div className="flex items-center gap-1.5">
          <span className="text-maroon/80 dark:text-sand font-mono text-[11px] font-semibold">Availability:</span>
          <select
            value={filters.availability}
            onChange={(e) => onChange({ ...filters, availability: e.target.value })}
            className="px-2.5 py-1 rounded-lg bg-[#FAF4E8] dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40 text-wine dark:text-champagne text-xs"
          >
            <option value="ALL">All Tailors</option>
            <option value="AVAILABLE">Currently Accepting Orders</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-maroon/80 dark:text-sand font-mono text-[11px] font-semibold">Minimum Rating:</span>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: parseFloat(e.target.value) })}
            className="px-2.5 py-1 rounded-lg bg-[#FAF4E8] dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40 text-wine dark:text-champagne text-xs"
          >
            <option value="0">Any Rating</option>
            <option value="4.5">★ 4.5 & above</option>
            <option value="4.8">★ 4.8 & above</option>
            <option value="4.9">★ 4.9 & above</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-maroon/80 dark:text-sand font-mono text-[11px] font-semibold">Max Price:</span>
          <select
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: parseFloat(e.target.value) })}
            className="px-2.5 py-1 rounded-lg bg-[#FAF4E8] dark:bg-[#0D080A] border border-burgundy/20 dark:border-burgundy/40 text-wine dark:text-champagne text-xs"
          >
            <option value="99999">Any Budget</option>
            <option value="600">Under ₹600</option>
            <option value="1000">Under ₹1,000</option>
            <option value="1500">Under ₹1,500</option>
            <option value="2500">Under ₹2,500</option>
            <option value="5000">Under ₹5,000</option>
          </select>
        </div>

        {(filters.search ||
          filters.category !== "ALL" ||
          filters.availability !== "ALL" ||
          filters.minRating > 0 ||
          filters.maxPrice < 99999) && (
          <button
            onClick={() =>
              onChange({
                search: "",
                category: "ALL",
                availability: "ALL",
                minRating: 0,
                maxPrice: 99999,
                sort: "recommended",
              })
            }
            className="text-xs text-burgundy dark:text-sand hover:text-maroon dark:hover:text-sand-light underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
