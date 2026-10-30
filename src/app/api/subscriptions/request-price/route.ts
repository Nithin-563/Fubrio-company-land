import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { createChatAccessToken } from "@/lib/security";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in to request a price" }, { status: 401 });
    const authProvider = (session.user as { authProvider?: string })?.authProvider ?? "credentials";
    if (authProvider !== "google") {
      return NextResponse.json({ ok: false, error: "Google authentication required" }, { status: 403 });
    }
    const userEmail = (session.user as { email?: string })?.email;
    const userName = (session.user as { name?: string })?.name ?? userEmail;
    if (!userEmail) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const schema = z.object({
      planId: z.string().min(1),
      requestedPriceInr: z.number().positive().max(100000),
      reason: z.string().max(2000).optional().nullable(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    const d = parsed.data;

    const { data: plan, error: planErr } = await supabase
      .from("subscription_plans")
      .select("id, name, price_inr")
      .eq("id", d.planId)
      .eq("active", true)
      .maybeSingle();
    if (planErr) throw planErr;
    if (!plan) return NextResponse.json({ ok: false, error: "Plan not found" }, { status: 404 });

    const { data: chat, error: chatErr } = await supabase
      .from("customer_chats")
      .insert({
        source_type: "subscription",
        source_id: null,
        customer_email: userEmail.toLowerCase(),
        customer_name: userName,
        status: "OPEN",
        subject: `Price request: ${plan.name} (₹${d.requestedPriceInr})`,
      })
      .select()
      .single();
    if (chatErr) throw chatErr;

    const { data: cr, error: crErr } = await supabase
      .from("subscription_change_requests")
      .insert({
        user_email: userEmail.toLowerCase(),
        plan_id: plan.id,
        plan_name: plan.name,
        original_price_inr: Number(plan.price_inr),
        requested_price_inr: d.requestedPriceInr,
        reason: d.reason || null,
        status: "PENDING",
        chat_id: chat.id,
      })
      .select()
      .single();
    if (crErr) throw crErr;

    await createNotification({
      type: "subscription_change",
      title: `Price request: ${plan.name} - ₹${d.requestedPriceInr} (was ₹${plan.price_inr})`,
      body: `By ${userEmail}${d.reason ? ` - ${d.reason.slice(0, 150)}` : ""}`,
      link: "#admin/subscriptions",
      sourceId: cr.id,
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: cr.id,
        chatId: chat.id,
        accessToken: createChatAccessToken(chat.id, userEmail),
        planName: plan.name,
        requestedPriceInr: d.requestedPriceInr,
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error("[Fubrio] Request-price error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
