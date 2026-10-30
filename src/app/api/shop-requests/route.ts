import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasTriggeredHoneypot, createChatAccessToken } from "@/lib/security";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  shopItemId: z.string().max(120).optional().nullable(),
  itemTitle: z.string().min(1, "Item title is required").max(300),
  itemType: z.string().max(60).default("app"),
  email: z.string().email("A valid email is required").max(200),
  phone: z.string().max(60).optional().nullable(),
  contactMethod: z.string().max(300).optional().nullable(),  // other contact: Discord, Telegram, etc.
  message: z.string().max(2000).optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (hasTriggeredHoneypot(body)) {
      return NextResponse.json({ ok: true, reference: "SR-SPAM" });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    const d = parsed.data;
    const { data, error } = await supabase.from("shop_requests").insert({
      shop_item_id: d.shopItemId || null,
      item_title: d.itemTitle,
      item_type: d.itemType || "app",
      buyer_email: d.email.toLowerCase(),
      buyer_phone: d.phone || null,
      contact_method: d.contactMethod || null,
      message: d.message || null,
      status: "NEW",
    }).select().single();

    if (error) throw error;

    let chatId: string | null = null;
    try {
      const { data: chat } = await supabase.from("customer_chats").insert({
        source_type: "shop",
        source_id: data?.id ?? null,
        customer_email: d.email.toLowerCase(),
        customer_name: null,
        customer_phone: d.phone || null,
        customer_contact_method: d.contactMethod || null,
        visitor_id: null,
        status: "OPEN",
        subject: `Buy request: ${d.itemTitle}`,
      }).select().single();
      chatId = chat?.id ?? null;
    } catch (e) {
      console.warn("[Fubrio] Failed to auto-create customer chat for shop request:", e);
    }

    await createNotification({
      type: "shop_request",
      title: `New shop buy request: ${d.itemTitle}`,
      body: `Buyer: ${d.email}${d.phone ? ` · ${d.phone}` : ""}`,
      link: "#admin/shopRequests",
      sourceId: data?.id ?? null,
    });

    return NextResponse.json({
      ok: true,
      id: data?.id ?? null,
      chatId,
      accessToken: chatId ? createChatAccessToken(chatId, d.email) : null,
      message: "Your request has been submitted to support@fubrio.in - we'll reach you shortly.",
    });
  } catch (err) {
    console.error("[Fubrio] Shop request submission error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Something went wrong";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "Fubrio shop requests API" });
}
