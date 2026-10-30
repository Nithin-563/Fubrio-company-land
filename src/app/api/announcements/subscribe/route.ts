import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().max(200),
    auth: z.string().max(200),
  }),
  visitorId: z.string().min(8).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid subscription" },
        { status: 400 },
      );
    }
    const { endpoint, keys, visitorId } = parsed.data;
    const { error } = await supabase
      .from("announcement_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          visitor_id: visitorId,
        },
        { onConflict: "endpoint", ignoreDuplicates: false },
      );
    if (error) {
      console.error("[Fubrio] Subscribe upsert error:", error);
      const { error: updErr } = await supabase
        .from("announcement_subscriptions")
        .update({ p256dh: keys.p256dh, auth: keys.auth, visitor_id: visitorId })
        .eq("endpoint", endpoint);
      if (updErr) {
        return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Subscribe POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    if (!endpoint) {
      return NextResponse.json({ ok: false, error: "Missing endpoint" }, { status: 400 });
    }
    const { error } = await supabase
      .from("announcement_subscriptions")
      .delete()
      .eq("endpoint", endpoint);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Unsubscribe error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
