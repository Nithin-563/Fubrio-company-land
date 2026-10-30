"use client";

import { useEffect, useState } from "react";
import { Bot, Server, Users, Command, Loader2, Wifi, WifiOff } from "lucide-react";


interface BotStatus {
  ok?: boolean;
  bot?: {
    id: string;
    tag: string;
    avatar: string | null;
    ready: boolean;
    guilds: number;
    users: number;
    commands: number;
    uptimeSeconds: number;
    ping: number;
  };
  error?: string;
}

export function BloomBotStatus({ fallback }: { fallback?: { servers: number; users: number; commands: number } }) {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setSettings(data.settings ?? {});
      })
      .catch(() => {});

    fetch("/api/bloom/status")
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ error: "unreachable" }))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetch("/api/bloom/status")
        .then((r) => r.json())
        .then((data) => setStatus(data))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl glass-card p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const bot = status?.bot;
  const isBotLive = bot?.ready === true && !status?.error;

  const servers = isBotLive ? (bot?.guilds ?? 0) : (parseInt(settings["bloom.servers"]) || fallback?.servers || 0);
  const users = isBotLive ? (bot?.users ?? 0) : (parseInt(settings["bloom.users"]) || fallback?.users || 0);
  const commands = isBotLive ? (bot?.commands ?? 0) : (parseInt(settings["bloom.commands"]) || fallback?.commands || 150);
  const online = isBotLive ? true : (settings["bloom.status"] === "online" || !settings["bloom.status"]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={online ? <Wifi className="h-4 w-4 text-[var(--fubrio-accent)]" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
        label="Status"
        value={online ? "Online" : "Offline"}
        accent={online}
      />
      <StatCard
        icon={<Server className="h-4 w-4" />}
        label="Servers"
        value={servers > 0 ? servers.toLocaleString() : "-"}
      />
      <StatCard
        icon={<Users className="h-4 w-4" />}
        label="Users"
        value={users > 0 ? users.toLocaleString() : "-"}
      />
      <StatCard
        icon={<Command className="h-4 w-4" />}
        label="Commands"
        value={commands > 0 ? commands.toString() : "150+"}
      />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl glass-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold ${accent ? "text-[var(--fubrio-accent)]" : ""}`}>{value}</div>
    </div>
  );
}
