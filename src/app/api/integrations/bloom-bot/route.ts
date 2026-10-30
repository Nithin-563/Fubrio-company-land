import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";


const schema = z.object({
  type: z.enum(["bug", "suggestion"]),
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(10000),
  email: z.string().email().optional().nullable(),
  server: z.string().max(200).optional().nullable(),
  user: z.string().max(200).optional().nullable(),
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
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }

    const d = parsed.data;

    const { data, error } = await supabase
      .from("bug_reports")
      .insert({
        type: d.type,
        project_name: "Bloom Bot",
        body: `${d.title}\n\n${d.description}${d.server ? `\n\nServer: ${d.server}` : ""}${d.user ? `\nUser: ${d.user}` : ""}`,
        email: d.email?.toLowerCase() ?? "bot-relay@bloom.fubrio.in",
        page_url: d.server ? `discord://guild/${d.server}` : null,
        status: "NEW",
      })
      .select()
      .single();

    if (error) throw error;

    await createNotification({
      type: "bug_report",
      title: `Bot ${d.type}: ${d.title}`,
      body: d.description.slice(0, 200),
      link: "#admin/bugReports",
      sourceId: data.id,
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    console.error("[Fubrio] Bloom bot webhook error:", err);
    const msg = err?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
