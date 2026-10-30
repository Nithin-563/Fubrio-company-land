"use client";

import { ArrowUpRight, ArrowRight, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { navigate } from "@/lib/router";
import type { SerializedProject } from "@/lib/types";

export function FeaturedShowcase({ projects }: { projects: SerializedProject[] }) {
  if (projects.length === 0) return null;

  const hero = projects[0];
  const side = projects.slice(1, 5);

  return (
    <section className="py-24 sm:py-32" id="showcase">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">
              Showcase
            </div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Selected work, built with intent.
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              A curated selection of products, apps, AI tools, and creative experiments shipped by Fubrio.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("#showcase")} className="hidden sm:inline-flex rounded-full group">
            View all
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <button
            onClick={() => navigate(`#showcase/${hero.slug}`)}
            className="group lg:col-span-7 relative rounded-3xl overflow-hidden border border-border glass-card text-left"
          >
            <div className="aspect-[16/11] relative overflow-hidden">
              {usableImage(hero.coverImage) ? (
                 
                <img src={hero.coverImage} alt={hero.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <GradientPlaceholder seed={hero.title} label={hero.category?.name} className="absolute inset-0" size="xl" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-5 left-5 flex items-center gap-2">
                {hero.featured && (
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20">
                    Featured
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20">
                  {hero.status}
                </Badge>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
                {hero.category && (
                  <div className="text-xs uppercase tracking-wider text-white/70 mb-2">{hero.category.name}</div>
                )}
                <h3 className="text-2xl sm:text-3xl font-display font-semibold text-white">{hero.title}</h3>
                <p className="text-sm text-white/80 mt-2 max-w-xl line-clamp-2">{hero.shortDesc}</p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {hero.technologies.slice(0, 5).map((t) => (
                    <span key={t} className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {side.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`#showcase/${p.slug}`)}
                className="group relative rounded-2xl overflow-hidden border border-border glass-card text-left"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  {usableImage(p.coverImage) ? (
                     
                    <img src={p.coverImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <GradientPlaceholder seed={p.title} label={p.category?.name} className="absolute inset-0" size="md" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    {p.featured && (
                      <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20">
                        <Boxes className="h-3 w-3 mr-1" />Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-4">
                  {p.category && (
                    <div className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{p.category.name}</div>
                  )}
                  <h3 className="text-base font-semibold text-white line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{p.shortDesc}</p>
                </div>
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 sm:hidden">
          <Button variant="outline" onClick={() => navigate("#showcase")} className="w-full rounded-full group">
            View all projects
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
