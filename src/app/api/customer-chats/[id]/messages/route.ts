import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { verifyChatAccessToken } from "@/lib/security";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email")?.toLowerCase().trim();
    const token = url.searchParams.get("token");

    if (!email || !verifyChatAccessToken(id, email, token)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (email) {
      const { data: chat } = await supabase
        .from("customer_chats")
        .select("customer_email")
        .eq("id", id)
        .maybeSingle();
      if (chat && chat.customer_email !== email) {
        return NextResponse.json({ ok: false, error: "Not your chat" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("customer_chat_messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      chatId: r.chat_id,
      senderType: r.sender_type,
      senderId: r.sender_id,
      senderName: r.sender_name,
      body: r.body,
      readAt: r.read_at,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Customer chat messages GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

const postSchema = z.object({
  senderName: z.string().max(120).optional().nullable(),
  email: z.string().email().max(200),
  token: z.string().min(20).max(200),
  body: z.string().min(1, "Message is required").max(5000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    const d = parsed.data;
    if (!verifyChatAccessToken(id, d.email, d.token)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("customer_chat_messages")
      .insert({
        chat_id: id,
        sender_type: "customer",
        sender_name: d.senderName || null,
        body: d.body,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("customer_chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        chatId: data.chat_id,
        senderType: data.sender_type,
        senderName: data.sender_name,
        body: data.body,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Customer chat messages POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
