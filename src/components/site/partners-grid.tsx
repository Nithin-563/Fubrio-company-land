"use client";

import { ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { ChapterHead, Meta } from "@/components/site/editorial";
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
    <section className="py-16 sm:py-20" id="partners">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="05"
          label="Partners"
          title="People we build with."
          description="Studios, communities and platforms we work alongside. Most of these started as a conversation in a Discord server."
          action={
            <button onClick={() => navigate("#contact")} className="link-arrow text-foreground">
              Become a partner <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        <div className="mt-8 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <a
              key={p.id}
              href={p.website ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[9.5rem] flex-col justify-between border-b border-r border-border p-5 transition-colors hover:bg-foreground/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.35rem] leading-tight">{p.name}</h3>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-border font-mono text-[10px] uppercase text-muted-foreground">
                  {p.name.slice(0, 2)}
                </span>
              </div>

              <div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <Meta>
                    {TYPE_LABEL[p.type] ?? p.type}
                    {p.featured ? " · Featured" : ""}
                  </Meta>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
