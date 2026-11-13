"use client";

import { ArrowUpRight, ArrowRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { Meta } from "@/components/site/editorial";
import type { SerializedProject, SerializedMetric } from "@/lib/types";

export function Hero({
  projects,
  metrics,
}: {
  projects: SerializedProject[];
  metrics: SerializedMetric[];
}) {
  const featured = projects.find((p) => p.featured) ?? projects[0];

  return (
    <section className="relative border-b border-border" id="home">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-10 lg:grid-cols-12 lg:gap-14 lg:py-14">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex items-center gap-3">
                <span className="eyebrow">Independent digital studio</span>
                <span className="h-px flex-1 bg-border" aria-hidden />
                <span className="eyebrow">India</span>
              </div>

              <h1 className="display-heading mt-7 text-[2.75rem] leading-[0.96] sm:text-[3.75rem] lg:text-[4.35rem]">
                Software, products,
                <br />
                and the occasional{" "}
                <span className="italic text-[var(--fubrio-accent)]">strange</span> experiment.
              </h1>

              <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-muted-foreground">
                Fubrio is a small studio building websites, apps, games, Discord bots and AI tools — then
                sticking around to look after them. If it can be made on a screen, we have probably tried it.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => navigate("#showcase")} className="btn-ink group">
                  See what we have built
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button onClick={() => navigate("#contact")} className="btn-line">
                  Start a project
                </button>
              </div>
            </div>

            {metrics.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-5 sm:grid-cols-4">
                {metrics.slice(0, 4).map((m) => (
                  <div key={m.id}>
                    <dt className="eyebrow truncate">{m.label}</dt>
                    <dd className="mt-1 font-display text-[1.85rem] leading-none">
                      {m.value}
                      {m.unit ? (
                        <span className="ml-0.5 text-sm text-muted-foreground">{m.unit}</span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {featured ? (
            <div className="lg:col-span-5">
              <div className="flex items-baseline justify-between border-b border-border pb-2">
                <Meta>Plate 001 — Selected work</Meta>
                <Meta>{featured.status}</Meta>
              </div>

              <button
                onClick={() => navigate(`#showcase/${featured.slug}`)}
                className="group mt-3 block w-full text-left focus-premium"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-muted">
                  {usableImage(featured.coverImage) ? (
                    <img
                      src={featured.coverImage as string}
                      alt={featured.title}
                      width={800}
                      height={600}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <GradientPlaceholder
                      seed={featured.title}
                      label={featured.category?.name}
                      className="absolute inset-0"
                      size="xl"
                    />
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.6rem] leading-tight">{featured.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {featured.shortDesc}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </button>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3">
                {featured.category && <Meta>{featured.category.name}</Meta>}
                {featured.technologies.slice(0, 4).map((t) => (
                  <Meta key={t} className="text-muted-foreground/70">
                    {t}
                  </Meta>
                ))}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5">
              <div className="flex h-full min-h-[16rem] flex-col justify-between border border-border p-6">
                <Meta>Studio notebook</Meta>
                <p className="font-display text-2xl leading-snug">
                  New work is being photographed and written up. Check back shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
