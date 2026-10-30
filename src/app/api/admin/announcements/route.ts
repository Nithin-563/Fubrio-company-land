import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession, canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { safeAuditLog } from "@/lib/audit";
import { sendPushToAllSubscribers } from "@/lib/push";
import { fireAnnouncementWebhooks } from "@/lib/webhooks";
import { getBaseUrl } from "@/lib/base-url";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

function rowToJson(r: any) {
  return {
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
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "announcements", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, data: (data ?? []).map(rowToJson) });
  } catch (err) {
    console.error("[Fubrio] Admin announcements GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "announcements", "create", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { title, body: annBody, image, status, pinned } = body;
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ ok: false, error: "Title is required (min 3 chars)" }, { status: 400 });
    }
    const insert: any = {
      title: title.trim(),
      body: annBody ?? null,
      image: image ?? null,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      pinned: !!pinned,
    };
    if (insert.status === "PUBLISHED") insert.published_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("announcements")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;

    if (insert.status === "PUBLISHED") {
      sendPushToAllSubscribers({
        title: data.title,
        body: annBody ? (annBody.length > 100 ? annBody.slice(0, 100) + "…" : annBody) : "New announcement from Fubrio",
        url: `${getBaseUrl(req)}/#announcements`,
      }).catch((e) => console.warn("[Fubrio] Push send failed:", e));

      fireAnnouncementWebhooks({
        id: data.id,
        title: data.title,
        body: data.body,
        image: data.image,
        pinned: data.pinned,
        publishedAt: data.published_at,
      }, getBaseUrl(req)).catch((e) => console.warn("[Fubrio] Webhook fire failed:", e));
    }

    await safeAuditLog({
      userId,
      action: "create",
      entity: "announcement",
      entityId: data.id,
      metadata: { title: data.title, status: insert.status },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin announcements POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "announcements", "update", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, title, body: annBody, image, status, pinned } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data: existing } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    const update: any = {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 3) {
        return NextResponse.json({ ok: false, error: "Title min 3 chars" }, { status: 400 });
      }
      update.title = title.trim();
    }
    if (annBody !== undefined) update.body = annBody ?? null;
    if (image !== undefined) update.image = image ?? null;
    if (status !== undefined) {
      update.status = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      if (update.status === "PUBLISHED" && existing?.status !== "PUBLISHED") {
        update.published_at = new Date().toISOString();
      }
    }
    if (pinned !== undefined) update.pinned = !!pinned;

    const { data, error } = await supabase
      .from("announcements")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    const wasPublished = existing?.status === "PUBLISHED";
    const isNowPublished = (update.status ?? existing?.status) === "PUBLISHED";
    if (!wasPublished && isNowPublished) {
      sendPushToAllSubscribers({
        title: data.title,
        body: data.body ? (String(data.body).length > 100 ? String(data.body).slice(0, 100) + "…" : String(data.body)) : "New announcement from Fubrio",
        url: `${getBaseUrl(req)}/#announcements`,
      }).catch((e) => console.warn("[Fubrio] Push send failed:", e));

      fireAnnouncementWebhooks({
        id: data.id,
        title: data.title,
        body: data.body,
        image: data.image,
        pinned: data.pinned,
        publishedAt: data.published_at,
      }, getBaseUrl(req)).catch((e) => console.warn("[Fubrio] Webhook fire failed:", e));
    }

    await safeAuditLog({
      userId,
      action: "update",
      entity: "announcement",
      entityId: id,
      metadata: { changes: Object.keys(update) },
    });

    return NextResponse.json({ ok: true, data: rowToJson(data) });
  } catch (err) {
    console.error("[Fubrio] Admin announcements PUT error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "announcements", "delete", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;

    await safeAuditLog({ userId, action: "delete", entity: "announcement", entityId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Admin announcements DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
