"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Edit2, Loader2, Pin, Eye, Bell, Users, Sparkles, Clock, X, Send,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  image: string | null;
  status: string;
  pinned: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface Stats {
  subscribers: number;
  totalPublished: number;
  totalViews: number;
  announcements: Array<{ id: string; title: string; pinned: boolean; views: number; publishedAt: string; createdAt: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function AnnouncementsAdmin() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch("/api/admin/announcements"),
        fetch("/api/admin/announcements/stats"),
      ]);
      const listJson = await listRes.json();
      if (listJson.ok) setItems(listJson.data);
      const statsJson = await statsRes.json();
      if (statsJson.ok) setStats(statsJson.stats);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing({ title: "", body: "", image: "", status: "DRAFT", pinned: false });
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing({ ...a });
    setIsNew(false);
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title || editing.title.trim().length < 3) {
      toast.error("Title is required (min 3 chars)");
      return;
    }
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const payload = { ...editing };
      if (!isNew && (editing as any).id) payload.id = (editing as any).id;
      const res = await fetch("/api/admin/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNew ? "Announcement created" : "Announcement updated");
        setShowForm(false);
        setEditing(null);
        await load();
      } else {
        toast.error(json.error ?? "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${deleteId}`, { method: "DELETE" });
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

  const togglePin = async (a: Announcement) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, pinned: !a.pinned }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(a.pinned ? "Unpinned" : "Pinned");
        await load();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const togglePublish = async (a: Announcement) => {
    try {
      const newStatus = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(newStatus === "PUBLISHED" ? "Published - push sent to subscribers" : "Unpublished");
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
        title="Announcements"
        desc="Publish announcements visible on the public Announcements page. Push notifications are sent to all subscribers when a new one goes live."
        action={
          <Button onClick={openCreate} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> New announcement
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatChip icon={<Users className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Subscribers" value={stats?.subscribers ?? 0} accent />
        <StatChip icon={<Bell className="h-4 w-4" />} label="Published" value={stats?.totalPublished ?? 0} />
        <StatChip icon={<Eye className="h-4 w-4" />} label="Total views" value={stats?.totalViews ?? 0} />
        <StatChip icon={<Sparkles className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Pinned" value={items.filter((a) => a.pinned).length} />
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-14" /></div>)
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No announcements yet. Click <strong>New announcement</strong> to create your first.
            </div>
          ) : (
            items.map((a) => (
              <div key={a.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                    <Bell className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{a.title}</span>
                      {a.pinned && (
                        <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
                          <Pin className="h-2.5 w-2.5 mr-1" /> Pinned
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        a.status === "PUBLISHED"
                          ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30"
                          : "bg-muted text-muted-foreground border-border",
                      )}>
                        {a.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {a.viewsCount} view{a.viewsCount === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(a.publishedAt || a.createdAt)}
                      </span>
                    </div>
                    {a.body && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{stripHtml(a.body)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => togglePin(a)}>
                      <Pin className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => togglePublish(a)}>
                      {a.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => openEdit(a)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create announcement" : "Edit announcement"}</DialogTitle>
            <DialogDescription>
              Publishing will instantly push a notification to every subscriber.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Title *</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Big launch! New product released today"
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Brand</Label>
                <select
                  value={(editing as any).brand ?? "fubrio"}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value } as any)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="fubrio">Fubrio</option>
                  <option value="bloom">Bloom</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Body (HTML allowed)</Label>
                <Textarea
                  value={editing.body ?? ""}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={8}
                  placeholder="<p>Write the announcement here. HTML tags are supported.</p>"
                  className="bg-background font-mono text-sm"
                />
                <div className="text-[10px] text-muted-foreground">
                  HTML is supported. Keep it short for best push-notification rendering.
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Cover image (optional)</Label>
                <ImageUpload value={editing.image ?? ""} onChange={(url) => setEditing({ ...editing, image: url })} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={editing.pinned ?? false}
                    onCheckedChange={(v) => setEditing({ ...editing, pinned: v === true })}
                  />
                  <span className="inline-flex items-center gap-1">
                    <Pin className="h-3.5 w-3.5" /> Pin to top
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={editing.status === "PUBLISHED"}
                    onCheckedChange={(v) => setEditing({ ...editing, status: v ? "PUBLISHED" : "DRAFT" })}
                  />
                  <span className="inline-flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" /> Publish immediately (sends push)
                  </span>
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete announcement?</DialogTitle>
            <DialogDescription>
              This will permanently remove the announcement and all its view records.
            </DialogDescription>
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

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
