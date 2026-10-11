import { prisma } from "@/lib/prisma";
import { TryOnSessionState, SessionStatus } from "./types";

/**
 * Persists a new Virtual Try-On session in PostgreSQL via Prisma
 */
export async function createDbSession(params: {
  userId: string;
  provider?: string;
  selectedGarmentId?: string;
}): Promise<TryOnSessionState> {
  try {
    const session = await prisma.tryOnSession.create({
      data: {
        userId: params.userId,
        provider: params.provider || "DECART_LUCY",
        selectedGarmentId: params.selectedGarmentId || null,
        status: "CREATED",
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      provider: session.provider as "DECART_LUCY" | "PHOTO_FALLBACK",
      providerSessionId: session.providerSessionId,
      selectedGarmentId: session.selectedGarmentId,
      status: session.status as SessionStatus,
      startedAt: session.startedAt?.toISOString(),
      endedAt: session.endedAt?.toISOString(),
    };
  } catch (error) {
    console.warn("Could not persist TryOnSession to database, using memory session:", error);
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: params.userId,
      provider: (params.provider as any) || "DECART_LUCY",
      status: "CREATED",
      selectedGarmentId: params.selectedGarmentId,
      startedAt: new Date().toISOString(),
    };
  }
}

/**
 * Updates an existing Try-On session status or selected garment
 */
export async function updateDbSession(
  sessionId: string,
  updates: {
    status?: SessionStatus;
    providerSessionId?: string;
    selectedGarmentId?: string;
    startedAt?: Date;
    endedAt?: Date;
  }
): Promise<void> {
  try {
    await prisma.tryOnSession.update({
      where: { id: sessionId },
      data: {
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.providerSessionId ? { providerSessionId: updates.providerSessionId } : {}),
        ...(updates.selectedGarmentId ? { selectedGarmentId: updates.selectedGarmentId } : {}),
        ...(updates.startedAt ? { startedAt: updates.startedAt } : {}),
        ...(updates.endedAt ? { endedAt: updates.endedAt } : {}),
      },
    });
  } catch (error) {
    // Non-fatal if session record is ephemeral
  }
}

/**
 * Marks session as STOPPED
 */
export async function endDbSession(sessionId: string): Promise<void> {
  await updateDbSession(sessionId, {
    status: "STOPPED",
    endedAt: new Date(),
  });
}
