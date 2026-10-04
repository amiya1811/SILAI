import { NextRequest, NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validations/schemas";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";
import { UserSession } from "@/lib/types";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, fullName, phone, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered in PostgreSQL
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = (role as Role) || Role.CUSTOMER;
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName,
          phone: phone || null,
          role: assignedRole,
          avatarUrl,
          isVerified: true,
          isActive: true,
        },
      });

      if (assignedRole === Role.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: createdUser.id,
            city: "Delhi NCR",
            preferredLanguage: "English",
          },
        });
      } else if (assignedRole === Role.TAILOR) {
        await tx.tailorProfile.create({
          data: {
            userId: createdUser.id,
            businessName: fullName,
            city: "Delhi NCR",
            address: "Studio Address Pending",
            specializations: "Custom Stitching",
            experienceYears: 1,
            rating: 5.0,
            availability: "AVAILABLE",
          },
        });
      } else if (assignedRole === Role.DELIVERY_PARTNER) {
        await tx.deliveryProfile.create({
          data: {
            userId: createdUser.id,
            vehicleType: "Two-Wheeler",
            currentCity: "Delhi NCR",
            isOnline: true,
          },
        });
      }

      return createdUser;
    });

    const userSession: UserSession = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone || undefined,
      role: newUser.role as any,
      avatarUrl: newUser.avatarUrl || undefined,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
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
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
