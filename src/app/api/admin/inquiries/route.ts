import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "inquiries", "view", "inquiries.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const rows = await db.inquiry.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Inquiries GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "inquiries", "update", "inquiries.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const allowed: Record<string, unknown> = {};
  for (const f of ["status", "internalNotes", "assignedTo"]) {
    if (rest[f] !== undefined) allowed[f] = rest[f];
  }
  if (allowed.assignedTo === "czer-super-admin") {
    delete allowed.assignedTo;
  }
  try {
    const inquiry = await db.inquiry.update({ where: { id }, data: allowed as any });
    await safeAuditLog({ userId, action: "update", entity: "inquiry", entityId: id, metadata: { changes: Object.keys(allowed) } });
    return NextResponse.json({ ok: true, data: inquiry });
  } catch (err) {
    console.error("[Fubrio] Inquiries PUT error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "inquiries", "delete", "inquiries.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  try {
    await db.inquiry.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "inquiry", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Inquiries DELETE error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
