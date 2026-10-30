"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SerializedSponsor, SerializedPartner } from "@/lib/types";

const TIER_ORDER = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const TIER_COLORS: Record<string, string> = {
  PLATINUM: "from-zinc-200 to-zinc-400 text-zinc-900",
  GOLD: "from-amber-200 to-amber-500 text-amber-950",
  SILVER: "from-slate-200 to-slate-400 text-slate-900",
  BRONZE: "from-orange-200 to-orange-600 text-orange-950",
};

function SponsorLogo({ s }: { s: SerializedSponsor }) {
  return (
    <a
      href={s.website ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center rounded-2xl glass-card p-6 transition-all hover:-translate-y-0.5"
    >
      <div className="font-display text-xl font-semibold text-center">{s.name}</div>
      <div className="mt-1 text-xs text-muted-foreground text-center">{s.industry}</div>
      <div
        className={cn(
          "mt-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r",
          TIER_COLORS[s.tier] ?? TIER_COLORS.BRONZE,
        )}
      >
        {s.tier}
      </div>
    </a>
  );
}

export function SponsorsMarquee({ sponsors }: { sponsors: SerializedSponsor[] }) {
  if (sponsors.length === 0) return null;

  const sorted = [...sponsors].sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  const marquee = [...sorted, ...sorted, ...sorted];

  return (
    <section className="py-24 sm:py-32" id="sponsors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Sponsors
          </div>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            Backed by forward-thinking brands.
          </h2>
          <p className="mt-4 text-muted-foreground">
          </p>
        </div>

        <div className="mt-12 marquee-pause relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex gap-4 animate-marquee w-max">
            {marquee.map((s, i) => (
              <div key={s.id + i} className="flex-shrink-0 w-64">
                <SponsorLogo s={s} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.slice(0, 6).map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-2xl glass-card p-5">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold uppercase", TIER_COLORS[s.tier] ?? TIER_COLORS.BRONZE)}>
                {s.tier.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.industry}</div>
              </div>
              <Badge variant="outline" className="text-xs">{s.tier}</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
