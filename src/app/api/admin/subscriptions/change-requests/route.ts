import { NextRequest, NextResponse } from "next/server";
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
      .from("subscription_change_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      userEmail: r.user_email,
      planId: r.plan_id,
      planName: r.plan_name,
      originalPriceInr: Number(r.original_price_inr),
      requestedPriceInr: Number(r.requested_price_inr),
      reason: r.reason,
      status: r.status,
      adminResponse: r.admin_response,
      chatId: r.chat_id,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Admin change-requests GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, status, adminResponse } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (!["APPROVED", "REJECTED", "COUNTERED", "PENDING"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("subscription_change_requests")
      .update({
        status,
        admin_response: adminResponse || null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, data: { id: data.id, status: data.status } });
  } catch (err) {
    console.error("[Fubrio] Admin change-requests PUT error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
