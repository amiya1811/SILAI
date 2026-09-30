import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validations/schemas";
import { store } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";
import { UserSession } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, fullName, phone, role } = parsed.data;

    // Check if email already registered
    const existing = store.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser: UserSession = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase().trim(),
      fullName,
      phone,
      role: role as any,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    };

    store.registerUser(newUser, passwordHash);
    const token = signToken(newUser);

    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: "Account created successfully!",
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
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
