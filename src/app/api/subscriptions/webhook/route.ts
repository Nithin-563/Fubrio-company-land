import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyPaymentRequest } from "@/lib/instamojo";


export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any;
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    const paymentRequestId = body.payment_request_id;
    const paymentId = body.payment_id;
    const paymentStatus = body.payment_status;

    if (!paymentRequestId) {
      return NextResponse.json({ ok: false, error: "Missing payment_request_id" }, { status: 400 });
    }

    const verification = await verifyPaymentRequest(paymentRequestId);
    if (!verification.ok) {
      console.warn("[Fubrio] Webhook verification failed for", paymentRequestId);
      return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 400 });
    }

    if (verification.paymentStatus === "paid") {
      const { data: sub, error } = await supabase
        .from("user_subscriptions")
        .select("id, plan_id, period")
        .eq("instamojo_payment_request_id", paymentRequestId)
        .maybeSingle();
      if (error || !sub) {
        console.warn("[Fubrio] Webhook: no matching subscription for", paymentRequestId);
        return NextResponse.json({ ok: true, msg: "no matching sub" });
      }

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
          instamojo_payment_id: verification.paymentId || paymentId,
          started_at: now.toISOString(),
          expires_at: expiresAt,
        })
        .eq("id", sub.id);

      console.log("[Fubrio] Webhook: activated subscription", sub.id, "for", paymentRequestId);
      return NextResponse.json({ ok: true, activated: true });
    } else {
      await supabase
        .from("user_subscriptions")
        .update({
          payment_status: verification.paymentStatus,
          status: "INACTIVE",
        })
        .eq("instamojo_payment_request_id", paymentRequestId);
      return NextResponse.json({ ok: true, status: verification.paymentStatus });
    }
  } catch (err) {
    console.error("[Fubrio] Webhook exception:", err);
    return NextResponse.json({ ok: false, error: "Webhook failed" }, { status: 500 });
  }
}
