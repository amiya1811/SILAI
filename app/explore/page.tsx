"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TailorProfile } from "@/lib/types";
import TailorCard from "@/components/tailors/TailorCard";
import TailorFilterBar from "@/components/tailors/TailorFilterBar";
import { Scissors } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("designGarment") || "ALL";

  const [filters, setFilters] = useState({
    search: "",
    category: initialCategory,
    availability: "ALL",
    minRating: 0,
    maxPrice: 99999,
    sort: "recommended",
  });

  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch filtered tailors
  useEffect(() => {
    async function loadTailors() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category !== "ALL") params.set("category", filters.category);
        if (filters.availability !== "ALL") params.set("availability", filters.availability);
        if (filters.minRating > 0) params.set("minRating", filters.minRating.toString());
        if (filters.maxPrice < 99999) params.set("maxPrice", filters.maxPrice.toString());
        params.set("sort", filters.sort);

        const res = await fetch(`/api/tailors?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTailors(Array.isArray(data?.tailors) ? data.tailors : []);
        }
      } catch (err) {
        console.error("Failed to load tailors", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTailors();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-mono tracking-[0.25em] text-sand font-semibold uppercase">
          DISCOVER & COMPARE
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-champagne-light">
          Master Tailors & Boutiques
        </h1>
        <p className="text-sm text-champagne/80 max-w-2xl leading-relaxed">
          Browse vetted master karigars, compare stitching rates, turnaround days, and book doorstep fabric pickup.
        </p>
      </div>

      {/* Filter Bar */}
      <TailorFilterBar filters={filters} onChange={setFilters} />

      {/* Tailor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-[#FAF4E8]/80 dark:bg-[#160B0E]/80 border border-burgundy/15 dark:border-burgundy/40" />
          ))}
        </div>
      ) : tailors.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#FAF4E8] dark:bg-[#160B0E] border border-burgundy/20 dark:border-burgundy/40 space-y-3 shadow-sm">
          <Scissors className="w-10 h-10 text-burgundy dark:text-sand/60 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-wine dark:text-champagne">No tailors match these filters</h3>
          <p className="text-xs text-maroon/80 dark:text-champagne/70 max-w-md mx-auto">
            Try adjusting your search criteria, widening the budget range, or selecting "All Garments".
          </p>
          <button
            onClick={() =>
              setFilters({
                search: "",
                category: "ALL",
                availability: "ALL",
                minRating: 0,
                maxPrice: 99999,
                sort: "recommended",
              })
            }
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-burgundy to-maroon text-champagne border border-sand/40 hover:bg-maroon transition mt-2 shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tailors.map((tailor) => (
            <TailorCard key={tailor.id} tailor={tailor} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExploreTailorsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sand font-mono text-xs">
          Loading Ateliers & Boutiques...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
