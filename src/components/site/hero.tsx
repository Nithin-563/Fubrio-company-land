"use client";

import { ArrowRight, ArrowUpRight, Sparkles, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
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
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28 fubrio-aurora" id="home">
      <div className="absolute inset-0 fubrio-grid-bg opacity-30" aria-hidden />
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--fubrio-accent)]/40 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground animate-fade-in-up">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--fubrio-accent)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--fubrio-accent)]" />
              </span>
              Fubrio · Digital Ecosystem
            </div>

            <h1 className="display-heading mt-6 text-5xl sm:text-6xl lg:text-7xl text-foreground animate-fade-in-up" style={{ animationDelay: "60ms" }}>
              Building the digital
              <br />
              experiences of{" "}
              <span className="relative inline-block">
                <span className="relative z-10">tomorrow</span>
                <span className="absolute inset-x-0 bottom-1 h-3 sm:h-4 bg-[var(--fubrio-accent)]/30 -z-0" aria-hidden />
              </span>
              .
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              Fubrio is a digital technology and creative ecosystem. We design, build, and ship products, software,
              games, AI tools, and creative experiments - all from one premium platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
              <Button
                size="lg"
                onClick={() => navigate("#showcase")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 group"
              >
                Explore Fubrio
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("#contact")}
                className="rounded-full"
              >
                Contact Us
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate("#partners")}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                Become a partner
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

            {metrics.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
                {metrics.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex flex-col">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</dt>
                    <dd className="mt-1 text-2xl sm:text-3xl font-display font-semibold text-foreground">
                      {m.value}
                      {m.unit && <span className="text-base text-muted-foreground ml-0.5">{m.unit}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {featured && (
            <div className="lg:col-span-5 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[var(--fubrio-accent)]/40 to-transparent rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity" aria-hidden />
                <button
                  onClick={() => navigate(`#showcase/${featured.slug}`)}
                  className="relative block w-full text-left rounded-2xl overflow-hidden border border-border glass-card shadow-xl"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {usableImage(featured.coverImage) ? (
                       
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <GradientPlaceholder seed={featured.title} label={featured.category?.name} className="absolute inset-0" size="xl" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <Badge variant="secondary" className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white border-white/20">
                      <Sparkles className="h-3 w-3 mr-1 text-[var(--fubrio-accent)]" />
                      Featured Project
                    </Badge>
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      <div className="flex items-center gap-2 text-xs text-white/70 mb-2">
                        {featured.category && (
                          <span className="rounded-full border border-white/20 px-2 py-0.5 backdrop-blur">
                            {featured.category.name}
                          </span>
                        )}
                        <span className="rounded-full border border-white/20 px-2 py-0.5 backdrop-blur">
                          {featured.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-semibold text-white">{featured.title}</h3>
                      <p className="text-sm text-white/80 mt-1 line-clamp-2">{featured.shortDesc}</p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white">
                        View project
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </button>

                <div className="mt-4 flex items-center gap-3 px-1">
                  <div className="flex -space-x-2">
                    {featured.contributors.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-muted to-secondary flex items-center justify-center text-[10px] font-medium"
                        title={c.name}
                      >
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {featured.contributors.length} contributor{featured.contributors.length !== 1 ? "s" : ""}
                  </span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Boxes className="h-3.5 w-3.5" />
                    {featured.technologies.length} tech
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
