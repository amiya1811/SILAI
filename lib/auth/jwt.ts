import jwt from "jsonwebtoken";
import { UserSession } from "@/lib/types";

const JWT_SECRET = process.env.AUTH_SECRET || "silai_luxury_secret_jwt_key_2026_fallback";

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}
