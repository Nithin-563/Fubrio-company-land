"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban, Package, Sparkles, Handshake, FileText, Inbox,
  Users, Image as ImageIcon, FileEdit, Star, HelpCircle, Calendar,
  ArrowUpRight, TrendingUp, AlertCircle, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import type { AdminSection } from "@/components/admin/admin-shell";
import { navigate } from "@/lib/router";

interface Stats {
  projects: number; products: number; sponsors: number; partners: number;
  posts: number; inquiries: number; pages: number; media: number;
  users: number; services: number; testimonials: number; faqs: number;
  events: number; newInquiries: number; draftProjects: number; draftPosts: number;
}

interface Activity {
  logs: Array<{
    id: string; action: string; entity: string; entityId: string | null;
    user: { name: string | null; email: string } | null;
    metadata: Record<string, unknown>; createdAt: string;
  }>;
  recentInquiries: Array<{
    id: string; reference: string; name: string; email: string;
    inquiryType: string; status: string; createdAt: string;
  }>;
}

interface Props {
  onNavigate: (s: AdminSection) => void;
}

const STAT_CARDS: Array<{ key: keyof Stats; label: string; icon: React.ComponentType<{ className?: string }>; section: AdminSection; accent?: boolean }> = [
  { key: "projects", label: "Projects", icon: FolderKanban, section: "projects" },
  { key: "products", label: "Products", icon: Package, section: "products" },
  { key: "posts", label: "Blog Posts", icon: FileText, section: "blog" },
  { key: "services", label: "Services", icon: TrendingUp, section: "services" },
  { key: "sponsors", label: "Sponsors", icon: Sparkles, section: "sponsors" },
  { key: "partners", label: "Partners", icon: Handshake, section: "partners" },
  { key: "testimonials", label: "Testimonials", icon: Star, section: "testimonials" },
  { key: "faqs", label: "FAQs", icon: HelpCircle, section: "faqs" },
  { key: "events", label: "Events", icon: Calendar, section: "events" },
  { key: "pages", label: "Pages", icon: FileEdit, section: "pages" },
  { key: "media", label: "Media", icon: ImageIcon, section: "media" },
  { key: "users", label: "Users", icon: Users, section: "users" },
];

export function AdminOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/activity").then((r) => r.json()).catch(() => null),
    ]).then(([s, a]) => {
      if (s?.ok) setStats(s.stats);
      if (a?.ok) setActivity(a);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <SectionHeader
        title="Dashboard overview"
        desc="Real-time stats and recent activity across the Fubrio platform."
        action={<Button onClick={() => navigate("#home")} variant="outline" className="rounded-full">View public site</Button>}
      />

      {stats && (stats.newInquiries > 0 || stats.draftProjects > 0 || stats.draftPosts > 0) && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.newInquiries > 0 && (
            <AlertCard
              icon={<Inbox className="h-4 w-4" />}
              label="New inquiries"
              value={stats.newInquiries}
              onClick={() => onNavigate("inquiries")}
              tone="accent"
            />
          )}
          {stats.draftProjects > 0 && (
            <AlertCard
              icon={<FolderKanban className="h-4 w-4" />}
              label="Draft projects"
              value={stats.draftProjects}
              onClick={() => onNavigate("projects")}
            />
          )}
          {stats.draftPosts > 0 && (
            <AlertCard
              icon={<FileText className="h-4 w-4" />}
              label="Draft posts"
              value={stats.draftPosts}
              onClick={() => onNavigate("blog")}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading || !stats ? (
          Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          STAT_CARDS.map((s) => (
            <button
              key={s.key}
              onClick={() => onNavigate(s.section)}
              className="group text-left"
            >
              <Card className="hover:border-[var(--fubrio-accent)]/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {s.label}
                  </CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-[var(--fubrio-accent)] transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="font-display text-3xl font-semibold">{stats[s.key] ?? 0}</div>
                  <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage <ArrowUpRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent inquiries</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("inquiries")} className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading || !activity ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
            ) : activity.recentInquiries.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">No inquiries yet.</div>
            ) : (
              activity.recentInquiries.map((i) => (
                <button
                  key={i.id}
                  onClick={() => onNavigate("inquiries")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
                    <Inbox className="h-4 w-4 text-[var(--fubrio-accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{i.name} <span className="text-muted-foreground">· {i.inquiryType}</span></div>
                    <div className="text-xs text-muted-foreground truncate">{i.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">{i.status}</Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("audit")} className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading || !activity || activity.logs.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                {loading ? "Loading…" : "No activity yet. Make a change in any admin section to see it here."}
              </div>
            ) : (
              activity.logs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary border border-border">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs">
                      <span className="font-medium">{log.user?.name ?? log.user?.email ?? "System"}</span>{" "}
                      <span className="text-muted-foreground">{log.action}d</span>{" "}
                      <span className="font-mono text-[10px]">{log.entity}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AlertCard({ icon, label, value, onClick, tone }: { icon: React.ReactNode; label: string; value: number; onClick: () => void; tone?: "accent" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
        tone === "accent"
          ? "border-[var(--fubrio-accent)]/40 bg-[var(--fubrio-accent-soft)]"
          : "border-border bg-card"
      }`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
        tone === "accent" ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)]" : "bg-secondary"
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-semibold">{value}</div>
      </div>
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
