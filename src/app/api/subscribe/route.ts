import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasTriggeredHoneypot } from "@/lib/security";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (hasTriggeredHoneypot(body)) {
      return NextResponse.json({ ok: true });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const name = parsed.data.name || null;

    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.status === "UNSUBSCRIBED") {
        await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", name: name || existing.name },
        });
      }
      return NextResponse.json({ ok: true, message: "Already subscribed" });
    }

    await db.newsletterSubscriber.create({
      data: {
        email,
        name,
        source: "website_footer",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Newsletter subscription error:", err);
    const msg = err instanceof Error ? err.message : "Subscription failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
