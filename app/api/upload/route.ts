import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import {
  validateUploadFile,
  buildR2StorageKey,
  uploadBufferToR2,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/storage/r2";

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;
    let fileSize: number;
    let orderId: string | undefined;
    let evidenceType: string | undefined;
    let deliveryLeg: string | undefined;
    let visibility: string = "PRIVATE";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided in request." }, { status: 400 });
      }

      fileName = file.name;
      mimeType = file.type || "image/jpeg";
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      orderId = (formData.get("orderId") as string) || undefined;
      evidenceType = (formData.get("evidenceType") as string) || undefined;
      deliveryLeg = (formData.get("deliveryLeg") as string) || undefined;
      visibility = (formData.get("visibility") as string) || "PRIVATE";
    } else {
      // JSON format with base64 dataUrl
      const body = await request.json();
      const { dataUrl, name, orderId: ordId, evidenceType: evType, deliveryLeg: leg, visibility: vis } = body;

      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ error: "No file data or dataUrl provided." }, { status: 400 });
      }

      // Extract mime type and base64 string
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Invalid dataUrl format." }, { status: 400 });
      }

      mimeType = matches[1];
      const base64Content = matches[2];
      fileBuffer = Buffer.from(base64Content, "base64");
      fileSize = fileBuffer.length;
      fileName = name || `upload_${Date.now()}.${mimeType.split("/")[1] || "jpg"}`;

      orderId = ordId;
      evidenceType = evType;
      deliveryLeg = leg;
      visibility = vis || "PRIVATE";
    }

    // Validate file
    const validation = validateUploadFile(fileName, mimeType, fileSize);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine category and subType for R2 path
    let category: "customers" | "tailors" | "orders" = "customers";
    let subType: any = "profile";

    if (orderId) {
      category = "orders";
      if (evidenceType?.includes("LEG1_PICKUP")) subType = "delivery/leg1_pickup";
      else if (evidenceType?.includes("LEG1_HANDOVER")) subType = "delivery/leg1_handover";
      else if (evidenceType?.includes("LEG2_PICKUP")) subType = "delivery/leg2_pickup";
      else if (evidenceType?.includes("LEG2_DELIVERY")) subType = "delivery/leg2_delivery";
      else if (evidenceType?.includes("ISSUE")) subType = "issues";
      else if (evidenceType?.includes("CORRECTION")) subType = "corrections";
      else if (evidenceType?.includes("DESIGN")) subType = "designs";
      else subType = "designs";
    } else if (auth.user.role === "TAILOR") {
      category = "tailors";
      subType = evidenceType === "PORTFOLIO" ? "portfolio" : "profile";
    }

    const storageKey = buildR2StorageKey({
      category,
      id: orderId || auth.user.id,
      subType,
      originalName: fileName,
    });

    // Upload to R2 (or safe local fallback)
    const uploadResult = await uploadBufferToR2(fileBuffer, storageKey, mimeType);

    // Save metadata in database
    const fileMetadata = await prisma.fileMetadata.create({
      data: {
        orderId: orderId || null,
        userId: auth.user.id,
        uploaderRole: auth.user.role as any,
        storageKey: uploadResult.storageKey,
        publicUrl: uploadResult.publicUrl,
        mimeType,
        fileSize,
        evidenceType: evidenceType || null,
        deliveryLeg: deliveryLeg || null,
        visibility,
      },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.publicUrl,
      publicUrl: uploadResult.publicUrl,
      storageKey: uploadResult.storageKey,
      fileMetadata,
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
