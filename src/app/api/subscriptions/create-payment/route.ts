import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createPaymentRequest } from "@/lib/instamojo";
import { getBaseUrl } from "@/lib/base-url";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in to subscribe" }, { status: 401 });
    const authProvider = (session.user as { authProvider?: string })?.authProvider ?? "credentials";
    if (authProvider !== "google") {
      return NextResponse.json({ ok: false, error: "Google authentication required to subscribe" }, { status: 403 });
    }

    const userId = (session.user as { id?: string })?.id;
    const userEmail = (session.user as { email?: string })?.email;
    const userName = (session.user as { name?: string })?.name ?? userEmail;
    if (!userEmail) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const { planId } = body;
    if (!planId) return NextResponse.json({ ok: false, error: "Missing planId" }, { status: 400 });

    const { data: plan, error: planErr } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("active", true)
      .maybeSingle();
    if (planErr) throw planErr;
    if (!plan) return NextResponse.json({ ok: false, error: "Plan not found or inactive" }, { status: 404 });

    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("id, status, expires_at")
      .eq("user_email", userEmail.toLowerCase())
      .eq("plan_id", planId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (existingSub && existingSub.expires_at && new Date(existingSub.expires_at).getTime() > Date.now()) {
      return NextResponse.json({ ok: false, error: "You already have an active subscription to this plan." }, { status: 409 });
    }

    const baseUrl = getBaseUrl(req);
    const purpose = `Fubrio ${plan.name} - ${plan.period}`.slice(0, 100);
    const result = await createPaymentRequest({
      amount: Number(plan.price_inr),
      purpose,
      buyerName: userName,
      email: userEmail,
      redirectUrl: `${baseUrl}/api/subscriptions/callback`,
      webhookUrl: `${baseUrl}/api/subscriptions/webhook`,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error ?? "Payment creation failed" }, { status: 500 });
    }

    const { data: sub, error: subErr } = await supabase
      .from("user_subscriptions")
      .insert({
        user_email: userEmail.toLowerCase(),
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.name,
        price_inr: Number(plan.price_inr),
        period: plan.period,
        instamojo_payment_request_id: result.paymentRequestId,
        payment_status: "pending",
        status: "INACTIVE",
      })
      .select()
      .single();
    if (subErr) throw subErr;

    return NextResponse.json({
      ok: true,
      paymentUrl: result.paymentUrl,
      subscriptionId: sub.id,
      paymentRequestId: result.paymentRequestId,
    });
  } catch (err) {
    console.error("[Fubrio] Create-payment error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
