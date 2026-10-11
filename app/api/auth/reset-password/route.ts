import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing reset token." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256 to compare with stored tokenHash
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (resetRecord.usedAt) {
      return NextResponse.json(
        { error: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "This password reset link has expired (valid for 20 minutes). Please request a new one." },
        { status: 400 }
      );
    }

    // Find the associated user
    const user = await prisma.user.findFirst({
      where: { email: { equals: resetRecord.email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Hash the new password securely
    const newPasswordHash = await hashPassword(password);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
