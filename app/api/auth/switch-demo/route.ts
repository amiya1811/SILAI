import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS } from "@/lib/db/store";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    let targetEmail = "priya@example.com";
    if (role === "TAILOR") targetEmail = "meera@example.com";
    if (role === "DELIVERY_PARTNER") targetEmail = "rahul@example.com";
    if (role === "ADMIN") targetEmail = "admin@silai.luxury";

    const demoRecord = DEMO_USERS[targetEmail];
    if (!demoRecord) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    const token = signToken(demoRecord.user);

    const response = NextResponse.json({
      success: true,
      user: demoRecord.user,
      message: `Switched active role to ${demoRecord.user.role} (${demoRecord.user.fullName})`,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}
