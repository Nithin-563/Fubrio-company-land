"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Eye, MousePointerClick, Globe, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalVisits: number;
  totalUnique: number;
  todayVisits: number;
  todayUnique: number;
  weekVisits: number;
  weekUnique: number;
  monthVisits: number;
  monthUnique: number;
  topPages: Array<{ path: string; visits: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
}

export function AnalyticsAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.stats) setStats(json.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Visits", value: stats?.totalVisits ?? 0, sub: "All-time page loads", icon: Eye, color: "text-[var(--fubrio-accent)]" },
    { label: "Unique Visitors", value: stats?.totalUnique ?? 0, sub: "Distinct people (excludes repeats)", icon: Users, color: "text-blue-500" },
    { label: "Today", value: stats?.todayVisits ?? 0, sub: `${stats?.todayUnique ?? 0} unique today`, icon: Calendar, color: "text-amber-500" },
    { label: "This Week", value: stats?.weekVisits ?? 0, sub: `${stats?.weekUnique ?? 0} unique this week`, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div>
      <SectionHeader
        title="Analytics"
        desc="Real visitor data - total visits, unique visitors, top pages, and referrers."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          statCards.map((s) => (
            <Card key={s.label} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {s.label}
                </CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl font-semibold">{s.value.toLocaleString()}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{s.sub}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!loading && stats && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-xs text-muted-foreground">Visits</div>
                <div className="font-display text-2xl font-semibold">{stats.monthVisits.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Unique Visitors</div>
                <div className="font-display text-2xl font-semibold text-[var(--fubrio-accent)]">{stats.monthUnique.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Visits/Visitor</div>
                <div className="font-display text-2xl font-semibold">
                  {stats.monthUnique > 0 ? (stats.monthVisits / stats.monthUnique).toFixed(1) : "0"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                Top Pages (by visits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topPages.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">No page data yet.</div>
              ) : (
                <div className="space-y-2">
                  {stats.topPages.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full glass-card text-[10px] font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{p.path}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{p.visits} visits</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Top Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topReferrers.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">No referrer data yet.</div>
              ) : (
                <div className="space-y-2">
                  {stats.topReferrers.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full glass-card text-[10px] font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{r.referrer}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{r.visits} visits</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && (
        <Card className="glass-card mt-6">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">How this works:</strong> Every visitor gets a unique ID stored in their browser. When they load a page, the visit is recorded with their ID, the page path, and their referrer.
              <br /><br />
              <strong className="text-foreground">Total Visits</strong> = every page load (including the same person visiting multiple times).
              <strong className="text-foreground"> Unique Visitors</strong> = distinct visitor IDs (excludes repeat visits from the same person).
              <br /><br />
              Data is stored in the <code className="font-mono text-[var(--fubrio-accent)]">visits</code> table in Supabase. All numbers are real.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
