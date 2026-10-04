import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const availability = searchParams.get("availability");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "99999");
    const sort = searchParams.get("sort") || "recommended";

    const dbTailors = await prisma.tailorProfile.findMany({
      where: {
        isVerified: true,
      },
      include: {
        menuItems: {
          where: { isAvailable: true },
        },
        portfolios: true,
        user: {
          select: {
            avatarUrl: true,
            fullName: true,
          },
        },
      },
    });

    let tailors = dbTailors.map((t) => {
      const specializations = t.specializations
        ? (typeof t.specializations === "string" ? t.specializations.split(",") : Array.isArray(t.specializations) ? t.specializations : []).map((s: string) => (s || "").trim()).filter(Boolean)
        : [];

      return {
        id: t.id,
        userId: t.userId,
        businessName: t.businessName || "Master Tailor",
        tagline: t.tagline || "",
        bio: t.bio || "",
        experienceYears: t.experienceYears,
        rating: t.rating,
        reviewCount: t.reviewCount,
        city: t.city || "Bangalore",
        address: t.address || "Studio Address",
        distanceKm: 3.5, // Standard local radius
        availability: t.availability,
        specializations,
        avgStitchingDays: t.avgStitchingDays,
        isVerified: t.isVerified,
        commissionRate: t.commissionRate,
        coverImageUrl: t.coverImageUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
        avatarUrl: t.user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
        menuItems: (t.menuItems || []).map((m) => ({
          id: m.id,
          tailorId: m.tailorId,
          category: m.category,
          name: m.name,
          description: m.description || "",
          basePrice: m.basePrice,
          estimatedDays: m.estimatedDays,
          complexity: m.complexity,
          isAvailable: m.isAvailable,
        })),
        portfolios: (t.portfolios || []).map((p) => ({
          id: p.id,
          tailorId: p.tailorId,
          title: p.title,
          description: p.description || "",
          garmentCategory: p.garmentCategory,
          imageUrl: p.imageUrl,
          tags: p.tags ? (typeof p.tags === "string" ? p.tags.split(",") : []).map((s: string) => (s || "").trim()) : [],
        })),
      };
    });

    // Text search filter
    if (search) {
      tailors = tailors.filter(
        (t) =>
          (t.businessName || "").toLowerCase().includes(search) ||
          (t.city || "").toLowerCase().includes(search) ||
          (t.specializations || []).some((s: string) => (s || "").toLowerCase().includes(search)) ||
          (t.bio || "").toLowerCase().includes(search)
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

    // Category filter
    if (category && category !== "ALL") {
      const target = category.toUpperCase();
      tailors = tailors.filter(
        (t) =>
          (t.menuItems || []).some((m) => {
            const mCat = (m.category || "").toUpperCase();
            if (mCat === target) return true;
            if ((target === "SALWAR" || target === "SUIT") && (mCat.includes("SALWAR") || mCat.includes("SUIT"))) return true;
            if (target === "BRIDAL" && (mCat.includes("BRIDAL") || mCat.includes("LEHENGA"))) return true;
            if (target === "ALTERATIONS" && mCat.includes("ALTER")) return true;
            return mCat.includes(target) || target.includes(mCat);
          }) ||
          (t.specializations || []).some((s: string) => (s || "").toUpperCase().includes(target))
      );
    }

    // Max Price filter
    if (maxPrice < 99999) {
      tailors = tailors.filter((t) => {
        if (t.menuItems.length === 0) return true;
        const minMenuPrice = Math.min(...t.menuItems.map((m) => m.basePrice));
        return minMenuPrice <= maxPrice;
      });
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        tailors.sort((a, b) => {
          const minA = a.menuItems.length > 0 ? Math.min(...a.menuItems.map((m) => m.basePrice)) : 99999;
          const minB = b.menuItems.length > 0 ? Math.min(...b.menuItems.map((m) => m.basePrice)) : 99999;
          return minA - minB;
        });
        break;
      case "price_desc":
        tailors.sort((a, b) => {
          const maxA = a.menuItems.length > 0 ? Math.max(...a.menuItems.map((m) => m.basePrice)) : 0;
          const maxB = b.menuItems.length > 0 ? Math.max(...b.menuItems.map((m) => m.basePrice)) : 0;
          return maxB - maxA;
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
        tailors.sort((a, b) => b.rating * 100 + b.reviewCount - (a.rating * 100 + a.reviewCount));
        break;
    }

    return NextResponse.json({
      success: true,
      total: tailors.length,
      tailors,
    });
  } catch (error: any) {
    console.error("GET /api/tailors error:", error);
    return NextResponse.json({ error: "Failed to retrieve tailors" }, { status: 500 });
  }
}
