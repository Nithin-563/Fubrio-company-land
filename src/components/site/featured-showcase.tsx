"use client";

import { ArrowUpRight, ArrowRight } from "lucide-react";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { navigate } from "@/lib/router";
import { ChapterHead, Meta } from "@/components/site/editorial";
import type { SerializedProject } from "@/lib/types";

export function FeaturedShowcase({ projects }: { projects: SerializedProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="py-16 sm:py-20" id="showcase">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="01"
          label="Selected work"
          title="Things we finished, and still like."
          description="Projects, products and experiments from the studio — with the tech that holds them up."
          action={
            <button onClick={() => navigate("#showcase")} className="link-arrow text-foreground">
              Browse the archive <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        <ul className="ruled-list mt-8 border-t border-border">
          {projects.map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => navigate(`#showcase/${p.slug}`)}
                className="group grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 py-5 text-left sm:grid-cols-[3rem_5.5rem_1fr_auto] sm:gap-6"
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(3, "0")}
                </span>

                <span className="hidden h-14 w-20 overflow-hidden border border-border bg-muted sm:block">
                  {usableImage(p.coverImage) ? (
                    <img
                      src={p.coverImage as string}
                      alt=""
                      width={160}
                      height={112}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <GradientPlaceholder seed={p.title} className="h-full w-full" size="sm" />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-[1.35rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
                      {p.title}
                    </span>
                    <Meta>{p.category?.name ?? p.status}</Meta>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[13.5px] leading-relaxed text-muted-foreground">
                    {p.shortDesc}
                  </span>
                </span>

                <span className="flex items-center gap-3 self-center">
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:inline">
                    {p.technologies.slice(0, 2).join(" · ")}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 sm:hidden">
          <button onClick={() => navigate("#showcase")} className="btn-line w-full">
            All projects <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
