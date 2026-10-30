import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.donator.findMany({
      where: { verified: true },
      orderBy: [{ amount: "desc" }, { date: "desc" }],
    });
    return NextResponse.json({
      ok: true,
      data: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount ?? 0),
        currency: r.currency || "USD",
        message: r.message,
        date: r.date ? (r.date instanceof Date ? r.date.toISOString() : String(r.date)) : null,
      })),
    });
  } catch {
    return NextResponse.json({ ok: true, data: [] });
  }
}
