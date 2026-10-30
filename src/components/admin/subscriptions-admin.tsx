"use client";

import { useEffect, useState } from "react";
import {
  Crown, Plus, Trash2, Edit2, Loader2, IndianRupee, Check, X, RefreshCw,
  Sparkles, Megaphone, Bell, MessageCircle, ShieldCheck, Clock, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionHeader } from "@/components/admin/admin-shell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigate } from "@/lib/router";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceInr: number;
  period: string;
  priceType: string;
  aiCreditsPerDay: number;
  adsRequestsPerDay: number;
  features: string[];
  active: boolean;
  order: number;
}

interface Subscription {
  id: string;
  userEmail: string;
  planId: string;
  planName: string;
  priceInr: number;
  period: string;
  paymentStatus: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ChangeRequest {
  id: string;
  userEmail: string;
  planId: string;
  planName: string;
  originalPriceInr: number;
  requestedPriceInr: number;
  reason: string | null;
  status: string;
  adminResponse: string | null;
  chatId: string | null;
  createdAt: string;
}

const PERIODS = ["monthly", "yearly", "lifetime"];
const PRICE_TYPES = ["subscription", "use", "link"];

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}

function formatPeriod(p: string): string {
  if (p === "monthly") return "/mo";
  if (p === "yearly") return "/yr";
  if (p === "lifetime") return "once";
  return `/${p}`;
}

