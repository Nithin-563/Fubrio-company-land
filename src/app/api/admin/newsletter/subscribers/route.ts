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
    const rows = await db.newsletterSubscriber.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Newsletter subscribers GET error:", err);
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
  const email = (body.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Already subscribed" }, { status: 400 });
  }

  try {
    const sub = await db.newsletterSubscriber.create({
      data: {
        email,
        name: body.name || null,
        source: body.source || "manual",
        status: "ACTIVE",
      },
    });
    await safeAuditLog({ userId, action: "create", entity: "newsletter_subscriber", entityId: sub.id, metadata: { email } });
    return NextResponse.json({ ok: true, data: sub });
  } catch (err) {
    console.error("[Fubrio] Newsletter subscriber POST error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
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
  for (const f of ["email", "name", "status", "source"]) {
    if (rest[f] !== undefined) data[f] = rest[f];
  }
  try {
    const sub = await db.newsletterSubscriber.update({ where: { id }, data: data as any });
    await safeAuditLog({ userId, action: "update", entity: "newsletter_subscriber", entityId: id, metadata: { changes: Object.keys(data) } });
    return NextResponse.json({ ok: true, data: sub });
  } catch (err) {
    console.error("[Fubrio] Newsletter subscriber PUT error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
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
    await db.newsletterSubscriber.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "newsletter_subscriber", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Newsletter subscriber DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
