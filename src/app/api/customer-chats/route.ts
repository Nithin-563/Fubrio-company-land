import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { hasTriggeredHoneypot, createChatAccessToken, verifyChatAccessToken } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email")?.toLowerCase().trim();
    const chatId = url.searchParams.get("id");
    const token = url.searchParams.get("token");

    if (!email || !chatId || !verifyChatAccessToken(chatId, email, token)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let q = supabase.from("customer_chats").select("*")
      .eq("id", chatId)
      .eq("customer_email", email);
    q = q.order("updated_at", { ascending: false });

    const { data, error } = await q;
    if (error) throw error;

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
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Customer chats GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

const createSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().max(120).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  contactMethod: z.string().max(300).optional().nullable(),
  visitorId: z.string().max(120).optional().nullable(),
  sourceType: z.string().max(60).default("general"),
  sourceId: z.string().max(120).optional().nullable(),
  subject: z.string().max(300).optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (hasTriggeredHoneypot(body)) return NextResponse.json({ ok: true, data: { id: null, existing: true } });
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    const d = parsed.data;
    const email = d.email.toLowerCase();

    const { data: existing } = await supabase
      .from("customer_chats")
      .select("*")
      .eq("customer_email", email)
      .eq("status", "OPEN")
      .maybeSingle();
    if (existing) {
      return NextResponse.json({
        ok: true,
        data: { id: existing.id, existing: true, accessToken: createChatAccessToken(existing.id, email) },
      });
    }

    const { data, error } = await supabase
      .from("customer_chats")
      .insert({
        source_type: d.sourceType,
        source_id: d.sourceId || null,
        customer_email: email,
        customer_name: d.name || null,
        customer_phone: d.phone || null,
        customer_contact_method: d.contactMethod || null,
        visitor_id: d.visitorId || null,
        status: "OPEN",
        subject: d.subject || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: { id: data.id, existing: false, accessToken: createChatAccessToken(data.id, email) },
    });
  } catch (err) {
    console.error("[Fubrio] Customer chats POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
