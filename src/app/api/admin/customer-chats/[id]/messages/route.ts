import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "customerChat", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data, error } = await supabase
      .from("customer_chat_messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const customerMsgIds = (data ?? []).filter((m: any) => m.sender_type === "customer" && !m.read_at).map((m: any) => m.id);
    if (customerMsgIds.length > 0) {
      await supabase
        .from("customer_chat_messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", customerMsgIds);
    }

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
    console.error("[Fubrio] Admin customer chat messages GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "customerChat", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const body = await req.json();
    if (!body?.body || typeof body.body !== "string" || body.body.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Message body required" }, { status: 400 });
    }

    const senderId = (session.user as { id?: string })?.id ?? null;
    const senderName = (session.user as { name?: string })?.name
      ?? (session.user as { email?: string })?.email
      ?? "Support";

    const { data, error } = await supabase
      .from("customer_chat_messages")
      .insert({
        chat_id: id,
        sender_type: "support",
        sender_id: senderId,
        sender_name: senderName,
        body: body.body.trim().slice(0, 5000),
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
        senderId: data.sender_id,
        senderName: data.sender_name,
        body: data.body,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Admin customer chat messages POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
