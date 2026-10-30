import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";
import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

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
    const rows = await db.shortLink.findMany({ orderBy: [{ createdAt: "desc" }] });
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Links GET error:", err);
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
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const name = (form.get("name") as string) || "Untitled";
    const slug = slugify((form.get("slug") as string) || name);
    const description = (form.get("description") as string) || null;
    const type = (form.get("type") as string) || "file";
    const targetUrl = (form.get("targetUrl") as string) || null;
    const textContent = (form.get("textContent") as string) || null;
    const embedHtml = (form.get("embedHtml") as string) || null;
    const password = (form.get("password") as string) || null;
    const expiresAt = (form.get("expiresAt") as string) || null;

    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileMime: string | null = null;
    let fileSize: number | null = null;

    const file = form.get("file") as File | null;
    if (file && file.size > 0) {
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json({ ok: false, error: "File too large (max 100MB)" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const safeName = `${uuid()}.${ext}`;
      const storagePath = `links/${safeName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(storagePath, buffer, { contentType: file.type || "application/octet-stream" });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(storagePath);
          if (urlData?.publicUrl) {
            filePath = urlData.publicUrl;
          }
        }
      } catch {
      }

      if (!filePath) {
        const base64 = buffer.toString("base64");
        filePath = `data:${file.type || "application/octet-stream"};base64,${base64}`;
      }

      fileName = file.name;
      fileMime = file.type || "application/octet-stream";
      fileSize = buffer.length;
    }

    const existing = await db.shortLink.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 400 });
    }

    try {
      const link = await db.shortLink.create({
        data: {
          slug, name, description, type, targetUrl,
          filePath, fileName, fileMime, fileSize,
          textContent, embedHtml, password,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: userId,
        },
      });
      await safeAuditLog({ userId, action: "create", entity: "shortLink", entityId: link.id, metadata: { slug, name, type } });
      return NextResponse.json({ ok: true, data: link });
    } catch (err) {
      console.error("[Fubrio] Links POST error:", err);
      const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  const body = await req.json();
  const slug = slugify(body.slug || body.name);
  const existing = await db.shortLink.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 400 });
  }
  try {
    const link = await db.shortLink.create({
      data: {
        slug, name: body.name,
        description: body.description || null,
        type: body.type || "redirect",
        targetUrl: body.targetUrl || null,
        textContent: body.textContent || null,
        embedHtml: body.embedHtml || null,
        password: body.password || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        createdBy: userId,
      },
    });
    await safeAuditLog({ userId, action: "create", entity: "shortLink", entityId: link.id, metadata: { slug, name, type: link.type } });
    return NextResponse.json({ ok: true, data: link });
  } catch (err) {
    console.error("[Fubrio] Links POST (JSON) error:", err);
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
  for (const f of ["name", "description", "type", "targetUrl", "textContent", "embedHtml", "password", "active"]) {
    if (rest[f] !== undefined) data[f] = rest[f];
  }
  if (rest.slug !== undefined) data.slug = slugify(rest.slug);
  if (rest.expiresAt !== undefined) data.expiresAt = rest.expiresAt ? new Date(rest.expiresAt) : null;
  try {
    const link = await db.shortLink.update({ where: { id }, data: data as any });
    await safeAuditLog({ userId, action: "update", entity: "shortLink", entityId: id, metadata: { changes: Object.keys(data) } });
    return NextResponse.json({ ok: true, data: link });
  } catch (err) {
    console.error("[Fubrio] Links PUT error:", err);
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
    await db.shortLink.delete({ where: { id } });
    await safeAuditLog({ userId, action: "delete", entity: "shortLink", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Links DELETE error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
