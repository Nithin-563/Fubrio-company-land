import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await db.shortLink.findUnique({ where: { slug } });
  if (!link || !link.active) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.json({ ok: false, error: "Expired" }, { status: 410 });
  }
  await db.shortLink.update({
    where: { id: link.id },
    data: { visits: { increment: 1 } },
  });
  return NextResponse.json({
    ok: true,
    link: {
      id: link.id,
      slug: link.slug,
      name: link.name,
      description: link.description,
      type: link.type,
      targetUrl: link.targetUrl,
      filePath: link.filePath,
      fileName: link.fileName,
      fileMime: link.fileMime,
      fileSize: link.fileSize,
      textContent: link.textContent,
      hasPassword: !!link.password,
      visits: link.visits + 1,
      createdAt: link.createdAt.toISOString(),
    },
  });
}
