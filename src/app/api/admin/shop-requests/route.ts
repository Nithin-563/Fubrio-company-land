import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "shopRequests", "view", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("shop_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      shopItemId: r.shop_item_id,
      itemTitle: r.item_title,
      itemType: r.item_type,
      buyerEmail: r.buyer_email,
      buyerPhone: r.buyer_phone,
      contactMethod: r.contact_method,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Shop requests GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "shopRequests", "update", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, status, ...rest } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (rest.message !== undefined) update.message = rest.message;

    const { data, error } = await supabase
      .from("shop_requests")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await safeAuditLog({
      userId,
      action: "update",
      entity: "shopRequest",
      entityId: id,
      metadata: { changes: Object.keys(update) },
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Fubrio] Shop requests PUT error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "shopRequests", "delete", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("shop_requests").delete().eq("id", id);
    if (error) throw error;

    await safeAuditLog({ userId, action: "delete", entity: "shopRequest", entityId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Shop requests DELETE error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
