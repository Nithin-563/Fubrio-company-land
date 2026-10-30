"use client";

import { ArrowUpRight, Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/router";
import type { SerializedPartner } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  TECHNOLOGY: "Technology",
  COMMUNITY: "Community",
  DEVELOPMENT: "Development",
  MEDIA: "Media",
  BRAND: "Brand",
  STRATEGIC: "Strategic",
};

export function PartnersGrid({ partners }: { partners: SerializedPartner[] }) {
  if (partners.length === 0) return null;
  return (
    <section className="py-24 sm:py-32 border-t border-border/60" id="partners">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
              <Handshake className="h-3.5 w-3.5" />
              Partners
            </div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Stronger together.
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl">
              We collaborate with technology, community, development, media, brand, and strategic partners.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Button variant="outline" onClick={() => navigate("#contact")} className="rounded-full">
              Become a partner
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((p) => (
            <a
              key={p.id}
              href={p.website ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl glass-card p-6 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted font-display text-lg font-semibold">
                  {p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </div>
                {p.featured && (
                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{TYPE_LABEL[p.type] ?? p.type}</Badge>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
