"use client";

import { useEffect, useState } from "react";
import { navigate } from "@/lib/router";
import { ArrowLeft, KeyRound, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export function CzerPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"master" | "employee">("master");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "employee" && !email) {
      toast.error("Enter your email address");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("The access code is six digits");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: mode === "master" ? "czer@fubrio.in" : email.toLowerCase().trim(),
        password: `czer-${code}`,
        redirect: false,
      });
      if (!res || res.error) {
        toast.error(mode === "master" ? "That code was rejected" : "Email and code do not match");
        return;
      }
      toast.success(mode === "master" ? "Super admin access granted" : "Signed in");
      setTimeout(() => navigate("#admin/dashboard"), 400);
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center border-t border-border px-4 py-16">
      <div className="mx-auto w-full max-w-sm">
        <button onClick={onClose} className="link-arrow mb-10 text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </button>

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[var(--fubrio-accent)]" aria-hidden />
          <span className="eyebrow">Restricted</span>
        </div>

        <h1 className="display-heading mt-3 text-[2.25rem] leading-none">Czer access</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Two ways in: the master code for full control, or the six-digit code your admin issued
          to your email.
        </p>

        <div className="mt-8 grid grid-cols-2 border border-border">
          <button
            type="button"
            onClick={() => setMode("master")}
            className={`py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              mode === "master"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Master
          </button>
          <button
            type="button"
            onClick={() => setMode("employee")}
            className={`border-l border-border py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              mode === "employee"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Employee
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "employee" && (
            <div className="space-y-1.5">
              <Label htmlFor="czer-email" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Email
              </Label>
              <Input
                id="czer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@fubrio.in"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="czer-code" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {mode === "master" ? "Master code" : "Your code"}
            </Label>
            <Input
              id="czer-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              className="font-mono tracking-[0.4em]"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Verify
          </Button>
        </form>

        <div className="mt-8 flex items-start gap-2 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {mode === "master"
              ? "The master code grants full super admin access. Treat it like a root password."
              : "Employee codes are limited to the sections your admin granted. Ask them for a reset if yours expired."}
          </span>
        </div>
      </div>
    </div>
  );
}
