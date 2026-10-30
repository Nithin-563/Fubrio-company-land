import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "announcements", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { count: subscribersCount, error: subsErr } = await supabase
      .from("announcement_subscriptions")
      .select("*", { count: "exact", head: true });
    if (subsErr) console.warn("[Fubrio] subs count error:", subsErr.message);

    const { data: anns, error: annErr } = await supabase
      .from("announcements")
      .select("id, title, status, pinned, views_count, published_at, created_at")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false });
    if (annErr) console.warn("[Fubrio] ann list error:", annErr.message);

    const totalPublished = anns?.length ?? 0;
    const totalViews = (anns ?? []).reduce((sum, a: any) => sum + (a.views_count ?? 0), 0);

    return NextResponse.json({
      ok: true,
      stats: {
        subscribers: subscribersCount ?? 0,
        totalPublished,
        totalViews,
        announcements: (anns ?? []).map((a: any) => ({
          id: a.id,
          title: a.title,
          pinned: a.pinned,
          views: a.views_count ?? 0,
          publishedAt: a.published_at,
          createdAt: a.created_at,
        })),
      },
    });
  } catch (err) {
    console.error("[Fubrio] Announcement stats error:", err);
    return NextResponse.json({ ok: true, stats: { subscribers: 0, totalPublished: 0, totalViews: 0, announcements: [] } });
  }
}
