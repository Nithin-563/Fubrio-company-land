import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!canSessionAccess(session, "bloomStats", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("bot_guilds")
      .select("*")
      .order("member_count", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      member_count: r.member_count ?? 0,
      owner_id: r.owner_id,
      synced_at: r.synced_at,
      created_at: r.created_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Bot guilds GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}
