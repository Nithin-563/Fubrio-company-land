import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/content";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) {
    return NextResponse.json({ ok: true, results: { projects: [], products: [], posts: [], sponsors: [], partners: [] } });
  }
  const results = await searchAll(q, 8);
  return NextResponse.json({ ok: true, results });
}
