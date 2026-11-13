"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { Meta } from "@/components/site/editorial";
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
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-[2.1rem] leading-none tracking-[-0.03em]">{brand.name}</span>
              <span className="mb-1.5 h-[7px] w-[7px] bg-[var(--fubrio-accent)]" aria-hidden />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {brand.footerDescription}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
              <a
                href={brand.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Discord
              </a>
              <a
                href={brand.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:${brand.contactEmail}`}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Email
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.id}>
                  <div className="eyebrow border-b border-border pb-1.5">{col.title}</div>
                  <ul className="mt-2 space-y-1.5">
                    {col.links.map((link, i) => (
                      <li key={i}>
                        <button
                          onClick={() => navigate(link.href)}
                          className="text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
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

          <div className="lg:col-span-3">
            <div className="eyebrow border-b border-border pb-1.5">The monthly letter</div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              One email a month with what shipped and what broke.
            </p>
            <form onSubmit={subscribe} className="mt-3">
              <div className="flex items-end gap-2 border-b border-border pb-1 focus-within:border-foreground">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-label="Email address"
                  disabled={done}
                  className="h-8 rounded-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <button
                  type="submit"
                  disabled={submitting || done}
                  aria-label="Subscribe"
                  className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center bg-foreground text-background disabled:opacity-60"
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-5 sm:flex-row sm:items-center">
          <Meta>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {brand.name}
            {brand.isBloom ? " — a Fubrio product." : " — built by hand in India."}
          </Meta>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("#privacy")}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate("#terms")}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </button>
            <button
              onClick={() => navigate("#cookies")}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cookies
            </button>
            <button
              onClick={() => navigate("#advertise")}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Advertise
            </button>
            <button
              onClick={() => navigate("#admin")}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
