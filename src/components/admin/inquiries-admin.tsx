"use client";

import { useEffect, useState } from "react";
import { Inbox, Mail, Trash2, Loader2, Filter, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SectionHeader } from "@/components/admin/admin-shell";
import { StatusBadge } from "@/components/admin/crud-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SerializedInquiry } from "@/lib/types";

const STATUSES = ["NEW", "IN_PROGRESS", "REPLIED", "RESOLVED", "ARCHIVED"];

export function InquiriesAdmin() {
  const [inquiries, setInquiries] = useState<SerializedInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<SerializedInquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      const json = await res.json();
      if (json.ok) setInquiries(json.data);
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = inquiries
    .filter((i) => filter === "all" || i.status === filter)
    .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase()) || i.reference.toLowerCase().includes(search.toLowerCase()));

  const open = (i: SerializedInquiry) => {
    setSelected(i);
    setNotes(i.internalNotes ?? "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: selected.status, internalNotes: notes }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Inquiry updated");
        setSelected(null);
        await load();
      } else toast.error(json.error ?? "Update failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Deleted"); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  return (
    <div>
      <SectionHeader title="Inquiries" desc="Contact form submissions stored in the database." />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {STATUSES.map((s) => {
          const count = inquiries.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                filter === s ? "border-[var(--fubrio-accent)]/40 bg-[var(--fubrio-accent-soft)]" : "border-border bg-card hover:bg-accent",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.replace("_", " ")}</div>
              <div className="font-display text-xl font-semibold">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or reference…" className="pl-10 bg-background" />
        </div>
        <Button variant="outline" onClick={() => setFilter("all")} disabled={filter === "all"} className="rounded-full">
          <Filter className="h-3.5 w-3.5 mr-1.5" /> Clear filter
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No inquiries found.</div>
          ) : (
            filtered.map((i) => (
              <div
                key={i.id}
                className="w-full flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors text-left cursor-pointer"
                onClick={() => open(i)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
                  <Inbox className="h-4 w-4 text-[var(--fubrio-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{i.name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{i.reference}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{i.email} · {i.inquiryType}{i.budget ? ` · ${i.budget}` : ""}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{i.message}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={i.status} />
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(i.createdAt).toLocaleDateString()}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); remove(i.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {selected.name}
                </DialogTitle>
                <DialogDescription>
                  Reference: <span className="font-mono">{selected.reference}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Email" value={selected.email} />
                <Info label="Type" value={selected.inquiryType} />
                {selected.company && <Info label="Company" value={selected.company} />}
                {selected.budget && <Info label="Budget" value={selected.budget} />}
                <Info label="Submitted" value={new Date(selected.createdAt).toLocaleString()} />
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Message</div>
                <div className="rounded-lg border border-border bg-background p-4 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Internal notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add internal notes (not visible to the submitter)…" />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={selected.status} onValueChange={(v) => setSelected({ ...selected, status: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={save} disabled={saving} className="ml-auto rounded-full bg-foreground text-background hover:bg-foreground/90">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium break-words">{value}</div>
    </div>
  );
}
