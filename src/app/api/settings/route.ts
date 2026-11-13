import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isPublicSettingKey } from "@/lib/ai-config";

export async function GET() {
  try {
    const rows = await db.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const r of rows) {
      if (isPublicSettingKey(r.key)) {
        settings[r.key] = r.value;
      }
    }
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: true, settings: {} });
  }
}
