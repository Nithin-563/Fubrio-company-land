import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      userEmail: r.user_email,
      userId: r.user_id,
      planId: r.plan_id,
      planName: r.plan_name,
      priceInr: Number(r.price_inr),
      period: r.period,
      instamojoPaymentRequestId: r.instamojo_payment_request_id,
      instamojoPaymentId: r.instamojo_payment_id,
      paymentStatus: r.payment_status,
      status: r.status,
      startedAt: r.started_at,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
    }));

    const stats = {
      total: rows.length,
      active: rows.filter((r) => r.status === "ACTIVE" && (!r.expiresAt || new Date(r.expiresAt).getTime() > Date.now())).length,
      pending: rows.filter((r) => r.paymentStatus === "pending").length,
      failed: rows.filter((r) => r.paymentStatus === "failed").length,
      revenueInr: rows.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + Number(r.priceInr), 0),
    };

    return NextResponse.json({ ok: true, data: rows, stats });
  } catch (err) {
    console.error("[Fubrio] Admin subscriptions list error:", err);
    return NextResponse.json({ ok: true, data: [], stats: { total: 0, active: 0, pending: 0, failed: 0, revenueInr: 0 } });
  }
}
