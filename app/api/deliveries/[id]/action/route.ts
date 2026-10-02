import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { requireRole } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireRole(request, ["DELIVERY_PARTNER", "ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { action, otp } = body;

    const job = store.getDeliveryJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: "Delivery job not found" }, { status: 404 });
    }

    if (action === "ACCEPT") {
      store.updateDeliveryStatus(job.id, "ACCEPTED", auth.user.id);
      return NextResponse.json({
        success: true,
        message: "Job accepted. Proceed to pickup location.",
        job: store.getDeliveryJobById(params.id),
      });
    }

    if (action === "PICKED_UP") {
      store.updateDeliveryStatus(job.id, "PICKED_UP", auth.user.id);
      return NextResponse.json({
        success: true,
        message: "Fabric / Outfit picked up successfully. In transit.",
        job: store.getDeliveryJobById(params.id),
      });
    }

    if (action === "PHOTO_VERIFICATION") {
      const { stage, photoUrl, packageCondition, notes, otp } = body;
      if (!photoUrl) {
        return NextResponse.json({ error: "Verification photo is required." }, { status: 400 });
      }

      const result = store.recordDeliveryPhotoVerification(job.id, {
        stage,
        photoUrl,
        packageCondition,
        notes,
        otp,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        job: result.job,
      });
    }

    if (action === "VERIFY_OTP_COMPLETE") {
      if (!otp) {
        return NextResponse.json({ error: "Delivery OTP is required" }, { status: 400 });
      }

      const verifyResult = store.verifyDeliveryOtp(job.id, otp);
      if (!verifyResult.success) {
        return NextResponse.json({ error: verifyResult.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Delivery OTP verified! Job completed and payout added to earnings.",
        job: store.getDeliveryJobById(params.id),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Action processing error" }, { status: 500 });
  }
}
