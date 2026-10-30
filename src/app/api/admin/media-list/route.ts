import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "media.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const rows = await db.mediaAsset.findMany({ orderBy: [{ createdAt: "desc" }] });
  return NextResponse.json({
    ok: true,
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      type: r.type,
      mime: r.mime,
      size: r.size,
      alt: r.alt,
      caption: r.caption,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!can((session.user as { role: string }).role, "media.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  await db.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
