import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      image: r.image,
      status: r.status,
      pinned: r.pinned,
      viewsCount: r.views_count ?? 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      publishedAt: r.published_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Public announcements GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}
