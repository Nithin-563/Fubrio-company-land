"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Mail, Phone, Clock, Inbox, ShoppingBag, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShopRequest {
  id: string;
  shopItemId: string | null;
  itemTitle: string;
  itemType: string;
  buyerEmail: string;
  buyerPhone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["NEW", "CONTACTED", "CLOSED", "SPAM"];

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  CONTACTED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  CLOSED: "bg-muted text-muted-foreground border-border",
  SPAM: "bg-destructive/15 text-destructive border-destructive/30",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ShopRequestsAdmin() {
  const [requests, setRequests] = useState<ShopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shop-requests");
      const json = await res.json();
      if (json.ok) setRequests(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/shop-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success(`Marked as ${status.toLowerCase()}`);
      } else {
        toast.error(json.error ?? "Update failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/shop-requests?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("Deleted");
        setDeleteId(null);
        setRequests((prev) => prev.filter((r) => r.id !== deleteId));
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.itemTitle.toLowerCase().includes(q) ||
        r.buyerEmail.toLowerCase().includes(q) ||
        (r.buyerPhone ?? "").toLowerCase().includes(q) ||
        (r.message ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: requests.length,
    NEW: requests.filter((r) => r.status === "NEW").length,
    CONTACTED: requests.filter((r) => r.status === "CONTACTED").length,
    CLOSED: requests.filter((r) => r.status === "CLOSED").length,
  };

  return (
    <div>
      <SectionHeader
        title="Shop Requests"
        desc="Buyer inquiries submitted from the public shop. Reach out via email or phone to close the deal."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatChip icon={<Inbox className="h-4 w-4" />} label="Total" value={counts.all} />
        <StatChip icon={<ShoppingBag className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="New" value={counts.NEW} accent />
        <StatChip icon={<Mail className="h-4 w-4 text-blue-500" />} label="Contacted" value={counts.CONTACTED} />
        <StatChip icon={<Clock className="h-4 w-4 text-muted-foreground" />} label="Closed" value={counts.CLOSED} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by item, email, phone, message…"
          className="bg-background sm:max-w-md"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="rounded-full capitalize"
            >
              {s.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-14" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No shop requests yet. When a visitor clicks "Buy" on a shop item, their request will appear here.
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                    <ShoppingBag className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium truncate">{r.itemTitle}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{r.itemType}</Badge>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", STATUS_STYLE[r.status] ?? "")}>
                        {r.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${r.buyerEmail}`} className="hover:text-foreground underline-offset-2 hover:underline">
                          {r.buyerEmail}
                        </a>
                      </span>
                      {r.buyerPhone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${r.buyerPhone}`} className="hover:text-foreground underline-offset-2 hover:underline">
                            {r.buyerPhone}
                          </a>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    {r.message && (
                      <div className="mt-2 text-xs text-muted-foreground bg-background border border-border rounded-md p-2">
                        {r.message}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full">
                          Status <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS_OPTIONS.map((s) => (
                          <DropdownMenuItem key={s} onClick={() => updateStatus(r.id, s)} className="capitalize">
                            Mark as {s.toLowerCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(r.id)}
                      aria-label="Delete"
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

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete shop request?</DialogTitle>
            <DialogDescription>
              This will permanently remove the buy request. The buyer will not be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete
            </Button>
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
