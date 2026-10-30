"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2, Lock, ShieldCheck, ArrowLeft, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { navigate } from "@/lib/router";

export function AdminLogin() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 text-center glass">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
            <ShieldCheck className="h-7 w-7 text-[var(--fubrio-accent)]" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Signed in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{session.user?.name ?? session.user?.email}</span>.
            <br />
            Role: <span className="font-mono">{(session.user as { role?: string }).role}</span>
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => navigate("#admin/dashboard")} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
              Open dashboard
            </Button>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded-full">
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) {
        setError("Invalid credentials.");
      }
    } catch {
      setError("Network error - try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 fubrio-aurora">
      <div className="absolute inset-0 fubrio-grid-bg opacity-30" aria-hidden />
      <div className="relative w-full max-w-md">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </button>

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-xl glass">
          <div className="flex items-center gap-2 mb-6">
            <Logo />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
              <Lock className="h-4 w-4 text-[var(--fubrio-accent)]" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">Admin sign in</h1>
              <p className="text-xs text-muted-foreground">Access the Fubrio dashboard</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
                placeholder="you@fubrio.in"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
