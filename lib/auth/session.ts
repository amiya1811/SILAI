import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { UserSession, Role } from "@/lib/types";

export const COOKIE_NAME = "silai_session_token";

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getUserFromRequest(request: NextRequest): UserSession | null {
  const token = request.cookies.get(COOKIE_NAME)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): { user: UserSession } | { error: string; status: number } {
  const user = getUserFromRequest(request);
  if (!user) {
    return { error: "Authentication required", status: 401 };
  }
  return { user };
}

export function requireRole(
  request: NextRequest,
  allowedRoles: Role[]
): { user: UserSession } | { error: string; status: number } {
  const authResult = requireAuth(request);
  if ("error" in authResult) {
    return authResult;
  }
  
  if (!allowedRoles.includes(authResult.user.role)) {
    return {
      error: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
      status: 403,
    };
  }
  
  return authResult;
}
