import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession } from "@/lib/types";
import { db } from "@/lib/db";
import { safeAuditLog } from "@/lib/audit";
import { hash } from "bcryptjs";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "users", "view", "users.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const rows = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    ok: true,
    data: rows.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "users", "create", "users.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const body = await req.json();
  const { email, name, role, password } = body;
  if (!email || !email.includes("@")) return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ ok: false, error: "Password too short" }, { status: 400 });
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 400 });
  const passwordHash = await hash(password, 10);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      role: role || "CONTRIBUTOR",
      passwordHash,
    },
  });
  await safeAuditLog({ userId, action: "create", entity: "user", entityId: user.id, metadata: { email: user.email, role: user.role } });
  return NextResponse.json({ ok: true, data: { id: user.id, email: user.email, role: user.role } });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "users", "update", "users.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const userId = getRealUserId(session);
  const body = await req.json();
  const { id, name, role, password } = body;
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (password) {
    if (password.length < 6) return NextResponse.json({ ok: false, error: "Password too short" }, { status: 400 });
    data.passwordHash = await hash(password, 10);
  }
  const user = await db.user.update({ where: { id }, data: data as any });
  await safeAuditLog({ userId, action: "update", entity: "user", entityId: id, metadata: { changes: Object.keys(data) } });
  return NextResponse.json({ ok: true, data: { id: user.id, email: user.email, role: user.role } });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canSession(session, "users", "delete", "users.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  if (id === (session.user as { id?: string }).id) {
    return NextResponse.json({ ok: false, error: "Cannot delete your own account" }, { status: 400 });
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
