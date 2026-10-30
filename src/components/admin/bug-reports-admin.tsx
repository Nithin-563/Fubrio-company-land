"use client";

import { useEffect, useState } from "react";
import {
  Bug, Lightbulb, Trash2, Loader2, Mail, Clock, ChevronDown,
  ExternalLink, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/admin/admin-shell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BugReport {
  id: string;
  type: string;
  projectName: string;
  body: string;
  email: string;
  userAgent: string | null;
  pageUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const STATUSES = ["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "WONT_FIX"];
const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  WONT_FIX: "Won't fix",
};
const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  ACKNOWLEDGED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  RESOLVED: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  WONT_FIX: "bg-muted text-muted-foreground border-border",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function BugReportsAdmin() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bug-reports");
      const json = await res.json();
      if (json.ok) setReports(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = reports.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.projectName.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: reports.length,
    bugs: reports.filter((r) => r.type === "bug").length,
    suggestions: reports.filter((r) => r.type === "suggestion").length,
    newCount: reports.filter((r) => r.status === "NEW").length,
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success(`Marked as ${STATUS_LABEL[status] ?? status}`);
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const saveNotes = async () => {
    if (!editingId) return;
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, adminNotes }),
      });
      const json = await res.json();
      if (json.ok) {
        setReports((prev) => prev.map((r) => (r.id === editingId ? { ...r, adminNotes } : r)));
        toast.success("Notes saved");
        setEditingId(null);
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/bug-reports?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Deleted");
        setDeleteId(null);
        await load();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Bug Reports & Suggestions"
        desc="User-submitted bug reports and feature suggestions from the floating button on the public site."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatChip icon={<Bug className="h-4 w-4 text-destructive" />} label="Bugs" value={stats.bugs} />
        <StatChip icon={<Lightbulb className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Suggestions" value={stats.suggestions} accent />
        <StatChip icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label="New" value={stats.newCount} />
        <StatChip icon={<Clock className="h-4 w-4" />} label="Total" value={stats.total} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project, body, email…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm sm:max-w-md"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", "bug", "suggestion"].map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="rounded-full capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="rounded-full text-[11px]"
            >
              {s === "all" ? "All" : STATUS_LABEL[s] ?? s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-20" /></div>)
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No reports/suggestions yet.
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                    {r.type === "bug"
                      ? <Bug className="h-3.5 w-3.5 text-destructive" />
                      : <Lightbulb className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {r.type}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[r.status] ?? "")}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                      <span className="text-xs font-medium">{r.projectName}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">{r.body}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-1">
                      <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-foreground hover:underline">
                        <Mail className="h-2.5 w-2.5" /> {r.email}
                      </a>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {formatDate(r.createdAt)}
                      </span>
                      {r.pageUrl && (
                        <a
                          href={r.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-foreground hover:underline truncate max-w-xs"
                        >
                          <ExternalLink className="h-2.5 w-2.5" /> {r.pageUrl.replace(/^https?:\/\//, "").slice(0, 50)}
                        </a>
                      )}
                    </div>
                    {r.adminNotes && (
                      <div className="mt-2 text-xs bg-secondary border border-border rounded-md p-2">
                        <span className="font-medium">Admin notes: </span>{r.adminNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => { setEditingId(r.id); setAdminNotes(r.adminNotes ?? ""); }}
                    >
                      Notes
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="rounded-full">
                          Status <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUSES.map((s) => (
                          <DropdownMenuItem key={s} onClick={() => updateStatus(r.id, s)}>
                            {STATUS_LABEL[s] ?? s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin notes</DialogTitle>
            <DialogDescription>Internal notes about this report - not visible to the submitter.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={6}
              className="bg-background mt-2"
              placeholder="Reproduced on Chrome 130… / Asked user for more details / Related to bug #123…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={saveNotes} className="bg-foreground text-background hover:bg-foreground/90">
              Save notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this report?</DialogTitle>
            <DialogDescription>This permanently removes the report/suggestion.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatChip({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className={cn("mt-2 font-display text-2xl font-semibold", accent && "text-[var(--fubrio-accent)]")}>{value}</div>
    </div>
  );
}
