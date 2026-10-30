import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canSessionAccess } from "@/lib/types";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canSessionAccess(session, "analytics", "content.manage")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const totalVisits = await db.visit.count({});

    let totalUnique = 0;
    try {
      const allVisits = await db.visit.findMany({});
      const uniqueIds = new Set(allVisits.map((v: any) => v.visitorId));
      totalUnique = uniqueIds.size;
    } catch {
      totalUnique = 0;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    let todayVisits = 0;
    let todayUnique = 0;
    try {
      const todayAll = await db.visit.findMany({
        where: { createdAt: { gte: todayStart } },
      });
      todayVisits = todayAll.length;
      const todayIds = new Set(todayAll.map((v: any) => v.visitorId));
      todayUnique = todayIds.size;
    } catch {
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let weekVisits = 0;
    let weekUnique = 0;
    try {
      const weekAll = await db.visit.findMany({
        where: { createdAt: { gte: weekAgo } },
      });
      weekVisits = weekAll.length;
      const weekIds = new Set(weekAll.map((v: any) => v.visitorId));
      weekUnique = weekIds.size;
    } catch {
      weekVisits = totalVisits;
      weekUnique = totalUnique;
    }

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    let monthVisits = 0;
    let monthUnique = 0;
    try {
      const monthAll = await db.visit.findMany({
        where: { createdAt: { gte: monthAgo } },
      });
      monthVisits = monthAll.length;
      const monthIds = new Set(monthAll.map((v: any) => v.visitorId));
      monthUnique = monthIds.size;
    } catch {
      monthVisits = totalVisits;
      monthUnique = totalUnique;
    }

    let topPages: Array<{ path: string; visits: number }> = [];
    try {
      const allVisits = await db.visit.findMany({ take: 500 });
      const pageCounts: Record<string, number> = {};
      for (const v of allVisits) {
        const p = (v as any).path || "/";
        pageCounts[p] = (pageCounts[p] || 0) + 1;
      }
      topPages = Object.entries(pageCounts)
        .map(([path, visits]) => ({ path, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    } catch {
    }

    let topReferrers: Array<{ referrer: string; visits: number }> = [];
    try {
      const allVisits = await db.visit.findMany({ take: 500 });
      const refCounts: Record<string, number> = {};
      for (const v of allVisits) {
        const ref = (v as any).referrer;
        if (ref) {
          refCounts[ref] = (refCounts[ref] || 0) + 1;
        }
      }
      topReferrers = Object.entries(refCounts)
        .map(([referrer, visits]) => ({ referrer, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);
    } catch {
    }

    return NextResponse.json({
      ok: true,
      stats: {
        totalVisits,
        totalUnique,
        todayVisits,
        todayUnique,
        weekVisits,
        weekUnique,
        monthVisits,
        monthUnique,
        topPages,
        topReferrers,
      },
    });
  } catch (err) {
    console.error("[Fubrio] Analytics error:", err);
    return NextResponse.json({
      ok: true,
      stats: {
        totalVisits: 0,
        totalUnique: 0,
        todayVisits: 0,
        todayUnique: 0,
        weekVisits: 0,
        weekUnique: 0,
        monthVisits: 0,
        monthUnique: 0,
        topPages: [],
        topReferrers: [],
      },
    });
  }
}
