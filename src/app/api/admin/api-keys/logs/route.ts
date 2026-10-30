import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canSessionAccess(session, "apiKeys", "settings.manage")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const url = new URL(req.url);
    const apiKeyId = url.searchParams.get("apiKeyId");
    const limit = Math.min(500, Number(url.searchParams.get("limit") || 200));

    let q = supabase
      .from("api_key_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (apiKeyId) q = q.eq("api_key_id", apiKeyId);

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      apiKeyId: r.api_key_id,
      type: r.type,
      status: r.status,
      requestData: r.request_data,
      responseData: r.response_data,
      errorMessage: r.error_message,
      ip: r.ip,
      userAgent: r.user_agent,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[Fubrio] Admin API key logs GET error:", err);
    return NextResponse.json({ ok: true, data: [] });
  }
}
