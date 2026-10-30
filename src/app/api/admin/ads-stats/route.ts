import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "apiKeys", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data: impressions, error } = await supabase
      .from("ad_impressions")
      .select("api_key_id, ad_format, clicked, payout_usd, created_at");

    if (error) throw error;

    const byKey: Record<string, { impressions: number; clicks: number; payoutUsd: number; ctr: number }> = {};
    for (const imp of impressions ?? []) {
      const k = imp.api_key_id;
      if (!k) continue;
      if (!byKey[k]) byKey[k] = { impressions: 0, clicks: 0, payoutUsd: 0, ctr: 0 };
      byKey[k].impressions++;
      if (imp.clicked) byKey[k].clicks++;
      byKey[k].payoutUsd += Number(imp.payout_usd ?? 0);
    }
    for (const k of Object.keys(byKey)) {
      const v = byKey[k];
      v.ctr = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0;
      v.payoutUsd = Math.round(v.payoutUsd * 10000) / 10000; // round to 4 decimals
    }

    const totalImpressions = (impressions ?? []).length;
    const totalClicks = (impressions ?? []).filter((i: any) => i.clicked).length;
    const totalPayout = (impressions ?? []).reduce((s: number, i: any) => s + Number(i.payout_usd ?? 0), 0);
    const totalCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return NextResponse.json({
      ok: true,
      stats: {
        totalImpressions,
        totalClicks,
        totalCtr: Math.round(totalCtr * 100) / 100,
        totalPayoutUsd: Math.round(totalPayout * 10000) / 10000,
        perKey: byKey,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Admin ads-stats error:", err);
    return NextResponse.json({
      ok: true,
      stats: { totalImpressions: 0, totalClicks: 0, totalCtr: 0, totalPayoutUsd: 0, perKey: {} },
    });
  }
}
