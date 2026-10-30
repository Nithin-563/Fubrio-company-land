import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

function rowToJson(r: any) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    priceInr: Number(r.price_inr),
    period: r.period,
    priceType: r.price_type,
    aiCreditsPerDay: r.ai_credits_per_day,
    adsRequestsPerDay: r.ads_requests_per_day,
    features: r.features || [],
    active: r.active,
    order: r.order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("order", { ascending: true })
      .order("price_inr", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, data: (data ?? []).map(rowToJson) });
  } catch (err) {
    console.error("[Fubrio] Admin subscription plans GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { name, description, priceInr, period, priceType, aiCreditsPerDay, adsRequestsPerDay, features, active, order } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Name is required (min 2 chars)" }, { status: 400 });
    }
    if (typeof priceInr !== "number" || priceInr < 0) {
      return NextResponse.json({ ok: false, error: "Valid price_inr required" }, { status: 400 });
    }

    const insert: any = {
      name: name.trim(),
      description: description || null,
      price_inr: priceInr,
      period: period || "monthly",
      price_type: priceType || "subscription",
      ai_credits_per_day: typeof aiCreditsPerDay === "number" ? aiCreditsPerDay : 25,
      ads_requests_per_day: typeof adsRequestsPerDay === "number" ? adsRequestsPerDay : 1000,
      features: Array.isArray(features) ? features : [],
      active: active !== false,
      order: typeof order === "number" ? order : 0,
    };
    const { data, error } = await supabase
      .from("subscription_plans")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;

    await safeAuditLog({
      userId,
      action: "create",
      entity: "subscriptionPlan",
      entityId: data.id,
      metadata: { name: data.name, priceInr },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin subscription plans POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: any = {};
    if (rest.name !== undefined) update.name = rest.name;
    if (rest.description !== undefined) update.description = rest.description || null;
    if (rest.priceInr !== undefined) update.price_inr = rest.priceInr;
    if (rest.period !== undefined) update.period = rest.period;
    if (rest.priceType !== undefined) update.price_type = rest.priceType;
    if (rest.aiCreditsPerDay !== undefined) update.ai_credits_per_day = rest.aiCreditsPerDay;
    if (rest.adsRequestsPerDay !== undefined) update.ads_requests_per_day = rest.adsRequestsPerDay;
    if (rest.features !== undefined) update.features = Array.isArray(rest.features) ? rest.features : [];
    if (rest.active !== undefined) update.active = !!rest.active;
    if (rest.order !== undefined) update.order = Number(rest.order);

    const { data, error } = await supabase
      .from("subscription_plans")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await safeAuditLog({
      userId,
      action: "update",
      entity: "subscriptionPlan",
      entityId: id,
      metadata: { changes: Object.keys(update) },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin subscription plans PUT error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "subscriptions", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);
    if (error) throw error;

    await safeAuditLog({ userId, action: "delete", entity: "subscriptionPlan", entityId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin subscription plans DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
