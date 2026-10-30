"use client";

import { useEffect, useState } from "react";
import {
  Key, Trash2, Loader2, Bell, Sparkles, ShieldCheck, Clock, Webhook, ChevronDown, Megaphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userAvatar: string | null;
  authProvider: string;
  type: string;
  name: string;
  keyPrefix: string;
  keySuffix: string;
  webhookUrl: string | null;
  scopes: string[];
  status: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  logStats: { total: number; success: number; failed: number };
}

interface LogEntry {
  id: string;
  apiKeyId: string | null;
  type: string;
  status: string;
  requestData: any;
  responseData: any;
  errorMessage: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

const TYPE_META: Record<string, { label: string; icon: any }> = {
  announcements: { label: "Announcements", icon: Bell },
  ai: { label: "Wisee AI 1.0", icon: Sparkles },
  ads: { label: "Fubrio Ads", icon: Megaphone },
};

export function ApiKeysAdmin() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [keysRes, logsRes] = await Promise.all([
        fetch("/api/admin/api-keys"),
        fetch("/api/admin/api-keys/logs?limit=100"),
      ]);
      const keysJson = await keysRes.json();
      if (keysJson.ok) setKeys(keysJson.data);
      const logsJson = await logsRes.json();
      if (logsJson.ok) setLogs(logsJson.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "REVOKED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: newStatus } : k)));
        toast.success(newStatus === "ACTIVE" ? "Reactivated" : "Revoked");
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
      const res = await fetch(`/api/admin/api-keys?id=${deleteId}`, { method: "DELETE" });
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

  const filtered = keys.filter((k) => {
    if (typeFilter !== "all" && k.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (k.userEmail ?? "").toLowerCase().includes(q) ||
        (k.userName ?? "").toLowerCase().includes(q) ||
        (k.name ?? "").toLowerCase().includes(q) ||
        k.keyPrefix.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: keys.length,
    announcements: keys.filter((k) => k.type === "announcements").length,
    ai: keys.filter((k) => k.type === "ai").length,
    ads: keys.filter((k) => k.type === "ads").length,
    active: keys.filter((k) => k.status === "ACTIVE").length,
  };

  const filteredLogs = activeKeyId ? logs.filter((l) => l.apiKeyId === activeKeyId) : logs;

  return (
    <div>
      <SectionHeader
        title="API Keys"
        desc="Every public API key created by users. Revoke or delete any key, and audit recent API activity."
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatChip icon={<Key className="h-4 w-4" />} label="Total keys" value={stats.total} />
        <StatChip icon={<Bell className="h-4 w-4 text-[var(--fubrio-accent)]" />} label="Announcements" value={stats.announcements} accent />
        <StatChip icon={<Sparkles className="h-4 w-4 text-purple-500" />} label="Wisee AI" value={stats.ai} />
        <StatChip icon={<Megaphone className="h-4 w-4 text-blue-500" />} label="Ads" value={stats.ads} />
        <StatChip icon={<ShieldCheck className="h-4 w-4" />} label="Active" value={stats.active} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name, prefix…"
          className="bg-background sm:max-w-md"
        />
        <div className="flex gap-1.5 flex-wrap">
          {["all", "announcements", "ai", "ads"].map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="rounded-full capitalize"
            >
              {t === "ai" ? "Wisee AI" : t === "ads" ? "Ads" : t}
            </Button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-14" /></div>)
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No API keys created yet.
            </div>
          ) : (
            filtered.map((k) => {
              const meta = TYPE_META[k.type] ?? { label: k.type, icon: Key };
              return (
                <div key={k.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                      <meta.icon className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{k.name}</span>
                        <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            k.status === "ACTIVE"
                              ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30"
                              : "bg-destructive/15 text-destructive border-destructive/30",
                          )}
                        >
                          {k.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{k.authProvider}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>By {k.userName || k.userEmail}</span>
                        <span className="font-mono">{k.keyPrefix}…{k.keySuffix}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDate(k.createdAt)}
                        </span>
                        <span>Last used: {formatDate(k.lastUsedAt)}</span>
                      </div>
                      {k.webhookUrl && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Webhook className="h-3 w-3" />
                          <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">{k.webhookUrl}</code>
                        </div>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Logs: {k.logStats.total} total · {k.logStats.success} success · {k.logStats.failed} failed
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setActiveKeyId((id) => (id === k.id ? null : k.id))}
                      >
                        {activeKeyId === k.id ? "Hide logs" : "View logs"}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="rounded-full">
                            Status <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStatus(k.id, k.status)}>
                            {k.status === "ACTIVE" ? "Revoke" : "Reactivate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(k.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {activeKeyId === k.id && (
                    <div className="mt-3 rounded-lg border border-border bg-background p-3 max-h-64 overflow-y-auto">
                      {filteredLogs.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No log entries for this key yet.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {filteredLogs.slice(0, 50).map((l) => (
                            <div key={l.id} className="flex items-start gap-2 text-[11px] font-mono">
                              <span className={cn(
                                "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] uppercase",
                                l.status === "success" ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)]" : "bg-destructive/15 text-destructive",
                              )}>
                                {l.status}
                              </span>
                              <span className="text-muted-foreground">{l.type}</span>
                              <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                              {l.errorMessage && (
                                <span className="text-destructive truncate">{l.errorMessage}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this API key?</DialogTitle>
            <DialogDescription>
              This will permanently remove the key. The user&apos;s code that depends on it will stop working
              immediately. Logs are retained for audit purposes.
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
