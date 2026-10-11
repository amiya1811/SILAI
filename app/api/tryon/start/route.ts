import { NextRequest, NextResponse } from "next/server";
import { updateDbSession } from "@/lib/tryon/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, providerSessionId, selectedGarmentId } = body;

    if (sessionId) {
      await updateDbSession(sessionId, {
        status: "LIVE",
        providerSessionId,
        selectedGarmentId,
        startedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, status: "LIVE" });
  } catch (error: any) {
    return NextResponse.json({ success: true, status: "LIVE" });
  }
}
