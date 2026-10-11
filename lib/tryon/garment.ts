import { TryOnDesign, GarmentValidationResult } from "./types";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

export const MAX_GARMENT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates garment image format, size, and basic integrity
 */
export function validateGarmentFile(
  fileName: string,
  mimeType: string,
  fileSize: number
): GarmentValidationResult {
  if (fileSize > MAX_GARMENT_FILE_SIZE) {
    return {
      valid: false,
      error: `Garment image exceeds maximum size of 10MB (Received: ${(fileSize / (1024 * 1024)).toFixed(2)}MB).`,
    };
  }

  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMime)) {
    return {
      valid: false,
      error: `Unsupported image format (${mimeType}). Supported formats: JPEG, PNG, WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Cleans user upload titles, stripping file-system artefacts like "WhatsApp Image...",
 * "download", extensions, and timestamps to give clean descriptive labels.
 */
export function cleanGarmentTitle(title?: string): string {
  if (!title) return "Tailored Garment";
  let clean = title.replace(/\.(png|jpe?g|webp|gif)$/i, "");
  // Replace ugly upload filenames with elegant garment titles
  if (/whatsapp|image|download|screenshot|photo|img_\d+/i.test(clean)) {
    return "Tailored Garment";
  }
  return clean.trim() || "Tailored Garment";
}

/**
 * Generates an optimized tailoring prompt for Decart Lucy VTO model
 */
export function buildVtoPrompt(garment: TryOnDesign): string {
  const cleanTitle = cleanGarmentTitle(garment.title);
  const category = garment.category && garment.category !== "CUSTOM" ? garment.category : "attire";
  return `Wearing custom tailored ${cleanTitle} (${category}), realistic fabric folds, accurate drape, natural body fit, haute couture silk texture, perfect digital fitting.`;
}

/**
 * Ensures garment image is normalized to a safe Base64 Data URL.
 * Bypasses browser CORS issues for remote URLs (Cloudinary, Unsplash) by fetching via server-side proxy if needed.
 */
export async function normalizeGarmentImage(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";

  // 1. If it's already a base64 Data URL, return it immediately (zero network overhead)
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // 2. If it's a remote URL (http/https), fetch via server proxy to guarantee CORS safety
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const proxyRes = await fetch(`/api/tryon/image-proxy?url=${encodeURIComponent(imageUrl)}`);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.success && data.dataUrl) {
          return data.dataUrl;
        }
      }
    } catch (e) {
      console.warn("Server image proxy failed, falling back to direct URL:", e);
    }
  }

  // 3. Fallback to original image URL
  return imageUrl;
}
