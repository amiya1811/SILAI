/**
 * SILAI Real-Time Virtual Try-On - Core Type Definitions
 * Supports Decart Lucy VTO real-time video transformation & photo fallback.
 */

export interface TryOnDesign {
  id: string;
  title: string;
  category?: string;
  imageUrl: string; // Base64 data URL or external HTTPS image URL
  isCustom?: boolean;
  createdAt?: string;
  storageKey?: string;
}

export type CameraState =
  | "CAMERA_OFF"
  | "REQUESTING_PERMISSION"
  | "CAMERA_ACTIVE"
  | "CAMERA_PERMISSION_DENIED"
  | "CAMERA_UNAVAILABLE"
  | "CAMERA_STOPPED";

export type TryOnMode = "LIVE_VTO" | "PHOTO_FALLBACK";

export type SessionStatus =
  | "CREATED"
  | "STARTING"
  | "LIVE"
  | "STOPPING"
  | "STOPPED"
  | "FAILED";

export interface TryOnSessionState {
  id: string;
  userId?: string;
  status: SessionStatus;
  provider: "DECART_LUCY" | "PHOTO_FALLBACK";
  providerSessionId?: string | null;
  selectedGarmentId?: string | null;
  startedAt?: string;
  endedAt?: string;
}

export interface DecartTokenResponse {
  success: boolean;
  token?: string;
  expiresAt?: string;
  allowedModels?: string[];
  error?: string;
}

export interface GarmentValidationResult {
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}

export interface TryOnSaveResultRequest {
  designId?: string;
  designTitle: string;
  designImageUrl: string;
  capturedResultUrl: string;
  notes?: string;
}

export interface TryOnSaveResultResponse {
  success: boolean;
  designId?: string;
  savedAt?: string;
  message?: string;
  error?: string;
}

export interface PhotoFallbackRequest {
  personImage: string;
  garmentImage: string;
  garmentTitle?: string;
}

export interface PhotoFallbackResponse {
  success: boolean;
  generatedImageUrl?: string;
  model: string;
  disclaimer: string;
  error?: string;
}

/**
 * Provider-agnostic interface for Virtual Try-On engines
 */
export interface VirtualTryOnProvider {
  initialize(): Promise<void>;
  createSession(input: {
    userId?: string;
    garment?: TryOnDesign;
  }): Promise<TryOnSessionState>;
  setGarment(sessionId: string, garment: TryOnDesign): Promise<void>;
  stopSession(sessionId: string): Promise<void>;
  dispose(): Promise<void>;
}
