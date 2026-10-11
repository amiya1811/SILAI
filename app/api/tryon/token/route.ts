import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/session";
import { createDecartClientToken } from "@/lib/tryon/providers/decart";

export const dynamic = "force-dynamic";

// In-memory sliding window rate limiter: max 15 token requests per minute per IP/user
const tokenRequestLog = new Map<string, number[]>();

function checkRateLimit(key: string, limit: number = 15, windowMs: number = 60000): boolean {
  const now = Date.now();
  const timestamps = (tokenRequestLog.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    return false;
  }
  timestamps.push(now);
  tokenRequestLog.set(key, timestamps);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Identify user (Authenticated customer or guest visitor)
    const user = getUserFromRequest(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const clientId = user ? user.id : `guest_${ip}`;

    // 2. Enforce Rate Limiting (Strict protection against quota abuse)
    if (!checkRateLimit(`token_${clientId}`)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many try-on session requests. Please wait a moment before reconnecting.",
        },
        { status: 429 }
      );
    }

    // 3. Obtain short-lived client token from Decart (permanent API key remains strictly server-side)
    // Omit strict origin restriction to prevent localhost vs 127.0.0.1 mismatch failures
    const result = await createDecartClientToken({
      userId: clientId,
    });

    if (!result.success || !result.token) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create Decart live session token.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt,
      model: "lucy-vton-3.6",
      isGuest: !user,
    });
  } catch (error: any) {
    console.error("POST /api/tryon/token error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error generating live try-on token.",
      },
      { status: 500 }
    );
  }
}
