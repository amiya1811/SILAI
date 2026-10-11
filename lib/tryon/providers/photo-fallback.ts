import { createDecartClient, models } from "@decartai/sdk";
import { PhotoFallbackRequest, PhotoFallbackResponse } from "../types";

export const PHOTO_VTO_DISCLAIMER =
  "AI Try-On Preview is a visual estimation and does not represent live fitting, exact measurements, or final stitching.";

/**
 * Legitimate Photo-Based AI Virtual Try-On Fallback
 * Used strictly when live camera WebRTC cannot be established.
 * Clearly labeled as "AI Try-On Preview" (never live).
 */
export async function executePhotoVirtualTryOn(
  req: PhotoFallbackRequest
): Promise<PhotoFallbackResponse> {
  const { personImage, garmentImage, garmentTitle } = req;

  if (!personImage) {
    return {
      success: false,
      model: "Decart Lucy Image 2",
      disclaimer: PHOTO_VTO_DISCLAIMER,
      error: "Person photo is required for AI Try-On Preview.",
    };
  }

  if (!garmentImage) {
    return {
      success: false,
      model: "Decart Lucy Image 2",
      disclaimer: PHOTO_VTO_DISCLAIMER,
      error: "Garment design reference is required for AI Try-On Preview.",
    };
  }

  const apiKey = process.env.DECART_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      model: "Decart Lucy Image 2",
      disclaimer: PHOTO_VTO_DISCLAIMER,
      error: "Decart VTO service is temporarily unavailable (DECART_API_KEY missing).",
    };
  }

  try {
    const client = createDecartClient({ apiKey });
    const imageModel = models.image("lucy-image-2");

    const promptText = `Wearing custom tailored Indian ${garmentTitle || "ethnic outfit"}, preserve face and body posture, realistic fabric texture and drape.`;

    // Execute Decart synchronous image-to-image processing
    const resultBlob = await client.process({
      model: imageModel,
      prompt: promptText,
      data: personImage,
      reference_image: garmentImage,
    });

    const buffer = Buffer.from(await resultBlob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mime = resultBlob.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    return {
      success: true,
      generatedImageUrl: dataUrl,
      model: "Decart Lucy Image 2",
      disclaimer: PHOTO_VTO_DISCLAIMER,
    };
  } catch (error: any) {
    console.error("Photo fallback error:", error?.message || error);
    return {
      success: false,
      model: "Decart Lucy Image 2",
      disclaimer: PHOTO_VTO_DISCLAIMER,
      error:
        error?.message ||
        "AI Try-On Preview could not be processed. Please check your image format or connection.",
    };
  }
}
