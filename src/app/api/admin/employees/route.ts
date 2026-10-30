import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { safeAuditLog } from "@/lib/audit";
import { getMasterCzerCode, secretsMatch } from "@/lib/security";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

function gen6DigitCode(): string {
  const min = 100000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!can((session.user as { role: string }).role, "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: "desc" });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      avatar: r.avatar,
      czerCode: r.czer_code,
      role: r.role,
      status: r.status,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const { data: perms } = await supabase
      .from("employee_permissions")
      .select("employee_id, section, actions");

    const permsByEmp: Record<string, Record<string, string[]>> = {};
    for (const p of perms ?? []) {
      const empId = p.employee_id as string;
      if (!permsByEmp[empId]) permsByEmp[empId] = {};
      let acts: string[] = [];
      if (Array.isArray(p.actions)) acts = p.actions as string[];
      else if (typeof p.actions === "string") {
        try { acts = JSON.parse(p.actions) as string[]; } catch { acts = []; }
      }
      permsByEmp[empId][p.section as string] = acts;
    }

    for (const r of rows) {
      (r as any).permissions = permsByEmp[r.id] ?? {};
    }

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Employees GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!can((session.user as { role: string }).role, "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { email, name, avatar, czerCode, expiresAt, permissions } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase())) {
      return NextResponse.json({ ok: false, error: "A valid email address is required" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const { data: existing } = await supabase
      .from("employees")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: false, error: "An employee with this email already exists" }, { status: 409 });
    }

    let code = String(czerCode ?? "").trim();
    if (!code) {
      let tries = 0;
      while (tries < 50) {
        code = gen6DigitCode();
        const { data: c } = await supabase.from("employees").select("id").eq("czer_code", code).maybeSingle();
        if (!c) break;
        tries++;
      }
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ ok: false, error: "Czer code must be exactly 6 digits" }, { status: 400 });
    }
    if (secretsMatch(code, getMasterCzerCode())) {
      return NextResponse.json({ ok: false, error: "This code is reserved. Pick a different 6-digit code." }, { status: 400 });
    }
    const { data: codeExists } = await supabase
      .from("employees")
      .select("id")
      .eq("czer_code", code)
      .maybeSingle();
    if (codeExists) {
      return NextResponse.json({ ok: false, error: "This Czer code is already in use by another employee" }, { status: 409 });
    }

    let expiry: string | null = null;
    if (expiresAt && String(expiresAt).trim() !== "") {
      const d = new Date(expiresAt);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ ok: false, error: "Invalid expiry date" }, { status: 400 });
      }
      expiry = d.toISOString();
    }

    const { data: emp, error: insErr } = await supabase
      .from("employees")
      .insert({
        email: cleanEmail,
        name: name || null,
        avatar: avatar || null,
        czer_code: code,
        role: "EMPLOYEE",
        status: "ACTIVE",
        expires_at: expiry,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    if (permissions && typeof permissions === "object") {
      const permsToInsert = Object.entries(permissions)
        .filter(([section, acts]) => Array.isArray(acts) && acts.length > 0)
        .map(([section, acts]) => ({
          employee_id: emp.id,
          section,
          actions: acts,
        }));
      if (permsToInsert.length > 0) {
        const { error: permErr } = await supabase.from("employee_permissions").insert(permsToInsert);
        if (permErr) {
          console.error("[Fubrio] Failed to insert employee permissions:", permErr);
        }
      }
    }

    await safeAuditLog({
      userId,
      action: "create",
      entity: "employee",
      entityId: emp.id,
      metadata: { email: cleanEmail, code, sections: permissions ? Object.keys(permissions) : [] },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: emp.id,
        email: emp.email,
        name: emp.name,
        avatar: emp.avatar,
        czerCode: emp.czer_code,
        status: emp.status,
        expiresAt: emp.expires_at,
        createdAt: emp.created_at,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Employees POST error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!can((session.user as { role: string }).role, "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const { id, email, name, avatar, czerCode, status, expiresAt, permissions, ...rest } = body;
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
      }
      update.email = cleanEmail;
    }
    if (name !== undefined) update.name = name || null;
    if (avatar !== undefined) update.avatar = avatar || null;
    if (czerCode !== undefined) {
      const code = String(czerCode).trim();
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ ok: false, error: "Czer code must be exactly 6 digits" }, { status: 400 });
      }
      if (secretsMatch(code, getMasterCzerCode())) {
        return NextResponse.json({ ok: false, error: "This code is reserved" }, { status: 400 });
      }
      const { data: codeExists } = await supabase
        .from("employees")
        .select("id")
        .eq("czer_code", code)
        .neq("id", id)
        .maybeSingle();
      if (codeExists) {
        return NextResponse.json({ ok: false, error: "This Czer code is already in use" }, { status: 409 });
      }
      update.czer_code = code;
    }
    if (status !== undefined) {
      if (!["ACTIVE", "SUSPENDED", "REVOKED"].includes(status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }
      update.status = status;
    }
    if (expiresAt !== undefined) {
      if (expiresAt && String(expiresAt).trim() !== "") {
        const d = new Date(expiresAt);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ ok: false, error: "Invalid expiry date" }, { status: 400 });
        }
        update.expires_at = d.toISOString();
      } else {
        update.expires_at = null; // no expiry
      }
    }

    const { data: updated, error: updErr } = await supabase
      .from("employees")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (updErr) throw updErr;

    if (permissions && typeof permissions === "object") {
      await supabase.from("employee_permissions").delete().eq("employee_id", id);
      const permsToInsert = Object.entries(permissions)
        .filter(([section, acts]: [string, any]) => Array.isArray(acts) && acts.length > 0)
        .map(([section, acts]: [string, any]) => ({
          employee_id: id,
          section,
          actions: acts,
        }));
      if (permsToInsert.length > 0) {
        const { error: permErr } = await supabase.from("employee_permissions").insert(permsToInsert);
        if (permErr) console.error("[Fubrio] Failed to update permissions:", permErr);
      }
    }

    await safeAuditLog({
      userId,
      action: "update",
      entity: "employee",
      entityId: id,
      metadata: { changes: Object.keys(update), permissionsChanged: !!permissions },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    console.error("[Fubrio] Employees PUT error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (!can((session.user as { role: string }).role, "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw error;

    await safeAuditLog({ userId, action: "delete", entity: "employee", entityId: id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] Employees DELETE error:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
