import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  console.warn("[Fubrio security] robots trap visited", {
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent") || "unknown",
  });
  return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}
