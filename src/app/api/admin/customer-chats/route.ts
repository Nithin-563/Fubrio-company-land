import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "customerChat", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status"); // OPEN | CLOSED | null

    let q = supabase
      .from("customer_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    if (statusFilter === "OPEN" || statusFilter === "CLOSED") {
      q = q.eq("status", statusFilter);
    }

    const { data, error } = await q;
    if (error) throw error;

    const chatIds = (data ?? []).map((r: any) => r.id);
    let lastMsgs: Record<string, any> = {};
    let unreadCounts: Record<string, number> = {};
    if (chatIds.length > 0) {
      const { data: msgs } = await supabase
        .from("customer_chat_messages")
        .select("chat_id, body, sender_type, read_at, created_at")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false });
      for (const m of msgs ?? []) {
        if (!lastMsgs[m.chat_id]) lastMsgs[m.chat_id] = m;
      }
      for (const m of msgs ?? []) {
        if (m.sender_type === "customer" && !m.read_at) {
          unreadCounts[m.chat_id] = (unreadCounts[m.chat_id] || 0) + 1;
        }
      }
    }

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      sourceType: r.source_type,
      sourceId: r.source_id,
      customerEmail: r.customer_email,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerContactMethod: r.customer_contact_method,
      visitorId: r.visitor_id,
      status: r.status,
      subject: r.subject,
      assignedTo: r.assigned_to,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      lastMessage: lastMsgs[r.id]
        ? {
            body: lastMsgs[r.id].body,
            senderType: lastMsgs[r.id].sender_type,
            createdAt: lastMsgs[r.id].created_at,
          }
        : null,
      unreadCount: unreadCounts[r.id] || 0,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Admin customer-chats GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "customerChat", "content.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, status, assignedTo } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: any = {};
    if (status) update.status = status;
    if (assignedTo !== undefined) update.assigned_to = assignedTo;

    const { data, error } = await supabase
      .from("customer_chats")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, data: { id: data.id, status: data.status } });
  } catch (err) {
    console.error("[Fubrio] Admin customer-chats PUT error:", err);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
