"use client";

import { ArrowUpRight, ArrowRight } from "lucide-react";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { navigate } from "@/lib/router";
import { ChapterHead, Meta } from "@/components/site/editorial";
import type { SerializedProject } from "@/lib/types";

export function FeaturedShowcase({ projects }: { projects: SerializedProject[] }) {
  if (projects.length === 0) return null;

  const [lead, ...rest] = projects;
  const index = rest.slice(0, 4);

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

        <div className="mt-8 grid gap-8 border-b border-border pb-10 lg:grid-cols-12 lg:gap-12">
          <button
            onClick={() => navigate(`#showcase/${lead.slug}`)}
            className="group text-left focus-premium lg:col-span-8"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-border bg-muted">
              {usableImage(lead.coverImage) ? (
                <img
                  src={lead.coverImage as string}
                  alt={lead.title}
                  width={1200}
                  height={750}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <GradientPlaceholder
                  seed={lead.title}
                  label={lead.category?.name}
                  className="absolute inset-0"
                  size="xl"
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Meta>{lead.category?.name ?? "Project"}</Meta>
              <Meta className="group-hover:text-foreground">Open case study ↗</Meta>
            </div>
          </button>

          <div className="flex flex-col justify-between lg:col-span-4">
            <div>
              <h3 className="font-display text-[2rem] leading-[1.05]">{lead.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {lead.shortDesc}
              </p>

              {lead.technologies.length > 0 && (
                <div className="mt-6">
                  <div className="eyebrow mb-2">Built with</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {lead.technologies.slice(0, 6).map((t) => (
                      <Meta key={t}>{t}</Meta>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(`#showcase/${lead.slug}`)}
              className="link-arrow mt-8 self-start text-foreground"
            >
              Read the case study <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {index.length > 0 && (
          <ul className="ruled-list mt-0">
            {index.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`#showcase/${p.slug}`)}
                  className="group grid w-full grid-cols-[2rem_1fr] items-center gap-3 py-4 text-left sm:grid-cols-[2.5rem_6rem_1fr_auto] sm:gap-5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(i + 2).padStart(3, "0")}
                  </span>

                  <span className="hidden h-12 w-24 overflow-hidden border border-border bg-muted sm:block">
                    {usableImage(p.coverImage) ? (
                      <img
                        src={p.coverImage as string}
                        alt=""
                        width={200}
                        height={100}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <GradientPlaceholder seed={p.title} className="h-full w-full" size="sm" />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-[1.25rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
                        {p.title}
                      </span>
                      <Meta>{p.category?.name ?? p.status}</Meta>
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">
                      {p.shortDesc}
                    </span>
                  </span>

                  <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 sm:hidden">
          <button onClick={() => navigate("#showcase")} className="btn-line w-full">
            All projects <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
