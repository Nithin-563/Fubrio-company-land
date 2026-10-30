import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "apiKeys", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: logCounts } = await supabase
      .from("api_key_logs")
      .select("api_key_id, type, status");

    const tally: Record<string, { total: number; success: number; failed: number }> = {};
    for (const l of logCounts ?? []) {
      const id = l.api_key_id;
      if (!id) continue;
      if (!tally[id]) tally[id] = { total: 0, success: 0, failed: 0 };
      tally[id].total++;
      if (l.status === "success") tally[id].success++;
      if (l.status === "failed") tally[id].failed++;
    }

    const rows = (keys ?? []).map((k: any) => ({
      id: k.id,
      userId: k.user_id,
      userEmail: k.user_email,
      userName: k.user_name,
      userAvatar: k.user_avatar,
      authProvider: k.auth_provider,
      type: k.type,
      name: k.name,
      keyPrefix: k.key_prefix,
      keySuffix: k.key_suffix,
      webhookUrl: k.webhook_url,
      scopes: k.scopes,
      status: k.status,
      createdAt: k.created_at,
      expiresAt: k.expires_at,
      lastUsedAt: k.last_used_at,
      logStats: tally[k.id] ?? { total: 0, success: 0, failed: 0 },
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Admin API keys GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "apiKeys", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, status } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    if (!["ACTIVE", "REVOKED"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("api_keys")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, data: { id: data.id, status: data.status } });
  } catch (err) {
    console.error("[Fubrio] Admin API keys PUT error:", err);
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "apiKeys", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin API keys DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
