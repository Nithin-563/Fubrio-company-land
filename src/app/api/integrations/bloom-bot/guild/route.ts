import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";


const schema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  icon: z.string().max(500).optional().nullable(),
  memberCount: z.number().int().optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const botKey = req.headers.get("x-bloom-bot-key");
    const expectedKey = process.env.BLOOM_API_KEY || process.env.BLOOM_BOT_API_KEY;
    if (!expectedKey || botKey !== expectedKey) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid guild data" }, { status: 400 });
    }

    const d = parsed.data;

    const { error } = await supabase
      .from("bot_guilds")
      .upsert({
        id: d.id,
        name: d.name,
        icon: d.icon,
        member_count: d.memberCount,
        synced_at: new Date().toISOString(),
      }, { onConflict: "id", ignoreDuplicates: false });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Fubrio] Bloom bot guild sync error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const botKey = req.headers.get("x-bloom-bot-key");
    const expectedKey = process.env.BLOOM_API_KEY || process.env.BLOOM_BOT_API_KEY;
    if (!expectedKey || botKey !== expectedKey) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const guildId = url.searchParams.get("id");
    if (!guildId) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("bot_guilds").delete().eq("id", guildId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Fubrio] Bloom bot guild remove error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
