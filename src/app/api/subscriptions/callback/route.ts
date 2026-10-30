import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPaymentRequest } from "@/lib/instamojo";


export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const paymentRequestId = url.searchParams.get("payment_request_id");
  const paymentId = url.searchParams.get("payment_id");
  const paymentStatus = url.searchParams.get("payment_status");

  if (!paymentRequestId) {
    return NextResponse.redirect(new URL("/#subscriptions?error=missing_payment_request_id", url.origin));
  }

  try {
    const verification = await verifyPaymentRequest(paymentRequestId);

    if (!verification.ok) {
      return NextResponse.redirect(new URL(`/#subscriptions?error=verification_failed&prid=${paymentRequestId}`, url.origin));
    }

    if (verification.paymentStatus === "paid") {
      await activateSubscription(paymentRequestId, verification.paymentId || paymentId || null);

      return NextResponse.redirect(new URL(`/#subscriptions?status=paid&prid=${paymentRequestId}`, url.origin));
    } else if (verification.paymentStatus === "failed") {
      await supabase
        .from("user_subscriptions")
        .update({ payment_status: "failed", status: "INACTIVE" })
        .eq("instamojo_payment_request_id", paymentRequestId);

      return NextResponse.redirect(new URL(`/#subscriptions?status=failed&prid=${paymentRequestId}`, url.origin));
    } else {
      return NextResponse.redirect(new URL(`/#subscriptions?status=pending&prid=${paymentRequestId}`, url.origin));
    }
  } catch (err) {
    console.error("[Fubrio] Subscription callback error:", err);
    return NextResponse.redirect(new URL(`/#subscriptions?error=exception&prid=${paymentRequestId}`, url.origin));
  }
}

async function activateSubscription(paymentRequestId: string, paymentId: string | null) {
  const { data: sub, error } = await supabase
    .from("user_subscriptions")
    .select("id, plan_id, period")
    .eq("instamojo_payment_request_id", paymentRequestId)
    .maybeSingle();
  if (error || !sub) return;

  const now = new Date();
  let expiresAt: string | null = null;
  if (sub.period === "monthly") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1);
    expiresAt = d.toISOString();
  } else if (sub.period === "yearly") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + 1);
    expiresAt = d.toISOString();
  }

  await supabase
    .from("user_subscriptions")
    .update({
      payment_status: "paid",
      status: "ACTIVE",
      instamojo_payment_id: paymentId,
      started_at: now.toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", sub.id);
}
