import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/session";
import { createDbSession } from "@/lib/tryon/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const userId = user ? user.id : `guest_${ip}`;

    const body = await request.json().catch(() => ({}));
    const { selectedGarmentId, provider } = body;

    const session = await createDbSession({
      userId,
      provider: provider || "DECART_LUCY",
      selectedGarmentId,
    });

    return NextResponse.json({
      success: true,
      session,
      isGuest: !user,
    });
  } catch (error: any) {
    console.error("POST /api/tryon/session error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize Try-On session." },
      { status: 500 }
    );
  }
}
