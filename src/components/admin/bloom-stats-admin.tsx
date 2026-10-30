"use client";

import { useEffect, useState } from "react";
import {
  Bot, Server, Users, Command, Loader2, Save, RefreshCw, Server as ServerIcon,
  TrendingUp, Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BotGuild {
  id: string;
  name: string;
  icon: string | null;
  member_count: number;
  synced_at: string;
}

export function BloomStatsAdmin() {
  const [stats, setStats] = useState({
    servers: "",
    users: "",
    commands: "",
    status: "online",
    inviteUrl: "",
  });
  const [guilds, setGuilds] = useState<BotGuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.ok && json.settings) {
        setStats({
          servers: json.settings["bloom.servers"] ?? "",
          users: json.settings["bloom.users"] ?? "",
          commands: json.settings["bloom.commands"] ?? "150",
          status: json.settings["bloom.status"] ?? "online",
          inviteUrl: json.settings["bloom.inviteUrl"] ?? "",
        });
      }

      try {
        const guildRes = await fetch("/api/admin/bot-guilds");
        const guildJson = await guildRes.json();
        if (guildJson.ok) setGuilds(guildJson.data);
      } catch {}
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            "bloom.servers": stats.servers,
            "bloom.users": stats.users,
            "bloom.commands": stats.commands,
            "bloom.status": stats.status,
            "bloom.inviteUrl": stats.inviteUrl,
          },
        }),
      });
      const json = await res.json();
      if (json.ok) toast.success("Bloom stats saved");
      else toast.error(json.error ?? "Save failed");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const totalMembers = guilds.reduce((sum, g) => sum + (g.member_count || 0), 0);

  return (
    <div>
      <SectionHeader
        title="Bloom Stats"
        desc="Manage the Bloom bot's stats shown on bloom.fubrio.in. These values appear in the bot stats widget on the homepage."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading} className="rounded-full">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Reload
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save stats
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2">
            <ServerIcon className="h-4 w-4 text-[var(--fubrio-accent)]" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Servers</div>
          </div>
          <div className="mt-2 font-display text-2xl font-semibold text-[var(--fubrio-accent)]">
            {stats.servers || "0"}
          </div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Users</div>
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            {stats.users ? Number(stats.users).toLocaleString() : "0"}
          </div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2">
            <Command className="h-4 w-4" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Commands</div>
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            {stats.commands || "150"}
          </div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            <Badge variant="outline" className={cn(
              "text-[10px]",
              stats.status === "online"
                ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30"
                : "bg-destructive/15 text-destructive border-destructive/30"
            )}>
              {stats.status}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="h-4 w-4 text-[var(--fubrio-accent)]" />
          <div className="text-sm font-semibold">Edit Bloom bot stats</div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          These values are shown on the bloom.fubrio.in homepage in the bot stats widget.
          If the Bloom bot API is connected (BLOOM_BOT_API_URL + BLOOM_API_KEY), the live values
          from the bot will override these. Otherwise, these are the values shown.
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Server count</Label>
              <Input
                type="number"
                value={stats.servers}
                onChange={(e) => setStats({ ...stats, servers: e.target.value })}
                placeholder="e.g. 500"
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">How many Discord servers is Bloom in?</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Total users</Label>
              <Input
                type="number"
                value={stats.users}
                onChange={(e) => setStats({ ...stats, users: e.target.value })}
                placeholder="e.g. 150000"
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">Total users across all servers</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Total commands</Label>
              <Input
                type="number"
                value={stats.commands}
                onChange={(e) => setStats({ ...stats, commands: e.target.value })}
                placeholder="e.g. 150"
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">How many commands does Bloom have?</div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Bot status</Label>
              <select
                value={stats.status}
                onChange={(e) => setStats({ ...stats, status: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Bot invite URL (override)</Label>
              <Input
                type="text"
                value={stats.inviteUrl}
                onChange={(e) => setStats({ ...stats, inviteUrl: e.target.value })}
                placeholder="https://discord.com/oauth2/authorize?client_id=1550149986673631343"
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">
                Leave blank to use the default. This overrides the "Add to Discord" button URL.
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[var(--fubrio-accent)]" />
              <div className="text-sm font-semibold">Servers in database</div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {guilds.length} servers · {totalMembers.toLocaleString()} members
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            These are servers synced from the Bloom bot via the webhook. If the bot isn't connected, this list will be empty.
          </p>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {guilds.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No servers synced yet. The bot will sync its guild list when BLOOM_API_KEY is configured.
            </div>
          ) : (
            guilds.map((g) => (
              <div key={g.id} className="p-3 flex items-center gap-3 hover:bg-accent/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-muted text-xs font-semibold">
                  {g.icon ? <img src={g.icon} alt="" className="h-full w-full rounded-lg object-cover" /> : g.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{g.name}</div>
                  <div className="text-[10px] text-muted-foreground">{g.member_count.toLocaleString()} members</div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {g.synced_at ? new Date(g.synced_at).toLocaleDateString() : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
