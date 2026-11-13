"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

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

    const load = () =>
      fetch("/api/bloom/status")
        .then((r) => r.json())
        .then((data) => setStatus(data))
        .catch(() => setStatus({ error: "unreachable" }));

    load().finally(() => setLoading(false));
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const bot = status?.bot;
  const live = bot?.ready === true && !status?.error;

  const servers = live ? (bot?.guilds ?? 0) : (parseInt(settings["bloom.servers"]) || fallback?.servers || 0);
  const users = live ? (bot?.users ?? 0) : (parseInt(settings["bloom.users"]) || fallback?.users || 0);
  const commands = live ? (bot?.commands ?? 0) : (parseInt(settings["bloom.commands"]) || fallback?.commands || 150);
  const online = live ? true : (settings["bloom.status"] === "online" || !settings["bloom.status"]);

  const rows: Array<{ label: string; value: string; accent?: boolean }> = [
    { label: "Status", value: loading ? "—" : online ? "Online" : "Offline", accent: online },
    { label: "Servers", value: servers > 0 ? servers.toLocaleString() : "—" },
    { label: "Members", value: users > 0 ? users.toLocaleString() : "—" },
    { label: "Commands", value: commands > 0 ? commands.toLocaleString() : "150" },
  ];

  return (
    <div className="border-t border-border">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between border-b border-border py-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {r.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[0.9375rem] ${r.accent ? "text-[var(--fubrio-accent)]" : ""}`}>
            {r.label === "Status" && (online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />)}
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}
