/**
 * SILAI Virtual Try-On Provider Abstraction Layer
 * Interfaces Decart's official real-time Lucy VTO model & legitimate photo fallback.
 */

import { createDecartClientToken, DecartRealtimeVtoSession } from "./providers/decart";
import { executePhotoVirtualTryOn, PHOTO_VTO_DISCLAIMER } from "./providers/photo-fallback";
import { TryOnDesign, TryOnSessionState, VirtualTryOnProvider } from "./types";

export const TRY_ON_DISCLAIMER =
  "Virtual try-on is a visual preview and may not represent exact fit, measurements or final stitching.";

export { createDecartClientToken, DecartRealtimeVtoSession, executePhotoVirtualTryOn, PHOTO_VTO_DISCLAIMER };

/**
 * High-level Virtual Try-On Provider implementation
 */
export class DecartVirtualTryOnProvider implements VirtualTryOnProvider {
  private session: DecartRealtimeVtoSession | null = null;

  async initialize(): Promise<void> {
    this.session = new DecartRealtimeVtoSession();
  }

  async createSession(input: {
    userId?: string;
    garment?: TryOnDesign;
  }): Promise<TryOnSessionState> {
    return {
      id: `session_${Date.now()}`,
      userId: input.userId,
      provider: "DECART_LUCY",
      status: "CREATED",
      selectedGarmentId: input.garment?.id,
      startedAt: new Date().toISOString(),
    };
  }

  async setGarment(sessionId: string, garment: TryOnDesign): Promise<void> {
    if (this.session && this.session.isConnected()) {
      await this.session.switchGarment(garment);
    }
  }

  async stopSession(sessionId: string): Promise<void> {
    if (this.session) {
      this.session.disconnect();
    }
  }

  async dispose(): Promise<void> {
    if (this.session) {
      this.session.disconnect();
      this.session = null;
    }
  }
}
