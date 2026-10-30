"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Search, Send, Mail, Users, Check, Loader2, MailOpen, Clock, X, Edit2, Calendar, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  createdAt: string;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  status: string;
  recipientCount: number;
  sentAt: string | null;
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  tags: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  UNSUBSCRIBED: "bg-muted text-muted-foreground border-border",
  BOUNCED: "bg-destructive/15 text-destructive border-destructive/30",
  DRAFT: "bg-muted text-muted-foreground border-border",
  SENT: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  SCHEDULED: "bg-amber-500/15 text-amber-500 border-amber-500/30",
};

const CATEGORIES = ["announcement", "product_update", "newsletter", "event", "promotional", "blog_digest"];

export function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [showAddSub, setShowAddSub] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const [subEmail, setSubEmail] = useState("");
  const [subName, setSubName] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  const [cSubject, setCSubject] = useState("");
  const [cBody, setCBody] = useState("");
  const [cStartDate, setCStartDate] = useState("");
  const [cEndDate, setCEndDate] = useState("");
  const [cCategory, setCCategory] = useState("announcement");
  const [cTags, setCTags] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [subRes, campRes] = await Promise.all([
        fetch("/api/admin/newsletter/subscribers"),
        fetch("/api/admin/newsletter/campaigns"),
      ]);
      const subJson = await subRes.json();
      const campJson = await campRes.json();
      if (subJson.ok) setSubscribers(subJson.data);
      if (campJson.ok) setCampaigns(campJson.data);
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filteredSubs = subscribers.filter(
    (s) => !search || s.email.toLowerCase().includes(search.toLowerCase()) || (s.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = subscribers.filter((s) => s.status === "ACTIVE").length;

  const addSubscriber = async () => {
    if (!subEmail || !subEmail.includes("@")) { toast.error("Valid email required"); return; }
    setSavingSub(true);
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, name: subName }),
      });
      const json = await res.json();
      if (json.ok) { toast.success("Subscriber added"); setShowAddSub(false); setSubEmail(""); setSubName(""); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
    finally { setSavingSub(false); }
  };

  const updateSubscriberStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/newsletter/subscribers", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) { toast.success(`Status updated`); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const removeSubscriber = async () => {
    if (!deleteSubId) return;
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers?id=${deleteSubId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Removed"); setDeleteSubId(null); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const removeCampaign = async () => {
    if (!deleteCampaignId) return;
    try {
      const res = await fetch(`/api/admin/newsletter/campaigns?id=${deleteCampaignId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Campaign deleted"); setDeleteCampaignId(null); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const openCompose = () => {
    setEditingCampaign(null);
    setCSubject(""); setCBody(""); setCStartDate(""); setCEndDate("");
    setCCategory("announcement"); setCTags("");
    setShowCompose(true);
  };

  const openEditCampaign = (c: Campaign) => {
    setEditingCampaign(c);
    setCSubject(c.subject);
    setCBody(c.body);
    setCStartDate(c.startDate ? c.startDate.slice(0, 16) : "");
    setCEndDate(c.endDate ? c.endDate.slice(0, 16) : "");
    setCCategory(c.category || "announcement");
    setCTags(c.tags ? (typeof c.tags === "string" && c.tags.startsWith("[") ? JSON.parse(c.tags).join(", ") : c.tags) : "");
    setShowCompose(true);
  };

  const saveCampaign = async (sendNow: boolean) => {
    if (!cSubject || !cBody) { toast.error("Subject and body required"); return; }
    setSending(true);
    try {
      const tags = cTags.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = {
        subject: cSubject,
        body: cBody,
        send: sendNow,
        startDate: cStartDate || null,
        endDate: cEndDate || null,
        category: cCategory,
        tags,
      };

      let res;
      if (editingCampaign) {
        res = await fetch("/api/admin/newsletter/campaigns", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCampaign.id, ...payload, sendNow }),
        });
      } else {
        res = await fetch("/api/admin/newsletter/campaigns", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const json = await res.json();
      if (json.ok) {
        toast.success(sendNow ? `Sent to ${json.subscriberCount ?? activeCount} subscribers` : "Campaign saved");
        setShowCompose(false);
        await load();
      } else { toast.error(json.error ?? "Failed"); }
    } catch { toast.error("Network error"); }
    finally { setSending(false); }
  };

  const sendCampaignNow = async (id: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "SENT", sendNow: true }),
      });
      const json = await res.json();
      if (json.ok) { toast.success("Campaign sent"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
    finally { setSending(false); }
  };

  return (
    <div>
      <SectionHeader
        title="Newsletter"
        desc="Manage subscribers, compose announcements, and send campaigns."
        action={
          activeTab === "subscribers" ? (
            <Button onClick={() => setShowAddSub(true)} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4 mr-1.5" /> Add subscriber
            </Button>
          ) : (
            <Button onClick={openCompose} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-4 w-4 mr-1.5" /> Compose
            </Button>
          )
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[var(--fubrio-accent)]" /><div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div></div>
          <div className="mt-2 font-display text-2xl font-semibold">{subscribers.length}</div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--fubrio-accent)]" /><div className="text-xs uppercase tracking-wider text-muted-foreground">Active</div></div>
          <div className="mt-2 font-display text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><div className="text-xs uppercase tracking-wider text-muted-foreground">Campaigns</div></div>
          <div className="mt-2 font-display text-2xl font-semibold">{campaigns.length}</div>
        </div>
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-secondary/50">
        <button onClick={() => setActiveTab("subscribers")} className={cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors", activeTab === "subscribers" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Subscribers ({subscribers.length})</button>
        <button onClick={() => setActiveTab("campaigns")} className={cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors", activeTab === "campaigns" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Campaigns ({campaigns.length})</button>
      </div>

      {activeTab === "subscribers" && (
        <div>
          <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subscribers…" className="pl-10 bg-background" />
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-10" /></div>)
              : filteredSubs.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">No subscribers yet.</div>
              : filteredSubs.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0"><Mail className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{s.email}</div>
                    <div className="text-xs text-muted-foreground">{s.name ? s.name + " · " : ""}{s.source || "website"} · {new Date(s.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[s.status] ?? STATUS_COLORS.ACTIVE)}>{s.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="rounded-full">Manage</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {s.status !== "ACTIVE" && <DropdownMenuItem onClick={() => updateSubscriberStatus(s.id, "ACTIVE")}><Check className="h-3.5 w-3.5 mr-2" /> Set Active</DropdownMenuItem>}
                      {s.status !== "UNSUBSCRIBED" && <DropdownMenuItem onClick={() => updateSubscriberStatus(s.id, "UNSUBSCRIBED")}><Mail className="h-3.5 w-3.5 mr-2" /> Unsubscribe</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => setDeleteSubId(s.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : campaigns.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              <MailOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No campaigns yet. Click "Compose" to create your first announcement.
            </Card>
          ) : campaigns.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium truncate">{c.subject}</h3>
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_COLORS[c.status] ?? STATUS_COLORS.DRAFT)}>{c.status}</Badge>
                    {c.category && <Badge variant="outline" className="text-[10px]">{c.category}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {c.status === "SENT" ? (
                      <span className="inline-flex items-center gap-1"><Send className="h-3 w-3" /> Sent to {c.recipientCount} · {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : ""}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Draft · {new Date(c.createdAt).toLocaleDateString()}</span>
                    )}
                    {c.startDate && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Start: {new Date(c.startDate).toLocaleDateString()}</span>}
                    {c.endDate && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> End: {new Date(c.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="rounded-full">Manage</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditCampaign(c)}><Edit2 className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                    {c.status === "DRAFT" && <DropdownMenuItem onClick={() => sendCampaignNow(c.id)} disabled={sending}><Send className="h-3.5 w-3.5 mr-2" /> Send now</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => setDeleteCampaignId(c.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddSub} onOpenChange={(o) => !o && setShowAddSub(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add subscriber</DialogTitle><DialogDescription>Manually add an email to the newsletter list.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Email *</Label><Input type="email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="name@example.com" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Name (optional)</Label><Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="John Smith" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSub(false)}>Cancel</Button>
            <Button onClick={addSubscriber} disabled={savingSub}>{savingSub ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompose} onOpenChange={(o) => !o && setShowCompose(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit campaign" : "Compose announcement"}</DialogTitle>
            <DialogDescription>{editingCampaign ? "Edit the campaign details." : `Write a newsletter to send to ${activeCount} active subscribers.`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject *</Label>
              <Input value={cSubject} onChange={(e) => setCSubject(e.target.value)} placeholder="Big announcement from Fubrio!" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message *</Label>
              <Textarea value={cBody} onChange={(e) => setCBody(e.target.value)} rows={6} placeholder="Write your announcement here…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Start date (optional)</Label>
                <Input type="datetime-local" value={cStartDate} onChange={(e) => setCStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End date (optional)</Label>
                <Input type="datetime-local" value={cEndDate} onChange={(e) => setCEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select value={cCategory} onValueChange={setCCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input value={cTags} onChange={(e) => setCTags(e.target.value)} placeholder="launch, update, product" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            {!editingCampaign && (
              <Button variant="outline" onClick={() => saveCampaign(false)} disabled={sending || !cSubject || !cBody}>Save as draft</Button>
            )}
            <Button onClick={() => saveCampaign(true)} disabled={sending || !cSubject || !cBody} className="bg-foreground text-background hover:bg-foreground/90">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {editingCampaign ? "Update & Send" : `Send to ${activeCount} subscribers`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteSubId} onOpenChange={(o) => !o && setDeleteSubId(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Remove subscriber?</DialogTitle><DialogDescription>This will permanently remove the subscriber.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteSubId(null)}>Cancel</Button><Button variant="destructive" onClick={removeSubscriber}>Remove</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={!!deleteCampaignId} onOpenChange={(o) => !o && setDeleteCampaignId(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Delete campaign?</DialogTitle><DialogDescription>This will permanently delete the campaign.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteCampaignId(null)}>Cancel</Button><Button variant="destructive" onClick={removeCampaign}>Delete</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
