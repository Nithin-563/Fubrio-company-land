import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

async function authorize(perm: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (!can((session.user as { role: string }).role, perm)) return null;
  return session;
}

export async function GET() {
  const session = await authorize("content.manage");
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await db.project.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Projects GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await authorize("content.manage");
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = getRealUserId(session);
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) {
    data.title = body.title;
    data.slug = body.slug ? slugify(body.slug) : slugify(body.title);
  }
  for (const f of [
    "shortDesc", "fullDesc", "thumbnail", "coverImage", "demoUrl", "githubUrl",
    "downloadUrl", "purchaseUrl", "status", "visibility", "client", "seoTitle", "seoDesc",
  ]) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  for (const f of ["gallery", "videos", "technologies", "contributors"]) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  if (body.featured !== undefined) data.featured = body.featured;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
  if (body.publishedAt !== undefined) data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  if (userId) data.authorId = userId;
  if (body.order !== undefined) data.order = body.order;

  try {
    const project = await db.project.create({ data: data as any });
    await safeAuditLog({ userId, action: "create", entity: "project", entityId: project.id, metadata: { title: project.title } });
    return NextResponse.json({ ok: true, data: project });
  } catch (err) {
    console.error("[Fubrio] Projects POST error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await authorize("content.manage");
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = getRealUserId(session);
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (rest.title !== undefined) {
    data.title = rest.title;
    if (!rest.slug) data.slug = slugify(rest.title);
  }
  if (rest.slug !== undefined) data.slug = slugify(rest.slug);
  for (const f of [
    "shortDesc", "fullDesc", "thumbnail", "coverImage", "demoUrl", "githubUrl",
    "downloadUrl", "purchaseUrl", "status", "visibility", "client", "seoTitle", "seoDesc",
  ]) {
    if (rest[f] !== undefined) data[f] = rest[f];
  }
  for (const f of ["gallery", "videos", "technologies", "contributors"]) {
    if (rest[f] !== undefined) data[f] = rest[f];
  }
  if (rest.featured !== undefined) data.featured = rest.featured;
  if (rest.categoryId !== undefined) data.categoryId = rest.categoryId || null;
  if (rest.publishedAt !== undefined) data.publishedAt = rest.publishedAt ? new Date(rest.publishedAt) : null;
  if (rest.order !== undefined) data.order = rest.order;

  try {
    const project = await db.project.update({ where: { id }, data: data as any });
    await safeAuditLog({ userId, action: "update", entity: "project", entityId: id, metadata: { changes: Object.keys(data) } });
    return NextResponse.json({ ok: true, data: project });
  } catch (err) {
    console.error("[Fubrio] Projects PUT error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await authorize("content.manage");
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const userId = getRealUserId(session);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  try {
    await db.project.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "project", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Projects DELETE error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
