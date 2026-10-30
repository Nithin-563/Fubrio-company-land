import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const me = (session.user as { id?: string; email?: string; name?: string })?.id ?? "czer-super-admin";
    const myEmail = (session.user as { email?: string })?.email ?? "czer@fubrio.in";

    const { data: myParts, error: partsErr } = await supabase
      .from("chat_participants")
      .select("conversation_id, user_id, user_email, user_name")
      .or(`user_id.eq.${me},user_email.eq.${myEmail}`);

    if (partsErr) throw partsErr;
    const conversationIds = (myParts ?? []).map((p) => p.conversation_id);

    if (conversationIds.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const { data: allParts } = await supabase
      .from("chat_participants")
      .select("conversation_id, user_id, user_email, user_name, user_avatar")
      .in("conversation_id", conversationIds);

    const { data: convs } = await supabase
      .from("chat_conversations")
      .select("*")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    const { data: lastMsgs } = await supabase
      .from("chat_messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    const lastByConv: Record<string, any> = {};
    for (const m of lastMsgs ?? []) {
      if (!lastByConv[m.conversation_id]) {
        lastByConv[m.conversation_id] = m;
      }
    }

    const result = (convs ?? []).map((c: any) => {
      const parts = (allParts ?? [])
        .filter((p: any) => p.conversation_id === c.id)
        .map((p: any) => ({
          userId: p.user_id,
          email: p.user_email,
          name: p.user_name,
          avatar: p.user_avatar,
        }));
      const last = lastByConv[c.id];
      const others = parts.filter((p: any) => p.userId !== me);
      return {
        id: c.id,
        type: c.type,
        name: c.name,
        participants: parts,
        others,
        lastMessage: last
          ? {
              id: last.id,
              type: last.type,
              body: last.body,
              senderId: last.sender_id,
              senderName: last.sender_name,
              fileName: last.file_name,
              createdAt: last.created_at,
              callStatus: last.call_status,
            }
          : null,
      };
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    console.error("[Fubrio] Chat conversations GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const me = (session.user as { id?: string })?.id ?? "czer-super-admin";
    const body = await req.json();
    const { participantIds, type, name } = body;
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ ok: false, error: "At least one participant is required" }, { status: 400 });
    }
    const convType = type === "group" ? "group" : "direct";

    const allIds = Array.from(new Set([me, ...participantIds]));
    const participantInfo: Record<string, { email: string; name: string; avatar?: string }> = {};

    const { data: users } = await supabase
      .from("users")
      .select("id, email, name, image")
      .in("id", allIds);
    for (const u of users ?? []) {
      participantInfo[u.id] = { email: u.email, name: u.name ?? u.email, avatar: u.image ?? undefined };
    }

    if (users && users.length < allIds.length) {
      const missing = allIds.filter((id) => !participantInfo[id]);
      if (missing.length > 0) {
        const { data: emps } = await supabase
          .from("employees")
          .select("id, email, name, avatar")
          .in("id", missing);
        for (const e of emps ?? []) {
          const { data: u } = await supabase
            .from("users")
            .select("id, email, name, image")
            .eq("email", e.email)
            .maybeSingle();
          if (u) {
            participantInfo[e.id] = { email: u.email, name: u.name ?? e.name ?? u.email, avatar: u.image ?? undefined };
            participantInfo[u.id] = { email: u.email, name: u.name ?? u.email, avatar: u.image ?? undefined };
          } else {
            participantInfo[e.id] = { email: e.email, name: e.name ?? e.email, avatar: e.avatar ?? undefined };
          }
        }
      }
    }

    const finalIds = Array.from(new Set([me, ...participantIds]));
    if (convType === "direct" && finalIds.length === 2) {
      const { data: existing } = await supabase
        .from("chat_participants")
        .select("conversation_id, user_id")
        .in("user_id", finalIds);
      const byConv: Record<string, Set<string>> = {};
      for (const p of existing ?? []) {
        if (!byConv[p.conversation_id]) byConv[p.conversation_id] = new Set();
        byConv[p.conversation_id].add(p.user_id);
      }
      for (const [cid, set] of Object.entries(byConv)) {
        if (set.size === 2 && finalIds.every((id) => set.has(id))) {
          return NextResponse.json({ ok: true, data: { id: cid, existing: true } });
        }
      }
    }

    const { data: conv, error: convErr } = await supabase
      .from("chat_conversations")
      .insert({
        type: convType,
        name: convType === "group" ? (name || "Group chat") : null,
        created_by: me,
      })
      .select()
      .single();
    if (convErr) throw convErr;

    const partsToInsert = finalIds.map((uid) => ({
      conversation_id: conv.id,
      user_id: uid,
      user_email: participantInfo[uid]?.email ?? uid,
      user_name: participantInfo[uid]?.name ?? uid,
      user_avatar: participantInfo[uid]?.avatar ?? null,
    }));
    const { error: pErr } = await supabase.from("chat_participants").insert(partsToInsert);
    if (pErr) throw pErr;

    return NextResponse.json({ ok: true, data: { id: conv.id } });
  } catch (err) {
    console.error("[Fubrio] Chat conversations POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("chat_conversations").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Chat conversations DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
