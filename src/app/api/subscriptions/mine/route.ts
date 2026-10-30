import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: true, data: null });
    const userEmail = (session.user as { email?: string })?.email;
    if (!userEmail) return NextResponse.json({ ok: true, data: null });

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        plan_id,
        plan_name,
        price_inr,
        period,
        payment_status,
        status,
        started_at,
        expires_at,
        created_at
      `)
      .eq("user_email", userEmail.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ ok: true, data: null });

    const isExpired = data.expires_at && new Date(data.expires_at).getTime() < Date.now();
    const isActive = data.status === "ACTIVE" && !isExpired;

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        planId: data.plan_id,
        planName: data.plan_name,
        priceInr: Number(data.price_inr),
        period: data.period,
        paymentStatus: data.payment_status,
        status: isActive ? "ACTIVE" : "INACTIVE",
        startedAt: data.started_at,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Subscription mine GET error:", err);
    return NextResponse.json({ ok: true, data: null });
  }
}
