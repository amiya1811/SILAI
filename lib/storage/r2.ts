import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Allowed MIME types and extensions
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const DISALLOWED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".ts",
  ".html",
  ".htm",
  ".php",
  ".py",
  ".jar",
  ".vbs",
  ".msi",
  ".dll",
];

/**
 * Validates file MIME type, extension, and file size
 */
export function validateUploadFile(
  fileName: string,
  mimeType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of 10 MB (Received: ${(fileSize / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  const lowerName = fileName.toLowerCase();
  for (const ext of DISALLOWED_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return {
        valid: false,
        error: `Executable and script file uploads (${ext}) are strictly disallowed.`,
      };
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type (${mimeType}). Allowed: JPEG, PNG, WebP, HEIC, PDF.`,
    };
  }

  return { valid: true };
}

/**
 * Builds the canonical storage path key matching Section 23 specifications
 */
export function buildR2StorageKey(params: {
  category: "customers" | "tailors" | "orders";
  id: string;
  subType:
    | "profile"
    | "portfolio"
    | "designs"
    | "measurements"
    | "delivery/leg1_pickup"
    | "delivery/leg1_handover"
    | "delivery/leg2_pickup"
    | "delivery/leg2_delivery"
    | "issues"
    | "corrections";
  originalName: string;
}): string {
  const extension = params.originalName.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueId = crypto.randomUUID();
  return `${params.category}/${params.id}/${params.subType}/${uniqueId}.${extension}`;
}

/**
 * Returns configured R2 S3 client or null if environment variables are not set
 */
export function getR2Client(): { client: S3Client; bucket: string; publicUrl: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "silai-uploads";
  const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-${accountId?.slice(0, 8) || "silai"}.r2.dev`;

  if (!accountId || !accessKeyId || !secretAccessKey || accessKeyId === "YOUR_R2_ACCESS_KEY_ID") {
    return null;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket, publicUrl: publicUrl.replace(/\/$/, "") };
}

/**
 * Uploads file buffer to Cloudflare R2 or returns safe local data URI fallback in development
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  storageKey: string,
  mimeType: string
): Promise<{ publicUrl: string; storageKey: string; isR2: boolean }> {
  const r2Config = getR2Client();

  if (r2Config) {
    const { client, bucket, publicUrl } = r2Config;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return {
      publicUrl: `${publicUrl}/${storageKey}`,
      storageKey,
      isR2: true,
    };
  }

  // Guard: Fallback must NOT silently operate in production
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Cloudflare R2 storage credentials are not configured. Direct uploads cannot proceed without R2 in production."
    );
  }

  // Graceful development/test fallback: Convert to data URI for immediate local display
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    publicUrl: dataUrl,
    storageKey,
    isR2: false,
  };
}
