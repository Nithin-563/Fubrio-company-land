import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasServiceRole } from "@/lib/supabase-admin";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    supabaseConfigured: isSupabaseConfigured,
    serviceRole: hasServiceRole,
    writesEnabled: hasServiceRole,
  });
}
