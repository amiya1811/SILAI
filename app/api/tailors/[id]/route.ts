import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";

function formatTailor(t: any) {
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
    distanceKm: 3.5,
    availability: t.availability,
    specializations,
    avgStitchingDays: t.avgStitchingDays,
    isVerified: t.isVerified,
    commissionRate: t.commissionRate,
    coverImageUrl: t.coverImageUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    avatarUrl: t.user?.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    menuItems: (t.menuItems || []).map((m: any) => ({
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
    portfolios: (t.portfolios || []).map((p: any) => ({
      id: p.id,
      tailorId: p.tailorId,
      title: p.title,
      description: p.description || "",
      garmentCategory: p.garmentCategory,
      imageUrl: p.imageUrl,
      tags: p.tags ? (typeof p.tags === "string" ? p.tags.split(",") : []).map((s: string) => (s || "").trim()) : [],
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let targetTailorId = params.id;
    if (params.id === "me") {
      const auth = requireAuth(request);
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }
      const myTailor = await prisma.tailorProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!myTailor) {
        return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      }
      targetTailorId = myTailor.id;
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: targetTailorId },
      include: {
        menuItems: true,
        portfolios: true,
        user: true,
      },
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { tailorId: targetTailorId },
      include: {
        customer: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      customerId: r.customerId,
      customerName: r.customer?.user?.fullName || "Verified Customer",
      tailorId: r.tailorId,
      rating: r.rating,
      fitRating: r.fitRating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      tailor: formatTailor(tailor),
      reviews: formattedReviews,
    });
  } catch (error: any) {
    console.error("GET /api/tailors/[id] error:", error);
    return NextResponse.json({ error: "Failed to retrieve tailor details" }, { status: 500 });
  }
}

async function handleUpdate(
  request: NextRequest,
  params: { id: string }
) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let targetTailorId = params.id;
    if (params.id === "me") {
      const myTailor = await prisma.tailorProfile.findUnique({
        where: { userId: auth.user.id },
      });
      if (!myTailor) {
        return NextResponse.json({ error: "Tailor profile not found" }, { status: 404 });
      }
      targetTailorId = myTailor.id;
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: targetTailorId },
    });

    if (!tailor) {
      return NextResponse.json({ error: "Tailor not found" }, { status: 404 });
    }

    // Backend ownership verification: Tailor must own this profile or be admin
    const isOwner = tailor.userId === auth.user.id || auth.user.role === "ADMIN";
    if (!isOwner) {
      return NextResponse.json(
        { error: "Access denied. You do not own this tailor profile." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      availability,
      businessName,
      tagline,
      bio,
      experienceYears,
      city,
      address,
      specializations,
      stitchingCapabilities,
      avgStitchingDays,
      coverImageUrl,
      ownerName,
      phone,
      avatarUrl,
      menuItems,
    } = body;

    const rawCaps = specializations !== undefined ? specializations : stitchingCapabilities;
    const specializationsStr = Array.isArray(rawCaps)
      ? rawCaps.join(", ")
      : rawCaps !== undefined
      ? String(rawCaps)
      : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update TailorProfile
      const t = await tx.tailorProfile.update({
        where: { id: targetTailorId },
        data: {
          ...(availability !== undefined ? { availability } : {}),
          ...(businessName !== undefined ? { businessName } : {}),
          ...(tagline !== undefined ? { tagline } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(experienceYears !== undefined ? { experienceYears: Number(experienceYears) } : {}),
          ...(city !== undefined ? { city } : {}),
          ...(address !== undefined ? { address } : {}),
          ...(specializationsStr !== undefined ? { specializations: specializationsStr } : {}),
          ...(avgStitchingDays !== undefined ? { avgStitchingDays: Number(avgStitchingDays) } : {}),
          ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
        },
        include: {
          menuItems: true,
          portfolios: true,
          user: true,
        },
      });

      // 2. Update linked User if user details are provided
      if (avatarUrl || phone || ownerName) {
        await tx.user.update({
          where: { id: tailor.userId },
          data: {
            ...(avatarUrl ? { avatarUrl } : {}),
            ...(phone ? { phone } : {}),
            ...(ownerName ? { fullName: ownerName } : {}),
          },
        });
      }

      // 3. Upsert menu items if provided
      if (Array.isArray(menuItems)) {
        for (const item of menuItems) {
          if (!item.name || !item.basePrice) continue;
          if (item.id && !item.id.startsWith("temp-")) {
            await tx.menuItem.updateMany({
              where: { id: item.id, tailorId: targetTailorId },
              data: {
                name: item.name,
                category: (item.category || "CUSTOM").toUpperCase(),
                basePrice: Number(item.basePrice),
                estimatedDays: Number(item.estimatedDays || 4),
                description: item.description || null,
                complexity: item.complexity || "REGULAR",
                isAvailable: item.isAvailable ?? true,
              },
            });
          } else {
            await tx.menuItem.create({
              data: {
                tailorId: targetTailorId,
                name: item.name,
                category: (item.category || "CUSTOM").toUpperCase(),
                basePrice: Number(item.basePrice),
                estimatedDays: Number(item.estimatedDays || 4),
                description: item.description || null,
                complexity: item.complexity || "REGULAR",
                isAvailable: true,
              },
            });
          }
        }
      }

      return tx.tailorProfile.findUnique({
        where: { id: targetTailorId },
        include: {
          menuItems: true,
          portfolios: true,
          user: true,
        },
      });
    }, { timeout: 15000, maxWait: 10000 });

    return NextResponse.json({
      success: true,
      tailor: formatTailor(updated),
    });
  } catch (error: any) {
    console.error("Update tailor error:", error);
    return NextResponse.json({ error: "Failed to update tailor profile" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleUpdate(request, params);
}
