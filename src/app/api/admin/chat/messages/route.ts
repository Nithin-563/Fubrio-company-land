import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const me = (session.user as { id?: string })?.id ?? "czer-super-admin";
    const myEmail = (session.user as { email?: string })?.email ?? "czer@fubrio.in";
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    if (!conversationId) return NextResponse.json({ ok: false, error: "Missing conversationId" }, { status: 400 });

    const { data: part } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .or(`user_id.eq.${me},user_email.eq.${myEmail}`)
      .maybeSingle();
    if (!part) return NextResponse.json({ ok: false, error: "Not a participant" }, { status: 403 });

    const limit = Number(url.searchParams.get("limit") || 200);

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    const rows = (data ?? []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderEmail: m.sender_email,
      senderName: m.sender_name,
      type: m.type,
      body: m.body,
      fileUrl: m.file_url,
      fileName: m.file_name,
      fileSize: m.file_size,
      fileMime: m.file_mime,
      callStatus: m.call_status,
      callDuration: m.call_duration,
      createdAt: m.created_at,
    }));

    const othersMsgs = rows.filter((m: any) => m.senderId !== me);
    if (othersMsgs.length > 0) {
      const receiptsToInsert = othersMsgs.map((m: any) => ({
        conversation_id: conversationId,
        message_id: m.id,
        user_id: me,
      }));
      const { error: rErr } = await supabase
        .from("chat_read_receipts")
        .upsert(receiptsToInsert, { onConflict: "message_id,user_id", ignoreDuplicates: true });
      if (rErr) console.warn("[Fubrio] Read receipts error:", rErr.message);
    }

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Chat messages GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const me = (session.user as { id?: string })?.id ?? "czer-super-admin";
    const myEmail = (session.user as { email?: string })?.email ?? "czer@fubrio.in";
    const myName = (session.user as { name?: string })?.name ?? myEmail;

    const body = await req.json();
    const { conversationId, type, body: textBody, fileUrl, fileName, fileSize, fileMime, callStatus, callDuration } = body;
    if (!conversationId) return NextResponse.json({ ok: false, error: "Missing conversationId" }, { status: 400 });

    const { data: part } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .or(`user_id.eq.${me},user_email.eq.${myEmail}`)
      .maybeSingle();
    if (!part) return NextResponse.json({ ok: false, error: "Not a participant" }, { status: 403 });

    const msgType = ["text", "image", "file", "audio", "call"].includes(type) ? type : "text";
    const insert: any = {
      conversation_id: conversationId,
      sender_id: me,
      sender_email: myEmail,
      sender_name: myName,
      type: msgType,
    };
    if (textBody !== undefined) insert.body = textBody;
    if (fileUrl) insert.file_url = fileUrl;
    if (fileName) insert.file_name = fileName;
    if (fileSize !== undefined) insert.file_size = fileSize;
    if (fileMime) insert.file_mime = fileMime;
    if (callStatus) insert.call_status = callStatus;
    if (callDuration !== undefined) insert.call_duration = callDuration;

    const { data, error } = await supabase.from("chat_messages").insert(insert).select().single();
    if (error) throw error;

    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        senderEmail: data.sender_email,
        senderName: data.sender_name,
        type: data.type,
        body: data.body,
        fileUrl: data.file_url,
        fileName: data.file_name,
        fileSize: data.file_size,
        fileMime: data.file_mime,
        callStatus: data.call_status,
        callDuration: data.call_duration,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Chat messages POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
