import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession, canSessionAccess } from "@/lib/types";
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
    label: r.label,
    url: r.url,
    icon: r.icon,
    description: r.description,
    order: r.order,
    active: r.active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "donation", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("donation_links")
      .select("*")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, data: (data ?? []).map(rowToJson) });
  } catch (err) {
    console.error("[Fubrio] Admin donation-links GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "donation", "create", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { label, url, icon, description, order, active } = body;

    if (!label || typeof label !== "string" || label.trim().length < 2) {
      return NextResponse.json({ ok: false, error: "Label is required (min 2 chars)" }, { status: 400 });
    }
    if (!url || typeof url !== "string" || !/^https?:\/\/[^\s]+$/.test(url)) {
      return NextResponse.json({ ok: false, error: "A valid http(s):// URL is required" }, { status: 400 });
    }

    const insert: any = {
      label: label.trim(),
      url: url.trim(),
      icon: icon || null,
      description: description || null,
      order: typeof order === "number" ? order : 0,
      active: active !== false,
    };
    const { data, error } = await supabase
      .from("donation_links")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;

    await safeAuditLog({
      userId,
      action: "create",
      entity: "donationLink",
      entityId: data.id,
      metadata: { label: data.label },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin donation-links POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "donation", "update", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, label, url, icon, description, order, active } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: any = {};
    if (label !== undefined) {
      if (typeof label !== "string" || label.trim().length < 2) {
        return NextResponse.json({ ok: false, error: "Label must be at least 2 chars" }, { status: 400 });
      }
      update.label = label.trim();
    }
    if (url !== undefined) {
      if (typeof url !== "string" || !/^https?:\/\/[^\s]+$/.test(url)) {
        return NextResponse.json({ ok: false, error: "Invalid URL" }, { status: 400 });
      }
      update.url = url.trim();
    }
    if (icon !== undefined) update.icon = icon || null;
    if (description !== undefined) update.description = description || null;
    if (order !== undefined) update.order = Number(order);
    if (active !== undefined) update.active = !!active;

    const { data, error } = await supabase
      .from("donation_links")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await safeAuditLog({
      userId,
      action: "update",
      entity: "donationLink",
      entityId: id,
      metadata: { changes: Object.keys(update) },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin donation-links PUT error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "donation", "delete", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("donation_links").delete().eq("id", id);
    if (error) throw error;

    await safeAuditLog({ userId, action: "delete", entity: "donationLink", entityId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin donation-links DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
