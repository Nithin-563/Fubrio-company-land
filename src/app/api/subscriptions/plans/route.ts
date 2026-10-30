import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true })
      .order("price_inr", { ascending: true });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      priceInr: Number(r.price_inr),
      period: r.period,
      priceType: r.price_type,
      aiCreditsPerDay: r.ai_credits_per_day,
      adsRequestsPerDay: r.ads_requests_per_day,
      features: r.features || [],
      order: r.order,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Subscription plans GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}
