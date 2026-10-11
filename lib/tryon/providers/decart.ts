import { createDecartClient, models, RealTimeClient } from "@decartai/sdk";
import { TryOnDesign, DecartTokenResponse } from "../types";
import { buildVtoPrompt, normalizeGarmentImage } from "../garment";

/**
 * Server-Side Decart Client Token Generator
 * Creates a short-lived, permission-restricted token for the browser WebRTC session.
 * The permanent DECART_API_KEY is NEVER exposed to the client.
 */
export async function createDecartClientToken(params?: {
  userId?: string;
  origin?: string;
}): Promise<DecartTokenResponse> {
  const apiKey = process.env.DECART_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: "Decart API Key is not configured on server (DECART_API_KEY missing).",
    };
  }

  try {
    const serverClient = createDecartClient({ apiKey });

    const tokenResponse = await serverClient.tokens.create({
      expiresIn: 300, // 5 minutes validity
      allowedModels: ["lucy-vton-3.6", "lucy-vton-3.5"],
      allowedOrigins: params?.origin ? [params.origin] : undefined,
      metadata: params?.userId ? { userId: params.userId } : undefined,
      constraints: {
        realtime: {
          maxSessionDuration: 600, // 10 minutes max session
        },
      },
    });

    return {
      success: true,
      token: tokenResponse.apiKey,
      expiresAt: tokenResponse.expiresAt,
      allowedModels: ["lucy-vton-3.6", "lucy-vton-3.5"],
    };
  } catch (error: any) {
    console.error("Error creating Decart client token:", error?.message || error);
    return {
      success: false,
      error: error?.message || "Failed to generate Decart real-time session token.",
    };
  }
}

/**
 * Client-Side Decart Real-Time VTO Session Manager
 * Orchestrates direct WebRTC streaming to Decart's Lucy VTO model.
 */
export class DecartRealtimeVtoSession {
  private client: ReturnType<typeof createDecartClient> | null = null;
  private realtimeClient: RealTimeClient | null = null;
  private activeModel: string = "lucy-vton-3.6";

  /**
   * Connects local camera stream to Decart Realtime Lucy VTO WebRTC endpoint
   */
  async connect(
    token: string,
    cameraStream: MediaStream,
    options: {
      initialGarment?: TryOnDesign | null;
      onRemoteStream: (stream: MediaStream) => void;
      onConnectionChange?: (state: string) => void;
      onError?: (error: any) => void;
    }
  ): Promise<void> {
    try {
      this.client = createDecartClient({ apiKey: token });

      const model = models.realtime(this.activeModel as any);

      let initialImageData: string | undefined = undefined;
      let promptText = "Wearing luxury custom Indian ethnic tailored garment, high-resolution silk fabric drape.";

      if (options.initialGarment) {
        promptText = buildVtoPrompt(options.initialGarment);
        initialImageData = await normalizeGarmentImage(options.initialGarment.imageUrl);
      }

      this.realtimeClient = await this.client.realtime.connect(cameraStream, {
        model,
        onRemoteStream: options.onRemoteStream,
        onConnectionChange: (state) => {
          if (options.onConnectionChange) {
            options.onConnectionChange(state);
          }
        },
        initialState: options.initialGarment && initialImageData
          ? {
              prompt: { text: promptText, enhance: false },
              image: initialImageData,
            }
          : undefined,
      });

      if (options.onError) {
        this.realtimeClient.on("error", (err) => {
          options.onError!(err);
        });
      }
    } catch (err: any) {
      console.error("Failed to connect Decart Realtime VTO session:", err);
      throw err;
    }
  }

  /**
   * Switches garments seamlessly within the ACTIVE real-time session
   * Does NOT stop camera or recreate WebRTC connection!
   */
  async switchGarment(garment: TryOnDesign): Promise<void> {
    if (!this.realtimeClient) {
      throw new Error("No active real-time Decart session.");
    }

    const promptText = buildVtoPrompt(garment);
    const normalizedImage = await normalizeGarmentImage(garment.imageUrl);

    // Use official RealTimeClient set method to update both prompt & reference image
    await this.realtimeClient.set({
      prompt: promptText,
      image: normalizedImage,
    });
  }

  /**
   * Gracefully terminates Decart WebRTC session
   */
  disconnect(): void {
    if (this.realtimeClient) {
      try {
        this.realtimeClient.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      this.realtimeClient = null;
    }
    this.client = null;
  }

  isConnected(): boolean {
    return Boolean(this.realtimeClient && this.realtimeClient.isConnected());
  }

  getConnectionState(): string {
    return this.realtimeClient?.getConnectionState() || "disconnected";
  }
}
