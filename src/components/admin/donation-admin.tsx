"use client";

import { useEffect, useState } from "react";
import {
  Heart, Loader2, Save, ExternalLink, Eye, EyeOff, Plus, Trash2, Edit2,
  GripVertical, ArrowUp, ArrowDown, Link as LinkIcon, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DonationLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  description: string | null;
  order: number;
  active: boolean;
  createdAt: string;
}

const ICON_OPTIONS = [
  { id: "coffee", label: "Coffee ☕" },
  { id: "patreon", label: "Patreon 🎨" },
  { id: "github", label: "GitHub 🐙" },
  { id: "paypal", label: "PayPal 💳" },
  { id: "ko-fi", label: "Ko-fi ☕" },
  { id: "stripe", label: "Stripe 💳" },
  { id: "venmo", label: "Venmo 💸" },
  { id: "cashapp", label: "Cash App 💵" },
  { id: "bitcoin", label: "Bitcoin ₿" },
  { id: "custom", label: "Custom 💖" },
];

export function DonationAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [links, setLinks] = useState<DonationLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [editingLink, setEditingLink] = useState<Partial<DonationLink> | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [isNewLink, setIsNewLink] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.ok) setValues(json.settings ?? {});
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Donation settings saved");
      } else {
        toast.error(json.error ?? "Save failed");
        await load();
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const loadLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await fetch("/api/admin/donation-links");
      const json = await res.json();
      if (json.ok) setLinks(json.data);
    } catch { toast.error("Network error"); }
    finally { setLoadingLinks(false); }
  };

  useEffect(() => { loadLinks(); }, []);

  const openCreateLink = () => {
    setEditingLink({ label: "", url: "", icon: "coffee", description: "", order: links.length, active: true });
    setIsNewLink(true);
    setShowLinkForm(true);
  };

  const openEditLink = (link: DonationLink) => {
    setEditingLink({ ...link });
    setIsNewLink(false);
    setShowLinkForm(true);
  };

  const saveLink = async () => {
    if (!editingLink) return;
    if (!editingLink.label || editingLink.label.trim().length < 2) {
      toast.error("Label must be at least 2 chars");
      return;
    }
    if (!editingLink.url || !/^https?:\/\/[^\s]+$/.test(editingLink.url.trim())) {
      toast.error("A valid http(s):// URL is required");
      return;
    }
    setSavingLink(true);
    try {
      const method = isNewLink ? "POST" : "PUT";
      const payload: any = { ...editingLink };
      if (!isNewLink && (editingLink as any).id) payload.id = (editingLink as any).id;
      const res = await fetch("/api/admin/donation-links", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNewLink ? "Donation link added" : "Donation link updated");
        setShowLinkForm(false);
        setEditingLink(null);
        await loadLinks();
      } else {
        toast.error(json.error ?? "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingLink(false);
    }
  };

  const removeLink = async () => {
    if (!deleteLinkId) return;
    try {
      const res = await fetch(`/api/admin/donation-links?id=${deleteLinkId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Link deleted");
        setDeleteLinkId(null);
        await loadLinks();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const toggleLinkActive = async (link: DonationLink) => {
    try {
      const res = await fetch("/api/admin/donation-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, active: !link.active }),
      });
      const json = await res.json();
      if (json.ok) {
        setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, active: !link.active } : l)));
        toast.success(link.active ? "Deactivated" : "Activated");
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const moveLink = async (link: DonationLink, direction: "up" | "down") => {
    const sortedLinks = [...links].sort((a, b) => a.order - b.order || (a.createdAt < b.createdAt ? 1 : -1));
    const idx = sortedLinks.findIndex((l) => l.id === link.id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedLinks.length) return;
    const swap = sortedLinks[swapIdx];
    const newOrder = swap.order;
    const swapNewOrder = link.order;
    setLinks((prev) => prev.map((l) => {
      if (l.id === link.id) return { ...l, order: newOrder };
      if (l.id === swap.id) return { ...l, order: swapNewOrder };
      return l;
    }));
    try {
      await Promise.all([
        fetch("/api/admin/donation-links", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: link.id, order: newOrder }),
        }),
        fetch("/api/admin/donation-links", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: swap.id, order: swapNewOrder }),
        }),
      ]);
    } catch {
      toast.error("Reorder failed");
      await loadLinks();
    }
  };

  const enabled = values["donation.enabled"] === "true";
  const url = values["donation.url"] || "";
  const text = values["donation.text"] || "Support Fubrio";

  const sortedLinks = [...links].sort((a, b) => a.order - b.order || (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <SectionHeader
        title="Donation"
        desc="Configure the donation banner + add as many donation URLs as you want. When visitors click Donate, they'll see a picker if there are multiple options."
        action={
          <div className="flex gap-2">
            <Button onClick={openCreateLink} variant="outline" className="rounded-full">
              <Plus className="h-4 w-4 mr-1.5" /> Add link
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save banner
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-[var(--fubrio-accent)]" />
              Banner configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <Skeleton className="h-40" />
            ) : (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl glass-input">
                  <div>
                    <div className="text-sm font-medium">Enable donation banner</div>
                    <div className="text-xs text-muted-foreground mt-1">Show the banner at the top of every page</div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(v) => setValues({ ...values, "donation.enabled": v ? "true" : "false" })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Banner text</Label>
                  <Input
                    value={text}
                    onChange={(e) => setValues({ ...values, "donation.text": e.target.value })}
                    placeholder="Support Fubrio's mission"
                    className="bg-background/50"
                  />
                  <p className="text-[11px] text-muted-foreground">The text shown next to the heart icon</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Fallback donation URL (optional)</Label>
                  <Input
                    value={url}
                    onChange={(e) => setValues({ ...values, "donation.url": e.target.value })}
                    placeholder="https://buymeacoffee.com/fubrio"
                    className="bg-background/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used only when no donation links are added below (or all are inactive). When visitors click Donate with 0 links, this URL is used directly.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-[var(--fubrio-accent)]" />
              Donation links
              <Badge variant="outline" className="text-[10px] ml-1">{links.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLinks ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : sortedLinks.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <div className="text-sm font-medium mb-1">No donation links yet</div>
                <div className="text-xs text-muted-foreground mb-4">
                  Add multiple donation URLs (Buy Me a Coffee, Patreon, GitHub Sponsors, etc.). When visitors click Donate, they&apos;ll see a picker dialog.
                </div>
                <Button onClick={openCreateLink} size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add first link
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedLinks.map((link, i) => (
                  <div
                    key={link.id}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border transition-colors",
                      link.active
                        ? "border-border bg-card"
                        : "border-border bg-secondary/30 opacity-70",
                    )}
                  >
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveLink(link, "up")}
                        disabled={i === 0}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveLink(link, "down")}
                        disabled={i === sortedLinks.length - 1}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{link.label}</span>
                        {!link.active && (
                          <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground hover:text-foreground hover:underline truncate block"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      onClick={() => toggleLinkActive(link)}
                      className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                      title={link.active ? "Deactivate" : "Activate"}
                    >
                      {link.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => openEditLink(link)}
                      className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteLinkId(link.id)}
                      className="p-1.5 rounded-full hover:bg-accent text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button onClick={openCreateLink} size="sm" variant="outline" className="w-full rounded-full mt-2">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add another link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Live preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enabled ? (
              <div className="rounded-xl border border-[var(--fubrio-accent)]/30 glass-strong p-4">
                <div className="flex items-center justify-center gap-3 py-2">
                  <Heart className="h-4 w-4 text-[var(--fubrio-accent)] flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{text}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] px-3 py-1 text-xs font-medium">
                    <Heart className="h-3 w-3" /> Donate
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground text-center">
                  {sortedLinks.filter((l) => l.active).length > 1
                    ? `Visitor sees a picker with ${sortedLinks.filter((l) => l.active).length} options`
                    : sortedLinks.filter((l) => l.active).length === 1
                      ? "Visitor goes straight to the single active link"
                      : url
                        ? "Visitor goes straight to the fallback URL"
                        : "No donation URL configured - visitor sees an info toast"}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <EyeOff className="h-8 w-8 text-muted-foreground mb-3" />
                <div className="text-sm font-medium">Banner is disabled</div>
                <div className="text-xs text-muted-foreground mt-1">Toggle the switch above to enable the donation banner</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showLinkForm} onOpenChange={(o) => !o && setShowLinkForm(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNewLink ? "Add donation link" : "Edit donation link"}</DialogTitle>
            <DialogDescription>
              Add a donation platform. Visitors will see all active links in a picker dialog when they click Donate.
            </DialogDescription>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Label *</Label>
                  <Input
                    value={editingLink.label ?? ""}
                    onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                    placeholder="Buy Me a Coffee"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Icon</Label>
                  <select
                    value={editingLink.icon ?? "coffee"}
                    onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">URL *</Label>
                <Input
                  value={editingLink.url ?? ""}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  placeholder="https://buymeacoffee.com/fubrio"
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
                <Textarea
                  value={editingLink.description ?? ""}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  rows={2}
                  placeholder="One-time or monthly support"
                  className="bg-background"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={editingLink.active ?? true}
                  onCheckedChange={(v) => setEditingLink({ ...editingLink, active: v })}
                />
                <span>Active (visible to visitors)</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkForm(false)}>Cancel</Button>
            <Button
              onClick={saveLink}
              disabled={savingLink}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {savingLink ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNewLink ? "Add link" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteLinkId} onOpenChange={(o) => !o && setDeleteLinkId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this donation link?</DialogTitle>
            <DialogDescription>
              This will permanently remove the link from the donation picker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLinkId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={removeLink}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
