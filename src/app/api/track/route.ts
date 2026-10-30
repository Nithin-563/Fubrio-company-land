import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let visitorId = body.visitorId;
    if (!visitorId) {
      visitorId = uuid();
    }

    const path = body.path || "/";
    const referrer = body.referrer || null;
    const userAgent = req.headers.get("user-agent") || null;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    let isUnique = false;
    try {
      const existing = await db.visit.findFirst({
        where: { visitorId },
      });
      if (!existing) {
        isUnique = true; // First visit from this visitor
      }
    } catch {
      isUnique = true;
    }

    try {
      await db.visit.create({
        data: {
          visitorId,
          path,
          referrer,
          userAgent,
          country: null, // Would need an IP geolocation service
          isUnique,
        },
      });
    } catch {
    }

    return NextResponse.json({ ok: true, visitorId, isUnique });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail - tracking is non-critical
  }
}
