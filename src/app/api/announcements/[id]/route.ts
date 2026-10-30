import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  try {
    const { data: ann, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .eq("status", "PUBLISHED")
      .maybeSingle();

    if (error) throw error;
    if (!ann) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const url = new URL(req.url);
    const visitorId = url.searchParams.get("visitorId");
    if (visitorId) {
      try {
        const { error: viewErr } = await supabase
          .from("announcement_views")
          .upsert(
            { announcement_id: id, visitor_id: visitorId },
            { onConflict: "announcement_id,visitor_id", ignoreDuplicates: true },
          );
        if (viewErr && !viewErr.message.includes("duplicate")) {
          console.warn("[Fubrio] View track error:", viewErr.message);
        }
        await supabase.rpc("increment_announcement_views", { ann_id: id }).then(() => {});
        const { data: cur } = await supabase
          .from("announcement_views")
          .select("id", { count: "exact", head: false })
          .eq("announcement_id", id);
        await supabase
          .from("announcements")
          .update({ views_count: cur?.length ?? 0 })
          .eq("id", id);
      } catch (e) {
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: ann.id,
        title: ann.title,
        body: ann.body,
        image: ann.image,
        status: ann.status,
        pinned: ann.pinned,
        viewsCount: ann.views_count ?? 0,
        createdAt: ann.created_at,
        updatedAt: ann.updated_at,
        publishedAt: ann.published_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Public announcement GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load" }, { status: 500 });
  }
}
