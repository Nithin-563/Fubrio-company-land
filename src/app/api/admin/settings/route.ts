import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSession, canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { safeAuditLog } from "@/lib/audit";

function getRealUserId(session: any): string | null {
  const id = (session?.user as { id?: string })?.id;
  if (!id || id === "czer-super-admin") return null;
  return id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "settings", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const { data: rows, error } = await supabase
      .from("site_settings")
      .select("*");
    if (error) {
      console.error("[Fubrio] Settings GET error:", error);
      return NextResponse.json({ ok: true, settings: {} });
    }
    const settings: Record<string, string> = {};
    for (const r of rows ?? []) {
      if (r && r.key) settings[r.key] = r.value;
    }
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[Fubrio] Settings GET exception:", err);
    return NextResponse.json({ ok: true, settings: {} });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSession(session, "settings", "update", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const userId = getRealUserId(session);
    const body = await req.json();
    const settings = body.settings ?? {};

    const errors: string[] = [];
    let savedCount = 0;

    for (const [key, rawValue] of Object.entries(settings)) {
      const value = String(rawValue);
      try {
        const { data: updated, error: updErr, count } = await supabase
          .from("site_settings")
          .update({ value })
          .eq("key", key)
          .select("*");

        if (updErr) {
          console.error(`[Fubrio] Settings update error for "${key}":`, updErr);
          errors.push(`${key}: ${updErr.message}`);
          continue;
        }

        if (updated && updated.length > 0) {
          savedCount++;
          continue;
        }

        const { error: insErr } = await supabase
          .from("site_settings")
          .insert({ key, value });

        if (insErr) {
          if (insErr.message?.includes("duplicate") || insErr.code === "23505") {
            const { error: updErr2 } = await supabase
              .from("site_settings")
              .update({ value })
              .eq("key", key);
            if (updErr2) {
              console.error(`[Fubrio] Settings retry-update error for "${key}":`, updErr2);
              errors.push(`${key}: ${updErr2.message}`);
            } else {
              savedCount++;
            }
          } else {
            console.error(`[Fubrio] Settings insert error for "${key}":`, insErr);
            errors.push(`${key}: ${insErr.message}`);
          }
        } else {
          savedCount++;
        }
      } catch (rowErr: any) {
        console.error(`[Fubrio] Settings save exception for "${key}":`, rowErr);
        errors.push(`${key}: ${rowErr?.message ?? "unknown error"}`);
      }
    }

    await safeAuditLog({
      userId,
      action: "update",
      entity: "settings",
      entityId: null,
      metadata: { keys: Object.keys(settings), savedCount, errors: errors.length },
    });

    if (errors.length > 0) {
      return NextResponse.json({
        ok: false,
        error: `Failed to save settings: ${errors.join("; ")}`,
        savedCount,
        totalAttempted: Object.keys(settings).length,
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, savedCount });
  } catch (err) {
    console.error("[Fubrio] Settings PUT exception:", err);
    const msg = err instanceof Error ? err.message : (err as any)?.message || "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
