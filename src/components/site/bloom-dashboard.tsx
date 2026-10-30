"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  ArrowLeft, Server, Shield, Loader2, Bot, Settings, Send, MessageSquare,
  ChevronRight, Check, AlertCircle, Lock, Bell, Sparkles, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  memberCount?: number;
  botInGuild: boolean;
}

interface GuildConfig {
  guildId?: string;
  guildName?: string;
  prefix?: string;
  modRole?: string | null;
  adminRole?: string | null;
  logging?: any;
  security?: any;
  ai?: any;
  welcome?: any;
  disabledCommands?: Record<string, boolean>;
  disabledCategories?: Record<string, boolean>;
  features?: {
    security: boolean;
    ticketAi: boolean;
    customCommands: number;
    applications: number;
    highlights: number;
  };
}

export function BloomDashboardPlaceholder({ botInviteUrl }: { botInviteUrl?: string }) {
  const { data: session, status } = useSession();
  const authProvider = (session?.user as any)?.authProvider;
  const hasDiscord = authProvider === "discord";

  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingPrefix, setSavingPrefix] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [configTab, setConfigTab] = useState<"overview" | "security" | "logging" | "ai" | "welcome">("overview");
  const [savingConfig, setSavingConfig] = useState(false);
  const [botConfigured, setBotConfigured] = useState(true);

  const loadGuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/guilds");
      const json = await res.json();
      if (json.ok) {
        setGuilds(json.data);
        setBotConfigured(json.botConfigured ?? true);
      } else {
        toast.error(json.error ?? "Failed to load guilds");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasDiscord) loadGuilds();
    else setLoading(false);
  }, [hasDiscord]);

  const [configState, setConfigState] = useState<"loading" | "loaded" | "notInGuild" | "notConfigured" | "error" | "expired">("loading");
  const [configMessage, setConfigMessage] = useState<string>("");

  const loadConfig = async (guildId: string) => {
    setLoadingConfig(true);
    setActiveGuildId(guildId);
    setConfigState("loading");
    setConfig(null);
    try {
      const res = await fetch(`/api/dashboard/guilds/${guildId}`);
      const json = await res.json();
      if (json.ok) {
        if (json.config) {
          setConfig(json.config);
          setPrefix(json.config?.prefix ?? "!");
          setConfigState("loaded");
        } else if (json.botNotInGuild) {
          setConfigState("notInGuild");
          setConfigMessage(json.message ?? "Bloom isn't in this server yet.");
        } else if (json.botNotConfigured) {
          setConfigState("notConfigured");
          setConfigMessage(json.message ?? "Bloom bot isn't connected to the website yet.");
        } else if (json.botError) {
          setConfigState("error");
          setConfigMessage(json.message ?? "Could not reach the Bloom bot.");
        } else {
          setConfigState("error");
          setConfigMessage("Unexpected response from the server.");
        }
      } else {
        if (json.expiredToken) {
          setConfigState("expired");
          setConfigMessage(json.error ?? "Your Discord session has expired.");
        } else {
          setConfigState("error");
          setConfigMessage(json.error ?? "Failed to load config.");
        }
      }
    } catch {
      setConfigState("error");
      setConfigMessage("Network error. Please check your connection.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const savePrefix = async () => {
    if (!activeGuildId) return;
    setSavingPrefix(true);
    try {
      const res = await fetch(`/api/dashboard/guilds/${activeGuildId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Prefix updated");
        setConfig(json.config);
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingPrefix(false);
    }
  };

  const saveConfig = async (updates: Record<string, any>) => {
    if (!activeGuildId) return;
    setSavingConfig(true);
    try {
      const res = await fetch(`/api/dashboard/guilds/${activeGuildId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Settings saved");
        setConfig(json.config);
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingConfig(false);
    }
  };

  if (status !== "loading" && !session) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </button>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Dashboard</div>
          <h1 className="display-heading mt-2 text-4xl">Sign in to manage Bloom</h1>
          <p className="mt-2 text-muted-foreground">Sign in with Discord to manage your Bloom bot settings across all your servers.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
            <Button
              onClick={() => {
                const callbackUrl = `${window.location.origin}/#dashboard`;
                signIn("discord", { callbackUrl });
              }}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Bot className="h-4 w-4 mr-2" /> Sign in with Discord
            </Button>
            <Button
              onClick={() => {
                const callbackUrl = `${window.location.origin}/#dashboard`;
                signIn("google", { callbackUrl });
              }}
              variant="outline"
              className="rounded-full"
            >
              <Shield className="h-4 w-4 mr-2" /> Sign in with Google
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Discord is recommended for guild management. Google works for API keys + subscriptions.
          </p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && !hasDiscord) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </button>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Dashboard</div>
          <h1 className="display-heading mt-2 text-4xl">Discord sign-in required</h1>
          <p className="mt-2 text-muted-foreground">
            You're signed in as <strong>{(session.user as any)?.email}</strong> via <strong>{authProvider}</strong>, but guild management requires Discord sign-in to verify your server ownership.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
            <Button
              onClick={() => {
                const callbackUrl = `${window.location.origin}/#dashboard`;
                signIn("discord", { callbackUrl });
              }}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Bot className="h-4 w-4 mr-2" /> Sign in with Discord
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        {!activeGuildId ? (
          <>
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Dashboard</div>
            <h1 className="display-heading mt-2 text-4xl">Your servers</h1>
            <p className="mt-2 text-muted-foreground">
              {guilds.length > 0
                ? `Manage Bloom across ${guilds.length} server${guilds.length === 1 ? "" : "s"}.`
                : "No manageable servers found. Make sure you have the Manage Server permission in a Discord server."}
            </p>

            {!botConfigured && (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <div className="font-medium mb-1">Bot connection not configured</div>
                  <div className="text-xs">
                    The Bloom bot API isn't connected. You can still see your servers, but live config + bot presence
                    detection won't work. Set <code className="font-mono">BLOOM_BOT_API_URL</code> and{" "}
                    <code className="font-mono">BLOOM_API_KEY</code> on Netlify to enable it.
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {guilds.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm font-medium mb-1">No servers to manage</div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Make sure Bloom is in your server and you have the Manage Server permission.
                  </div>
                  {botInviteUrl && (
                    <a href={botInviteUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                        <Bot className="h-4 w-4 mr-2" /> Add Bloom to your server
                      </Button>
                    </a>
                  )}
                </div>
              ) : (
                guilds.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => loadConfig(g.id)}
                    className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:border-[var(--fubrio-accent)]/40 transition-all flex items-center gap-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted text-base font-semibold flex-shrink-0 overflow-hidden">
                      {g.icon ? <img src={g.icon} alt="" className="h-full w-full object-cover" /> : g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{g.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.memberCount ? `${g.memberCount.toLocaleString()} members` : "Member count unknown"}
                      </div>
                    </div>
                    {g.botInGuild ? (
                      <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
                        <Check className="h-2.5 w-2.5 mr-1" /> Bloom active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Not in server
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setActiveGuildId(null)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-4">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to servers
            </button>

            {loadingConfig ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : configState === "loaded" && config ? (
              <>
                <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Server config</div>
                <h1 className="display-heading mt-2 text-3xl">{config.guildName}</h1>

                <div className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
                  {[
                    { id: "overview", label: "Overview", icon: Settings },
                    { id: "security", label: "Security", icon: Lock },
                    { id: "logging", label: "Logging", icon: Bell },
                    { id: "ai", label: "AI", icon: Sparkles },
                    { id: "welcome", label: "Welcome", icon: Users },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setConfigTab(t.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                        configTab === t.id
                          ? "border-[var(--fubrio-accent)] text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  {configTab === "overview" && (
                    <>
                      <Card className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings className="h-4 w-4 text-[var(--fubrio-accent)]" />
                          <div className="text-sm font-semibold">Command prefix</div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.slice(0, 5))}
                            className="bg-background font-mono"
                            placeholder="!"
                            maxLength={5}
                          />
                          <Button
                            onClick={savePrefix}
                            disabled={savingPrefix || prefix === (config.prefix ?? "!")}
                            size="sm"
                            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                          >
                            {savingPrefix ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-2">
                          The prefix Bloom uses for text commands. Slash commands always work.
                        </div>
                      </Card>

                      <Card className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-[var(--fubrio-accent)]" />
                          <div className="text-sm font-semibold">Active features</div>
                        </div>
                        <div className="space-y-1.5">
                          <FeatureRow label="Security" enabled={config.features?.security} />
                          <FeatureRow label="AI Ticket Assistant" enabled={config.features?.ticketAi} />
                          <FeatureRow label="Custom Commands" value={config.features?.customCommands} />
                          <FeatureRow label="Applications" value={config.features?.applications} />
                          <FeatureRow label="Highlights" value={config.features?.highlights} />
                        </div>
                      </Card>
                    </>
                  )}

                  {configTab === "security" && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-4 w-4 text-[var(--fubrio-accent)]" />
                        <div className="text-sm font-semibold">Security module</div>
                      </div>
                      <div className="space-y-4">
                        <ToggleRow
                          label="Enable security"
                          desc="Turn on the security module for this server"
                          checked={config.security?.enabled ?? false}
                          onChange={(v) => saveConfig({ security: { ...config.security, enabled: v } })}
                          saving={savingConfig}
                        />
                        <ToggleRow
                          label="Anti-raid"
                          desc="Automatically detect and block raid attempts"
                          checked={config.security?.antiRaid ?? false}
                          onChange={(v) => saveConfig({ security: { ...config.security, antiRaid: v } })}
                          saving={savingConfig}
                          disabled={!config.security?.enabled}
                        />
                        <ToggleRow
                          label="Anti-nuke"
                          desc="Block mass channel/role deletions"
                          checked={config.security?.antiNuke ?? false}
                          onChange={(v) => saveConfig({ security: { ...config.security, antiNuke: v } })}
                          saving={savingConfig}
                          disabled={!config.security?.enabled}
                        />
                        <ToggleRow
                          label="Anti-spam"
                          desc="Automatically detect and mute spammers"
                          checked={config.security?.antiSpam ?? false}
                          onChange={(v) => saveConfig({ security: { ...config.security, antiSpam: v } })}
                          saving={savingConfig}
                          disabled={!config.security?.enabled}
                        />
                        <ToggleRow
                          label="Anti-bot"
                          desc="Block bot accounts from joining"
                          checked={config.security?.antiBot ?? false}
                          onChange={(v) => saveConfig({ security: { ...config.security, antiBot: v } })}
                          saving={savingConfig}
                          disabled={!config.security?.enabled}
                        />
                      </div>
                    </Card>
                  )}

                  {configTab === "logging" && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-4 w-4 text-[var(--fubrio-accent)]" />
                        <div className="text-sm font-semibold">Logging module</div>
                      </div>
                      <div className="space-y-4">
                        <ToggleRow
                          label="Enable logging"
                          desc="Track member joins, leaves, message edits, deletes, and more"
                          checked={config.logging?.enabled ?? false}
                          onChange={(v) => saveConfig({ logging: { ...config.logging, enabled: v } })}
                          saving={savingConfig}
                        />
                        <ToggleRow
                          label="Log message edits"
                          desc="Log when members edit their messages"
                          checked={config.logging?.messageEdit ?? false}
                          onChange={(v) => saveConfig({ logging: { ...config.logging, messageEdit: v } })}
                          saving={savingConfig}
                          disabled={!config.logging?.enabled}
                        />
                        <ToggleRow
                          label="Log message deletes"
                          desc="Log when members delete their messages"
                          checked={config.logging?.messageDelete ?? false}
                          onChange={(v) => saveConfig({ logging: { ...config.logging, messageDelete: v } })}
                          saving={savingConfig}
                          disabled={!config.logging?.enabled}
                        />
                        <ToggleRow
                          label="Log member joins/leaves"
                          desc="Log when members join or leave the server"
                          checked={config.logging?.memberJoinLeave ?? false}
                          onChange={(v) => saveConfig({ logging: { ...config.logging, memberJoinLeave: v } })}
                          saving={savingConfig}
                          disabled={!config.logging?.enabled}
                        />
                        <ToggleRow
                          label="Log role changes"
                          desc="Log when roles are created, deleted, or assigned"
                          checked={config.logging?.roleChanges ?? false}
                          onChange={(v) => saveConfig({ logging: { ...config.logging, roleChanges: v } })}
                          saving={savingConfig}
                          disabled={!config.logging?.enabled}
                        />
                      </div>
                    </Card>
                  )}

                  {configTab === "ai" && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-4 w-4 text-[var(--fubrio-accent)]" />
                        <div className="text-sm font-semibold">AI module</div>
                      </div>
                      <div className="space-y-4">
                        <ToggleRow
                          label="Enable AI"
                          desc="Allow members to use /ask and AI features"
                          checked={config.ai?.enabled ?? false}
                          onChange={(v) => saveConfig({ ai: { ...config.ai, enabled: v } })}
                          saving={savingConfig}
                        />
                        <ToggleRow
                          label="Ticket AI assistant"
                          desc="AI automatically helps in support tickets"
                          checked={config.ai?.ticketAi ?? false}
                          onChange={(v) => saveConfig({ ai: { ...config.ai, ticketAi: v } })}
                          saving={savingConfig}
                          disabled={!config.ai?.enabled}
                        />
                        <ToggleRow
                          label="DM chat"
                          desc="Allow members to DM the bot for AI chat"
                          checked={config.ai?.dmChat ?? false}
                          onChange={(v) => saveConfig({ ai: { ...config.ai, dmChat: v } })}
                          saving={savingConfig}
                          disabled={!config.ai?.enabled}
                        />
                      </div>
                    </Card>
                  )}

                  {configTab === "welcome" && (
                    <Card className="glass-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-[var(--fubrio-accent)]" />
                        <div className="text-sm font-semibold">Welcome module</div>
                      </div>
                      <div className="space-y-4">
                        <ToggleRow
                          label="Enable welcome"
                          desc="Send a welcome message + card when members join"
                          checked={config.welcome?.enabled ?? false}
                          onChange={(v) => saveConfig({ welcome: { ...config.welcome, enabled: v } })}
                          saving={savingConfig}
                        />
                        <ToggleRow
                          label="Enable farewell"
                          desc="Send a farewell message when members leave"
                          checked={config.welcome?.farewell ?? false}
                          onChange={(v) => saveConfig({ welcome: { ...config.welcome, farewell: v } })}
                          saving={savingConfig}
                          disabled={!config.welcome?.enabled}
                        />
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          Configure welcome channels, messages, and image cards using the{" "}
                          <code className="font-mono text-[var(--fubrio-accent)]">/welcome</code> command in Discord.
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </>
            ) : configState === "notInGuild" ? (
              <div className="text-center py-16">
                <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <div className="font-display text-xl font-semibold mb-2">Bloom isn't in this server</div>
                <div className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{configMessage}</div>
                {botInviteUrl && (
                  <a href={botInviteUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Bot className="h-4 w-4 mr-2" /> Add Bloom to this server
                    </Button>
                  </a>
                )}
              </div>
            ) : configState === "notConfigured" ? (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <div className="font-display text-xl font-semibold mb-2">Bot not connected</div>
                <div className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{configMessage}</div>
                <div className="text-xs text-muted-foreground bg-secondary border border-border rounded-lg p-3 max-w-md mx-auto">
                  Set these env vars on Netlify:
                  <br />
                  <code className="font-mono text-[var(--fubrio-accent)]">BLOOM_BOT_API_URL</code> = your bot's URL
                  <br />
                  <code className="font-mono text-[var(--fubrio-accent)]">BLOOM_API_KEY</code> = shared secret
                  <br />
                  And set the same <code className="font-mono text-[var(--fubrio-accent)]">BLOOM_API_KEY</code> on the bot's hosting.
                </div>
              </div>
            ) : configState === "expired" ? (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <div className="font-display text-xl font-semibold mb-2">Session expired</div>
                <div className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{configMessage}</div>
                <Button
                  onClick={() => {
                    const callbackUrl = `${window.location.origin}/#dashboard`;
                    signIn("discord", { callbackUrl });
                  }}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  <Bot className="h-4 w-4 mr-2" /> Sign in again
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <div className="font-display text-xl font-semibold mb-2">Something went wrong</div>
                <div className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{configMessage}</div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => activeGuildId && loadConfig(activeGuildId)}
                >
                  Try again
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeatureRow({ label, enabled, value }: { label: string; enabled?: boolean; value?: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      {value !== undefined ? (
        <span className="font-mono font-semibold">{value}</span>
      ) : enabled ? (
        <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
          <Check className="h-2.5 w-2.5 mr-1" /> On
        </Badge>
      ) : (
        <span className="text-muted-foreground">Off</span>
      )}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, saving, disabled }: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 p-3 rounded-lg", disabled ? "opacity-50" : "")}>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
      )}
    </div>
  );
}
