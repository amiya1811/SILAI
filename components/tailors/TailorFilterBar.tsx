"use client";

import React from "react";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

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
  { id: "SUIT", label: "Salwar Suit" },
  { id: "LEHENGA", label: "Lehenga" },
  { id: "SHIRT", label: "Men's Shirt" },
  { id: "PANTS", label: "Trousers" },
  { id: "ALTERATIONS", label: "Alterations" },
];

export default function TailorFilterBar({ filters, onChange }: TailorFilterBarProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-sand/60" />
          <input
            type="text"
            placeholder="Search by tailor, city (South Ex, Bandra, Jaipur), or specialty..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-wine-dark/80 border border-sand/20 text-champagne placeholder:text-champagne/40 focus:outline-none focus:border-sand transition"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-sand" />
          <span className="text-xs text-sand/80 font-mono">SORT:</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="px-3 py-2 text-xs rounded-xl bg-wine-dark/80 border border-sand/20 text-champagne focus:outline-none focus:border-sand"
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
                ? "bg-gradient-to-r from-burgundy to-maroon text-sand-light border border-sand shadow-sm"
                : "bg-wine-dark/60 text-champagne/70 border border-sand/15 hover:border-sand/40 hover:text-champagne"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary Quick Toggles (Availability, Rating, Max Price) */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-sand/10">
        <div className="flex items-center gap-1.5">
          <span className="text-champagne/60 font-mono text-[11px]">Availability:</span>
          <select
            value={filters.availability}
            onChange={(e) => onChange({ ...filters, availability: e.target.value })}
            className="px-2.5 py-1 rounded-lg bg-wine-dark border border-sand/20 text-champagne text-xs"
          >
            <option value="ALL">All Tailors</option>
            <option value="AVAILABLE">Currently Accepting Orders</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-champagne/60 font-mono text-[11px]">Minimum Rating:</span>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: parseFloat(e.target.value) })}
            className="px-2.5 py-1 rounded-lg bg-wine-dark border border-sand/20 text-champagne text-xs"
          >
            <option value="0">Any Rating</option>
            <option value="4.5">★ 4.5 & above</option>
            <option value="4.8">★ 4.8 & above</option>
            <option value="4.9">★ 4.9 & above</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-champagne/60 font-mono text-[11px]">Max Price:</span>
          <select
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: parseFloat(e.target.value) })}
            className="px-2.5 py-1 rounded-lg bg-wine-dark border border-sand/20 text-champagne text-xs"
          >
            <option value="99999">Any Budget</option>
            <option value="600">Under ₹600</option>
            <option value="1000">Under ₹1,000</option>
            <option value="1500">Under ₹1,500</option>
            <option value="2500">Under ₹2,500</option>
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
            className="text-xs text-sand underline hover:text-sand-light ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
