import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit: 1 request per 60 seconds per email
    const recentRequest = await prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentRequest) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, a password reset link has been generated. Please wait a moment before requesting again.",
      });
    }

    // Verify if user exists in database
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
    });

    if (user && user.isActive) {
      // Invalidate any previous unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: {
          email: normalizedEmail,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Generate cryptographically secure random token (32 bytes hex)
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Store SHA-256 hash in database
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          expiresAt,
        },
      });

      // Return generic response (and in dev mode include dev resetUrl for test convenience)
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, a password reset link has been generated.",
        resetUrl: process.env.NODE_ENV !== "production" ? `/reset-password?token=${rawToken}` : undefined,
      });
    }

    // Generic response to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email address, a password reset link has been generated.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
