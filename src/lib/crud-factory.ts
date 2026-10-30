import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can, userCanAction } from "@/lib/types";
import type { EmployeePermissions } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

type ModelName =
  | "product" | "sponsor" | "partner" | "blogPost" | "service"
  | "testimonial" | "faq" | "inquiry" | "page" | "event"
  | "mediaAsset" | "navItem" | "footerColumn" | "category" | "user" | "metric"
  | "shopItem" | "shopRequest" | "announcement"
  | "chatConversation" | "chatMessage";

interface CrudConfig {
  model: ModelName;
  perm: string;
  jsonFields?: string[];
  slugField?: "title" | "name";
  hasAudit?: boolean;
  section?: string;
}

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

function getRole(session: any): string {
  return (session?.user as { role?: string } | undefined)?.role ?? "CONTRIBUTOR";
}

function getPermissions(session: any): EmployeePermissions | null {
  return (session?.user as { permissions?: EmployeePermissions } | undefined)?.permissions ?? null;
}

/**
 * Authorize for an action on a section.
 * - Super admin → always allowed
 * - ADMIN/EDITOR/CONTRIBUTOR → checked against the original permission model
 * - EMPLOYEE → checked against their granular per-section + per-action map
 *
 * Returns null if not authorized, otherwise returns the session.
 */
async function authorizeFor(
  cfg: CrudConfig,
  action: "view" | "create" | "update" | "delete",
): Promise<any | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const role = getRole(session);
  if (role === "SUPER_ADMIN") return session;
  if (role !== "EMPLOYEE") {
    return can(role, cfg.perm) ? session : null;
  }
  const perms = getPermissions(session);
  if (!cfg.section) return null; // employees can't access routes without a section mapping
  if (!userCanAction(role, perms, cfg.section, action, cfg.perm)) return null;
  return session;
}

export function createCrudHandler(cfg: CrudConfig) {
  const model = db[cfg.model] as any;

  async function GET() {
    const session = await authorizeFor(cfg, "view");
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    try {
      const rows = await model.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json({ ok: true, data: rows });
    } catch (err) {
      console.error(`[Fubrio] ${cfg.model} GET error:`, err);
      return NextResponse.json({ ok: true, data: [] });
    }
  }

  async function POST(req: NextRequest) {
    const session = await authorizeFor(cfg, "create");
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = getRealUserId(session);
    const body = await req.json();
    const data: Record<string, unknown> = { ...body };
    if (cfg.slugField && body[cfg.slugField]) {
      data.slug = body.slug ? slugify(body.slug) : slugify(body[cfg.slugField]);
    }
    delete data.id;
    delete data.tagIds;
    delete data.createdAt;
    delete data.updatedAt;

    try {
      const row = await model.create({ data });
      await safeAuditLog({ userId, action: "create", entity: cfg.model, entityId: row.id });
      return NextResponse.json({ ok: true, data: row });
    } catch (err) {
      console.error(`[Fubrio] ${cfg.model} POST error:`, err);
      const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  async function PUT(req: NextRequest) {
    const session = await authorizeFor(cfg, "update");
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const data: Record<string, unknown> = { ...rest };
    if (cfg.slugField && rest[cfg.slugField] && !rest.slug) {
      data.slug = slugify(rest[cfg.slugField]);
    } else if (rest.slug !== undefined) {
      data.slug = slugify(rest.slug);
    }
    delete data.id;
    delete data.tagIds;
    delete data.createdAt;
    delete data.updatedAt;

    try {
      const row = await model.update({ where: { id }, data });
      await safeAuditLog({ userId, action: "update", entity: cfg.model, entityId: id, metadata: { changes: Object.keys(data) } });
      return NextResponse.json({ ok: true, data: row });
    } catch (err) {
      console.error(`[Fubrio] ${cfg.model} PUT error:`, err);
      const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  async function DELETE(req: NextRequest) {
    const session = await authorizeFor(cfg, "delete");
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    try {
      await model.delete({ where: { id } });
      await safeAuditLog({ userId, action: "delete", entity: cfg.model, entityId: id });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error(`[Fubrio] ${cfg.model} DELETE error:`, err);
      const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  return { GET, POST, PUT, DELETE };
}
