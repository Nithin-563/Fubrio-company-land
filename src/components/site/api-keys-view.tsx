"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  ArrowLeft, Key, Plus, Trash2, Loader2, Check, Copy, Eye, EyeOff, Clock, Bell,
  Sparkles, Shield, AlertTriangle, ExternalLink, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  type: string;
  name: string;
  keyPrefix: string;
  keySuffix: string;
  webhookUrl: string | null;
  scopes: string[];
  status: string;
  authProvider: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

interface CreatedKey extends ApiKey {
  key: string; // plaintext, shown once
}

const API_TYPES = [
  {
    id: "announcements",
    label: "Announcements",
    description: "Receive a webhook POST every time Fubrio publishes a new announcement.",
    icon: Bell,
    accent: "var(--fubrio-accent)",
  },
  {
    id: "ai",
    label: "Wisee AI 1.0",
    description: "Call the Wisee AI 1.0 chat completion endpoint from your code.",
    icon: Sparkles,
    accent: "purple",
  },
  {
    id: "ads",
    label: "Fubrio Ads",
    description: "Embed ads on your site. Get paid per impression. Highest-paying provider integrated.",
    icon: Megaphone,
    accent: "blue",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function ApiKeysView() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyRemaining, setDailyRemaining] = useState<number>(3);
  const [dailyLimit, setDailyLimit] = useState<number>(3);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "announcements",
    name: "",
    webhookUrl: "",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [showPlaintext, setShowPlaintext] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const authProvider = (session?.user as { authProvider?: string })?.authProvider ?? "credentials";

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      const json = await res.json();
      if (json.ok) {
        setKeys(json.data);
        setDailyRemaining(json.dailyRemaining ?? 0);
        setDailyLimit(json.dailyLimit ?? 3);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") load();
    else setLoading(false);
  }, [status]);

  const startGoogleSignIn = () => {
    const callbackUrl = `${window.location.origin}/#api-keys`;
    signIn("google", { callbackUrl });
  };

  const create = async () => {
    setSaving(true);
    try {
      const payload: any = {
        type: form.type,
        name: form.name.trim(),
      };
      if (form.type === "announcements") {
        payload.webhookUrl = form.webhookUrl.trim();
      }
      if (form.expiresAt) {
        payload.expiresAt = new Date(form.expiresAt).toISOString();
      }

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        setCreatedKey(json.data);
        setShowForm(false);
        setShowPlaintext(true);
        setForm({ type: "announcements", name: "", webhookUrl: "", expiresAt: "" });
        await load();
        toast.success("API key created!");
      } else {
        toast.error(json.error ?? "Failed to create key");
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
      const res = await fetch(`/api/api-keys?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        toast.success("API key deleted");
        setDeleteId(null);
        await load();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const copyKey = () => {
    if (!createdKey?.key) return;
    navigator.clipboard.writeText(createdKey.key).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (status === "loading") {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-32 mb-4" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </button>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
            <Key className="h-3.5 w-3.5" />
            API Keys
          </div>
          <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Sign in to manage API keys</h1>
          <p className="mt-2 text-muted-foreground">
            API key creation requires Google authentication. Sign in with your Google account to continue.
          </p>
          <div className="mt-8">
            <Button onClick={startGoogleSignIn} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Shield className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (authProvider !== "google") {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </button>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
            <Key className="h-3.5 w-3.5" />
            API Keys
          </div>
          <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Google authentication required</h1>
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">Signed in via a different method</div>
              <div className="text-muted-foreground">
                You're signed in as <strong>{(session.user as { email?: string }).email}</strong> via{" "}
                <code className="px-1.5 py-0.5 bg-secondary rounded text-xs">{authProvider}</code>,
                but API key creation only works with Google authentication. Please sign out and sign back in with Google.
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={startGoogleSignIn} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Shield className="h-4 w-4 mr-2" />
              Sign in with Google instead
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full"
            >
              Sign out
            </Button>
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

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <Key className="h-3.5 w-3.5" />
          API Keys
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Your API Keys</h1>
        <p className="mt-2 text-muted-foreground">
          Create keys to integrate Fubrio announcements or Wisee AI 1.0 into your projects. See the{" "}
          <button onClick={() => navigate("#docs")} className="text-foreground underline-offset-2 hover:underline inline-flex items-center gap-1">
            docs <ExternalLink className="h-3 w-3" />
          </button>{" "}
          for wiring instructions.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
              <Clock className="h-4 w-4 text-[var(--fubrio-accent)]" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {dailyRemaining} of {dailyLimit} keys remaining today
              </div>
              <div className="text-xs text-muted-foreground">
                Daily limit resets at UTC midnight. Limits apply to prevent abuse.
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setForm({ type: "announcements", name: "", webhookUrl: "", expiresAt: "" });
              setShowForm(true);
            }}
            disabled={dailyRemaining === 0}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New API key
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : keys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="font-display text-lg font-semibold">No API keys yet</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Create your first API key to start integrating Fubrio into your projects.
              </div>
            </div>
          ) : (
            keys.map((k) => {
              const typeMeta = API_TYPES.find((t) => t.id === k.type);
              return (
                <div key={k.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30 flex-shrink-0">
                      {typeMeta ? <typeMeta.icon className="h-4 w-4 text-[var(--fubrio-accent)]" /> : <Key className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{k.name}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">{k.type}</Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            k.status === "ACTIVE"
                              ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30"
                              : "bg-destructive/15 text-destructive border-destructive/30",
                          )}
                        >
                          {k.status === "ACTIVE" ? "Active" : "Revoked"}
                        </Badge>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded inline-block">
                        {k.keyPrefix}…{k.keySuffix}
                      </div>
                      {k.webhookUrl && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Webhook:{" "}
                            <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">{k.webhookUrl}</code>
                          </span>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>Created: {formatDate(k.createdAt)}</span>
                        <span>Last used: {formatDate(k.lastUsedAt)}</span>
                        {k.expiresAt && <span>Expires: {formatDate(k.expiresAt)}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => setDeleteId(k.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Signed in as <strong>{(session.user as { email?: string }).email}</strong> (Google)
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full">
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create new API key</DialogTitle>
            <DialogDescription>
              Pick the API type and name your key. You'll see the full key ONCE after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">API type *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {API_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.id })}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      form.type === t.id
                        ? "border-[var(--fubrio-accent)] bg-[var(--fubrio-accent-soft)]"
                        : "border-border hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <t.icon className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-snug">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="My awesome project"
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">Helps you remember where this key is used.</div>
            </div>
            {form.type === "announcements" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Webhook URL *</Label>
                <Input
                  value={form.webhookUrl}
                  onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                  placeholder="https://your-app.com/api/fubrio-webhook"
                  className="bg-background"
                />
                <div className="text-[10px] text-muted-foreground">
                  Fubrio will POST announcement events to this URL whenever a new announcement is published.
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Expiry (optional)</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="bg-background"
              />
              <div className="text-[10px] text-muted-foreground">Leave blank for no expiry - the key works until you revoke it.</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={create}
              disabled={saving || !form.name.trim() || (form.type === "announcements" && !form.webhookUrl.trim())}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!createdKey} onOpenChange={(o) => !o && setCreatedKey(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy this key now. For security, you won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          {createdKey && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border border-border bg-secondary p-3">
                <div className="flex items-center gap-2">
                  <code className={cn("font-mono text-xs flex-1 break-all", !showPlaintext && "blur-sm select-none")}>
                    {createdKey.key}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full flex-shrink-0"
                    onClick={() => setShowPlaintext((s) => !s)}
                  >
                    {showPlaintext ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full flex-shrink-0"
                    onClick={copyKey}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <strong>Important:</strong> This is the only time you&apos;ll see this key. Store it securely.
                If you lose it, you&apos;ll need to revoke and create a new one.
              </div>
              <div className="text-[11px] text-muted-foreground">
                See the{" "}
                <button onClick={() => navigate("#docs")} className="text-foreground hover:underline">
                  docs
                </button>{" "}
                for wiring instructions.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)} className="bg-foreground text-background hover:bg-foreground/90">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke this API key?</DialogTitle>
            <DialogDescription>
              This permanently deletes the key. Any code using it will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Revoke key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
