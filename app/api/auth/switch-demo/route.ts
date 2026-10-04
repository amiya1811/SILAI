import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";
import { UserSession } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    let targetEmail = "priya@example.com";
    if (role === "TAILOR") targetEmail = "meera@example.com";
    if (role === "DELIVERY_PARTNER") targetEmail = "rahul@example.com";
    if (role === "ADMIN") targetEmail = "amiyaranjanpatra1811@gmail.com";

    const dbUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Demo user account not found in database. Please run seed." }, { status: 404 });
    }

    const userSession: UserSession = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: dbUser.role as any,
      phone: dbUser.phone || undefined,
      avatarUrl: dbUser.avatarUrl || undefined,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: `Switched active role to ${dbUser.role} (${dbUser.fullName})`,
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
    console.error("switch-demo error:", err);
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}
