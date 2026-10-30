import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id?: string })?.id ?? null;
    const isSuperAdmin = (session.user as { role?: string })?.role === "SUPER_ADMIN";

    const url = new URL(req.url);
    const limit = Math.min(200, Number(url.searchParams.get("limit") || 50));

    let q = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!isSuperAdmin && userId) {
      q = q.or(`user_id.is.null,user_id.eq.${userId}`);
    }

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      link: r.link,
      sourceId: r.source_id,
      readAt: r.read_at,
      createdAt: r.created_at,
    }));

    const unreadCount = rows.filter((r) => !r.readAt).length;

    return NextResponse.json({ ok: true, data: rows, unreadCount });
  } catch (err) {
    console.error("[Fubrio] Admin notifications GET error:", err);
    return NextResponse.json({ ok: true, data: [], unreadCount: 0 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id?: string })?.id ?? null;
    const isSuperAdmin = (session.user as { role?: string })?.role === "SUPER_ADMIN";

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      let q = supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (!isSuperAdmin && userId) {
        q = q.or(`user_id.is.null,user_id.eq.${userId}`);
      }
      const { error } = await q;
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin notifications PUT error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
