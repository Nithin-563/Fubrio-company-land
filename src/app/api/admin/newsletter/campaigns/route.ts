import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const rows = await db.newsletterCampaign.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Newsletter campaigns GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const body = await req.json();
  const { subject, body: campaignBody, send, startDate, endDate, category, tags } = body;

  if (!subject || !campaignBody) {
    return NextResponse.json({ ok: false, error: "Subject and body are required" }, { status: 400 });
  }

  try {
    const subscriberCount = await db.newsletterSubscriber.count({
      where: { status: "ACTIVE" },
    });

    const campaign = await db.newsletterCampaign.create({
      data: {
        subject,
        body: campaignBody,
        status: send ? "SENT" : "DRAFT",
        recipientCount: send ? subscriberCount : 0,
        sentAt: send ? new Date() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        category: category || "announcement",
        tags: tags ? JSON.stringify(tags) : "[]",
      },
    });

    if (send && subscriberCount > 0) {
      console.log(`[Fubrio] Newsletter "${subject}" marked as sent to ${subscriberCount} subscribers`);
    }

    await safeAuditLog({ userId, action: send ? "send" : "create", entity: "newsletter_campaign", entityId: campaign.id, metadata: { subject, recipients: subscriberCount } });
    return NextResponse.json({ ok: true, data: campaign, subscriberCount });
  } catch (err) {
    console.error("[Fubrio] Newsletter campaign POST error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  for (const f of ["subject", "body", "status", "category"]) {
    if (rest[f] !== undefined) data[f] = rest[f];
  }
  if (rest.tags !== undefined) data.tags = JSON.stringify(rest.tags);
  if (rest.startDate !== undefined) data.startDate = rest.startDate ? new Date(rest.startDate) : null;
  if (rest.endDate !== undefined) data.endDate = rest.endDate ? new Date(rest.endDate) : null;

  if (rest.status === "SENT" && rest.sendNow) {
    const subscriberCount = await db.newsletterSubscriber.count({
      where: { status: "ACTIVE" },
    });
    data.recipientCount = subscriberCount;
    data.sentAt = new Date();
  }

  try {
    const campaign = await db.newsletterCampaign.update({ where: { id }, data: data as any });
    await safeAuditLog({ userId, action: "update", entity: "newsletter_campaign", entityId: id, metadata: { changes: Object.keys(data) } });
    return NextResponse.json({ ok: true, data: campaign });
  } catch (err) {
    console.error("[Fubrio] Newsletter campaign PUT error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  try {
    await db.newsletterCampaign.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "newsletter_campaign", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Newsletter campaign DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
