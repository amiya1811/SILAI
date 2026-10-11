import { NextRequest, NextResponse } from "next/server";
import { endDbSession } from "@/lib/tryon/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (sessionId) {
      await endDbSession(sessionId);
    }

    return NextResponse.json({ success: true, status: "STOPPED" });
  } catch (error: any) {
    return NextResponse.json({ success: true, status: "STOPPED" });
  }
}
