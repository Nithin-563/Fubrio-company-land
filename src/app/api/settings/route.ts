import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) {
      if (r.key.startsWith("donation.") || r.key.startsWith("brand.") || r.key.startsWith("social.") || r.key.startsWith("seo.") || r.key.startsWith("email.") || r.key.startsWith("contact.") || r.key.startsWith("bloom.")) {
        settings[r.key] = r.value;
      }
    }
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: true, settings: {} });
  }
}
