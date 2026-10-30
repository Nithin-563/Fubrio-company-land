import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const rows = await db.auditLog.findMany({
    include: { user: true },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });
  return NextResponse.json({
    ok: true,
    data: rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      user: r.user ? { name: r.user.name, email: r.user.email } : null,
      action: r.action,
      entity: r.entity,
      entityId: r.entityId,
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
