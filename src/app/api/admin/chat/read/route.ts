import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const me = (session.user as { id?: string })?.id ?? "czer-super-admin";
    const body = await req.json();
    const { messageId, conversationId } = body;

    if (messageId) {
      const { error } = await supabase
        .from("chat_read_receipts")
        .upsert(
          { message_id: messageId, user_id: me, conversation_id: null },
          { onConflict: "message_id,user_id", ignoreDuplicates: true },
        );
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (conversationId) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .neq("sender_id", me);
      if (msgs && msgs.length > 0) {
        const receipts = msgs.map((m: any) => ({
          message_id: m.id,
          user_id: me,
          conversation_id: conversationId,
        }));
        await supabase
          .from("chat_read_receipts")
          .upsert(receipts, { onConflict: "message_id,user_id", ignoreDuplicates: true });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Missing messageId or conversationId" }, { status: 400 });
  } catch (err) {
    console.error("[Fubrio] Chat read POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
