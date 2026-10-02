import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const availability = searchParams.get("availability");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "99999");
    const sort = searchParams.get("sort") || "recommended";

    let tailors = store.getTailors();

    // Text search
    if (search) {
      tailors = tailors.filter(
        (t) =>
          t.businessName.toLowerCase().includes(search) ||
          t.city.toLowerCase().includes(search) ||
          t.specializations.some((s) => s.toLowerCase().includes(search)) ||
          t.bio?.toLowerCase().includes(search)
      );
    }

    // Availability filter
    if (availability && availability !== "ALL") {
      tailors = tailors.filter((t) => t.availability === availability);
    }

    // Rating filter
    if (minRating > 0) {
      tailors = tailors.filter((t) => t.rating >= minRating);
    }

    // Category filter (tailor must offer at least one item in that category or matching specialization)
    if (category && category !== "ALL") {
      const target = category.toUpperCase();
      tailors = tailors.filter((t) =>
        t.menuItems.some((m) => {
          const mCat = m.category.toUpperCase();
          if (mCat === target) return true;
          if ((target === "SALWAR" || target === "SUIT") && (mCat.includes("SALWAR") || mCat.includes("SUIT"))) return true;
          if (target === "BRIDAL" && (mCat.includes("BRIDAL") || mCat.includes("LEHENGA"))) return true;
          if (target === "ALTERATIONS" && mCat.includes("ALTER")) return true;
          return mCat.includes(target) || target.includes(mCat);
        }) ||
        t.specializations.some((s) => s.toUpperCase().includes(target))
      );
    }

    // Max Price filter (based on minimum starting price in tailor's menu)
    if (maxPrice < 99999) {
      tailors = tailors.filter((t) => {
        const minMenuPrice = Math.min(...t.menuItems.map((m) => m.basePrice), 99999);
        return minMenuPrice <= maxPrice;
      });
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        tailors.sort((a, b) => {
          const minA = Math.min(...a.menuItems.map((m) => m.basePrice), 99999);
          const minB = Math.min(...b.menuItems.map((m) => m.basePrice), 99999);
          return minA - minB;
        });
        break;
      case "price_desc":
        tailors.sort((a, b) => {
          const minA = Math.min(...a.menuItems.map((m) => m.basePrice), 0);
          const minB = Math.min(...b.menuItems.map((m) => m.basePrice), 0);
          return minB - minA;
        });
        break;
      case "rating_desc":
        tailors.sort((a, b) => b.rating - a.rating);
        break;
      case "fastest":
        tailors.sort((a, b) => a.avgStitchingDays - b.avgStitchingDays);
        break;
      case "nearest":
        tailors.sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99));
        break;
      case "recommended":
      default:
        // Weighted composite score: rating * 0.7 + reviewCount * 0.001
        tailors.sort((a, b) => b.rating * 100 + b.reviewCount - (a.rating * 100 + a.reviewCount));
        break;
    }

    return NextResponse.json({
      success: true,
      total: tailors.length,
      tailors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to retrieve tailors" }, { status: 500 });
  }
}
