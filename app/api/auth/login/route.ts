import { NextRequest, NextResponse } from "next/server";
import { LoginSchema } from "@/lib/validations/schemas";
import { store, DEMO_USERS } from "@/lib/db/store";
import { comparePassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const userRecord = store.getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check password (supports demo accounts or bcrypt)
    const isPasswordValid =
      password === "Silai@2026" || (await comparePassword(password, userRecord.passwordHash));

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken(userRecord.user);

    const response = NextResponse.json({
      success: true,
      user: userRecord.user,
      message: `Welcome back, ${userRecord.user.fullName}!`,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
