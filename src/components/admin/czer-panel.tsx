"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Lock, ShieldCheck, ArrowLeft, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { navigate } from "@/lib/router";
import { toast } from "sonner";

export function CzerPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"master" | "employee">("master");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "master") {
      if (!code) return;
      setLoading(true);
      try {
        const res = await signIn("credentials", {
          email: "czer@fubrio.in",
          password: `czer-${code}`,
          redirect: false,
        });
        if (!res || res.error) {
          toast.error(`Authentication failed: ${res?.error || "Unknown error"}`);
          return;
        }
        toast.success("Super Admin access granted");
        setTimeout(() => navigate("#admin/dashboard"), 500);
      } catch (err) {
        toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !code) {
        toast.error("Both email and Czer code are required");
        return;
      }
      if (!/^\d{6}$/.test(code)) {
        toast.error("Czer code must be exactly 6 digits");
        return;
      }
      setLoading(true);
      try {
        const res = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password: `czer-${code}`,
          redirect: false,
        });
        if (!res || res.error) {
          toast.error(`Authentication failed: ${res?.error || "Invalid email or code"}`);
          return;
        }
        toast.success("Signed in");
        setTimeout(() => navigate("#admin/dashboard"), 500);
      } catch (err) {
        toast.error(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 fubrio-aurora">
      <div className="absolute inset-0 fubrio-grid-bg opacity-30" aria-hidden />
      <div className="relative w-full max-w-md">
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-xl glass">
          <div className="flex items-center gap-2 mb-6">
            <Logo />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
              <KeyRound className="h-4 w-4 text-[var(--fubrio-accent)]" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">Czer Access</h1>
              <p className="text-xs text-muted-foreground">Restricted area</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1.5 p-1 rounded-full glass-input">
            <button
              type="button"
              onClick={() => setMode("master")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                mode === "master"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setMode("employee")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                mode === "employee"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Employee
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "employee" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Your email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="bg-background/50"
                  placeholder="you@gmail.com"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {mode === "master" ? "Master access code" : "Your Czer code"}
              </Label>
              <Input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                autoFocus={mode === "master"}
                inputMode="numeric"
                pattern="\d{6}"
                className="bg-background/50 tracking-[0.3em] glass-input"
                placeholder="••••••"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Verify
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              {mode === "master"
                ? "Entering the correct master code grants full Super Admin access."
                : "Use the 6-digit code your admin assigned to you. Your access is limited to what they granted."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
