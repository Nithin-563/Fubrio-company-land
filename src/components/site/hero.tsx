"use client";

import { ArrowUpRight, ArrowRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { Meta } from "@/components/site/editorial";
import type { SerializedProject, SerializedMetric } from "@/lib/types";

export function Hero({
  projects,
  metrics,
}: {
  projects: SerializedProject[];
  metrics: SerializedMetric[];
}) {
  const listed = projects.slice(0, 3);

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

          <div className="lg:col-span-5">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <Meta>Selected work</Meta>
              <Meta>{projects.length > 0 ? `${String(projects.length).padStart(2, "0")} live` : "Studio"}</Meta>
            </div>

            {listed.length > 0 ? (
              <ul className="ruled-list">
                {listed.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onClick={() => navigate(`#showcase/${p.slug}`)}
                      className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-3 py-4 text-left"
                    >
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {String(i + 1).padStart(3, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-display text-[1.4rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
                            {p.title}
                          </span>
                          <Meta>{p.status}</Meta>
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[13px] text-muted-foreground">
                          {p.shortDesc}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 border border-border p-6">
                <Meta>Studio notebook</Meta>
                <p className="mt-3 font-display text-xl leading-snug">
                  New work is being photographed and written up. Check back shortly.
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <Meta>Since 2024</Meta>
              <button onClick={() => navigate("#showcase")} className="link-arrow text-muted-foreground">
                All work <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