export function SubscriptionsAdmin() {
  const [tab, setTab] = useState<"plans" | "subs" | "changes">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [changeReqs, setChangeReqs] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [subsStats, setSubsStats] = useState({ total: 0, active: 0, pending: 0, failed: 0, revenueInr: 0 });

  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, changesRes] = await Promise.all([
        fetch("/api/admin/subscriptions/plans"),
        fetch("/api/admin/subscriptions/list"),
        fetch("/api/admin/subscriptions/change-requests"),
      ]);
      const plansJson = await plansRes.json();
      if (plansJson.ok) setPlans(plansJson.data);
      const subsJson = await subsRes.json();
      if (subsJson.ok) {
        setSubs(subsJson.data);
        setSubsStats(subsJson.stats);
      }
      const changesJson = await changesRes.json();
      if (changesJson.ok) setChangeReqs(changesJson.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openCreate = () => {
    setEditing({
      name: "", description: "", priceInr: 199, period: "monthly", priceType: "subscription",
      aiCreditsPerDay: 100, adsRequestsPerDay: 5000, features: [], active: true, order: plans.length,
    });
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing({ ...plan });
    setIsNew(false);
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name || editing.name.trim().length < 2) {
      toast.error("Name required");
      return;
    }
    if (typeof editing.priceInr !== "number" || editing.priceInr < 0) {
      toast.error("Valid price required");
      return;
    }
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const payload: any = { ...editing };
      if (!isNew && (editing as any).id) payload.id = (editing as any).id;
      const res = await fetch("/api/admin/subscriptions/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(isNew ? "Plan created" : "Plan updated");
        setShowForm(false);
        await loadAll();
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
      const res = await fetch(`/api/admin/subscriptions/plans?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Plan deleted");
        setDeleteId(null);
        await loadAll();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const updateChangeRequest = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions/change-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(`Marked as ${status.toLowerCase()}`);
        await loadAll();
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
        title="Subscriptions"
        desc="Manage subscription plans (in INR), view all user subscriptions, and review price-change requests. Payment via Instamojo."
        action={
          <Button onClick={openCreate} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> New plan
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatChip icon={<Crown className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Plans" value={plans.length} accent />
        <StatChip icon={<IndianRupee className="h-4 w-4" />} label="Active subs" value={subsStats.active} />
        <StatChip icon={<Clock className="h-4 w-4 text-amber-500" />} label="Pending" value={subsStats.pending} />
        <StatChip icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="Failed" value={subsStats.failed} />
        <StatChip icon={<IndianRupee className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Revenue ₹" value={subsStats.revenueInr} accent />
      </div>

      <div className="flex gap-1.5 mb-4 border-b border-border">
        {[
          { id: "plans", label: "Plans", icon: Crown },
          { id: "subs", label: "Subscriptions", icon: ShieldCheck },
          { id: "changes", label: "Price Requests", icon: MessageCircle },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-[var(--fubrio-accent)] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.id === "changes" && changeReqs.filter((c) => c.status === "PENDING").length > 0 && (
              <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)]">
                {changeReqs.filter((c) => c.status === "PENDING").length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-14" /></div>)
            ) : plans.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No plans yet. Click <strong>New plan</strong> to create your first.
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                      <Crown className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{plan.name}</span>
                        <Badge variant="outline" className="text-[10px]">₹{plan.priceInr}{formatPeriod(plan.period)}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{plan.priceType}</Badge>
                        {!plan.active && (
                          <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {plan.aiCreditsPerDay} AI/day</span>
                        <span className="inline-flex items-center gap-1"><Megaphone className="h-3 w-3" /> {plan.adsRequestsPerDay} ads/day</span>
                      </div>
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-1 text-[11px] text-muted-foreground">{plan.features.join(" · ")}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => openEdit(plan)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(plan.id)}
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
      )}

      {tab === "subs" && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-14" /></div>)
            ) : subs.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No subscriptions purchased yet.
              </div>
            ) : (
              subs.map((s) => (
                <div key={s.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{s.planName}</span>
                        <Badge variant="outline" className="text-[10px]">₹{s.priceInr}{formatPeriod(s.period)}</Badge>
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          s.status === "ACTIVE" ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30" :
                          s.paymentStatus === "failed" ? "bg-destructive/15 text-destructive border-destructive/30" :
                          "bg-muted text-muted-foreground",
                        )}>
                          {s.status === "ACTIVE" ? "Active" : s.paymentStatus === "pending" ? "Pending" : "Failed"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{s.userEmail}</span>
                        <span>Started: {formatDate(s.startedAt)}</span>
                        <span>Expires: {formatDate(s.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {tab === "changes" && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-14" /></div>)
            ) : changeReqs.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No price-change requests.
              </div>
            ) : (
              changeReqs.map((c) => (
                <div key={c.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                      <MessageCircle className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{c.planName}</span>
                        <Badge variant="outline" className="text-[10px]">₹{c.originalPriceInr} → ₹{c.requestedPriceInr}</Badge>
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          c.status === "PENDING" ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
                          c.status === "APPROVED" ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30" :
                          c.status === "REJECTED" ? "bg-destructive/15 text-destructive border-destructive/30" :
                          "bg-blue-500/15 text-blue-500 border-blue-500/30",
                        )}>{c.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        By {c.userEmail}
                      </div>
                      {c.reason && (
                        <div className="text-xs text-muted-foreground bg-background border border-border rounded-md p-2 mt-1">
                          {c.reason}
                        </div>
                      )}
                      {c.adminResponse && (
                        <div className="text-xs text-foreground bg-secondary border border-border rounded-md p-2 mt-1">
                          Admin: {c.adminResponse}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {c.chatId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => navigate(`#admin/customerChat`)}
                          title="Open chat in customer chat tab"
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Chat
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="rounded-full">Action</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateChangeRequest(c.id, "APPROVED")}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateChangeRequest(c.id, "COUNTERED")}>Counter</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateChangeRequest(c.id, "REJECTED")}>Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create plan" : "Edit plan"}</DialogTitle>
            <DialogDescription>
              Plans are visible on the public /#subscriptions page after a user signs in with Google.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Name *</Label>
                  <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="bg-background" placeholder="Pro" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Price (₹) *</Label>
                  <Input type="number" min={0} value={editing.priceInr ?? 0} onChange={(e) => setEditing({ ...editing, priceInr: Number(e.target.value) })} className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Period</Label>
                  <select
                    value={editing.period ?? "monthly"}
                    onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Price type</Label>
                  <select
                    value={editing.priceType ?? "subscription"}
                    onChange={(e) => setEditing({ ...editing, priceType: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {PRICE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Order</Label>
                  <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">AI credits / day</Label>
                  <Input type="number" min={0} value={editing.aiCreditsPerDay ?? 25} onChange={(e) => setEditing({ ...editing, aiCreditsPerDay: Number(e.target.value) })} className="bg-background" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Ads requests / day</Label>
                  <Input type="number" min={0} value={editing.adsRequestsPerDay ?? 1000} onChange={(e) => setEditing({ ...editing, adsRequestsPerDay: Number(e.target.value) })} className="bg-background" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Description (optional)</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Features (comma-separated)</Label>
                <Input
                  value={Array.isArray(editing.features) ? editing.features.join(", ") : ""}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  className="bg-background"
                  placeholder="Priority support, Custom models, Early access"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={editing.active ?? true} onCheckedChange={(v) => setEditing({ ...editing, active: v === true })} />
                <span>Active (visible on the public subscriptions page)</span>
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create plan" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this plan?</DialogTitle>
            <DialogDescription>
              Active subscribers will keep their subscription until it expires, but no new subscriptions can be purchased.
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
