import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasTriggeredHoneypot } from "@/lib/security";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email").max(200),
  company: z.string().max(200).optional().nullable(),
  inquiryType: z.enum([
    "GENERAL", "PROJECT", "PARTNERSHIP", "SPONSORSHIP",
    "SUPPORT", "COLLABORATION", "CAREERS", "OTHER",
  ]),
  budget: z.string().max(120).optional().nullable(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  consent: z.boolean().refine((v) => v === true, "You must accept the consent checkbox"),
  website: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (hasTriggeredHoneypot(body)) {
      return NextResponse.json({ ok: true, reference: "INQ-SPAM" });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const reference = "INQ-" + uuid().slice(0, 8).toUpperCase();

    const inquiry = await db.inquiry.create({
      data: {
        reference,
        name: data.name,
        email: data.email.toLowerCase(),
        company: data.company || null,
        inquiryType: data.inquiryType,
        budget: data.budget || null,
        message: data.message,
        status: "NEW",
      },
    });

    await createNotification({
      type: "inquiry",
      title: `New inquiry: ${data.inquiryType.toLowerCase()} - ${data.name}`,
      body: data.message.slice(0, 200),
      link: "#admin/inquiries",
      sourceId: inquiry.id ?? reference,
    });

    return NextResponse.json({ ok: true, reference: inquiry.reference || reference });
  } catch (err) {
    console.error("[Fubrio] Inquiry submission error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Something went wrong";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "Fubrio inquiry API" });
}
