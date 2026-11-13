"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/editorial";
import type { SerializedSponsor } from "@/lib/types";

const TIER_ORDER = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];
const TIER_LABEL: Record<string, string> = {
  PLATINUM: "Platinum",
  GOLD: "Gold",
  SILVER: "Silver",
  BRONZE: "Bronze",
};

export function SponsorsMarquee({ sponsors }: { sponsors: SerializedSponsor[] }) {
  if (sponsors.length === 0) return null;

  const sorted = [...sponsors].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
  );

  return (
    <section className="border-t border-border py-14" id="sponsors">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <div className="eyebrow">Sponsors</div>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
              Brands that put something behind the work. Their support pays for servers, tools and
              late-night coffee.
            </p>
          </div>

          <div className="lg:col-span-9">
            <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3">
              {sorted.slice(0, 9).map((s) => (
                <a
                  key={s.id}
                  href={s.website ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex min-h-[6.5rem] flex-col justify-between border-b border-r border-border p-4",
                    "transition-colors hover:bg-foreground/[0.03]",
                  )}
                >
                  <span className="font-display text-[1.15rem] leading-tight">{s.name}</span>
                  <span className="mt-3 flex items-end justify-between gap-2">
                    <Meta className="truncate">{s.industry ?? TIER_LABEL[s.tier] ?? s.tier}</Meta>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
