"use client";

import { Heart, Users, ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";

interface Donator {
  id: string;
  name: string;
  amount: number;
  currency: string;
  message: string | null;
  date: string | null;
}

function formatAmount(amount: number, currency: string): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
}

export function DonatorsSection({ donators }: { donators: Donator[] }) {
  if (!donators || donators.length === 0) return null;

  const totalRaised = donators.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <section className="py-24 sm:py-32" id="donators">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center justify-center gap-2">
            <Heart className="h-3.5 w-3.5" />
            Our Donators
          </div>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            Supported by our community.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            These are the people who believed in Fubrio and supported our mission. Every contribution matters.
          </p>
          {totalRaised > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2.5">
              <Heart className="h-4 w-4 text-[var(--fubrio-accent)]" />
              <span className="font-display text-lg font-semibold">${totalRaised.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">raised</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {donators.map((d, i) => (
            <div
              key={d.id}
              className={`group relative rounded-2xl glass-card p-5 transition-all hover:-translate-y-0.5 ${
                i < 3 ? "border-[var(--fubrio-accent)]/30" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    i < 3
                      ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)]"
                      : "glass-card"
                  }`}>
                    {i < 3 ? (
                      <Heart className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{d.name}</div>
                    {d.date && (
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-display text-lg font-semibold text-[var(--fubrio-accent)]">
                  {formatAmount(d.amount, d.currency)}
                </div>
              </div>
              {d.message && (
                <div className="mt-3 p-3 rounded-lg glass-input text-xs text-muted-foreground italic">
                  "{d.message}"
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("#contact")}
            className="inline-flex items-center gap-1.5 rounded-full glass-card px-5 py-2.5 text-sm font-medium hover:border-[var(--fubrio-accent)]/40 transition-all group"
          >
            <Heart className="h-4 w-4 text-[var(--fubrio-accent)]" />
            Support Fubrio
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
