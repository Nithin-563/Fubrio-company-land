"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check, MessageCircle, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import type { SerializedFooterColumn } from "@/lib/types";
import type { BrandConfig } from "@/lib/brand";
import { FUBRIO_CONFIG } from "@/lib/brand";

export function Footer({ columns, brand = FUBRIO_CONFIG }: { columns: SerializedFooterColumn[]; brand?: BrandConfig }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
        toast.success("Subscribed!");
        setEmail("");
      } else {
        toast.error(json.error ?? "Subscription failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative mt-auto border-t border-border bg-background">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--fubrio-accent)]/40 to-transparent" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <Logo size="lg" text={brand.name} showImage={!brand.isBloom} subtitle={brand.isBloom ? "by Fubrio" : undefined} />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {brand.footerDescription}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={brand.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium hover:border-[var(--fubrio-accent)]/40 transition-all hover:-translate-y-0.5"
              >
                <MessageCircle className="h-4 w-4 text-[#5865F2] group-hover:scale-110 transition-transform" />
                <span>Discord</span>
              </a>
              <a
                href={brand.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium hover:border-[var(--fubrio-accent)]/40 transition-all hover:-translate-y-0.5"
              >
                <Linkedin className="h-4 w-4 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                <span>LinkedIn</span>
              </a>
            </div>

            <form onSubmit={subscribe} className="mt-8 max-w-sm">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Subscribe to the newsletter
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-background flex-1"
                />
                <Button type="submit" disabled={submitting || done} size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  {done ? <Check className="h-4 w-4" /> : submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {columns.map((col) => (
              <div key={col.id}>
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{col.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <button
                        onClick={() => navigate(link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {brand.name}.{brand.isBloom ? " A Fubrio product." : ""}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("#privacy")} className="hover:text-foreground transition-colors">Privacy</button>
            <button onClick={() => navigate("#terms")} className="hover:text-foreground transition-colors">Terms</button>
            <button onClick={() => navigate("#admin")} className="hover:text-foreground transition-colors">Admin</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-[var(--fubrio-accent)] hover:bg-[var(--fubrio-accent-soft)] transition-colors"
    >
      {icon}
    </a>
  );
}
