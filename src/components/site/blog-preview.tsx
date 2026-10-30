"use client";

import { ArrowUpRight, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import { SafeDate } from "@/components/shared/safe-date";
import type { SerializedPost } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";

export function BlogPreview({ posts }: { posts: SerializedPost[] }) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;
  return (
    <section className="py-24 sm:py-32 border-t border-border/60" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">
              Blog & Updates
            </div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Notes from the build.
            </h2>
          </div>
          <Button variant="outline" onClick={() => navigate("#blog")} className="hidden sm:inline-flex rounded-full group">
            All articles
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <button
            onClick={() => navigate(`#blog/${featured.slug}`)}
            className="group lg:col-span-7 relative rounded-3xl overflow-hidden border border-border bg-card text-left"
          >
            <div className="aspect-[16/10] relative overflow-hidden">
              {featured.coverImage ? (
                 
                <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
                {featured.featured && (
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20 mb-3">
                    Featured
                  </Badge>
                )}
                <h3 className="text-2xl sm:text-3xl font-display font-semibold text-white">{featured.title}</h3>
                <p className="text-sm text-white/80 mt-2 max-w-xl line-clamp-2">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-white/70">
                  {featured.author?.name && <span>{featured.author.name}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {featured.readTime} min read
                  </span>
                  {featured.publishedAt && (
                    <span suppressHydrationWarning><SafeDate date={featured.publishedAt} options={{ month: "short", day: "numeric", year: "numeric" }} /></span>
                  )}
                </div>
              </div>
            </div>
          </button>

          <div className="lg:col-span-5 flex flex-col gap-4">
            {rest.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`#blog/${p.slug}`)}
                className="group flex items-center gap-4 rounded-2xl glass-card p-4 transition-all text-left"
              >
                <div className="h-20 w-24 rounded-lg overflow-hidden flex-shrink-0">
                  {p.coverImage ? (
                     
                    <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">
                    {p.publishedAt && <span suppressHydrationWarning><SafeDate date={p.publishedAt} options={{ month: "short", day: "numeric" }} /></span>}
                  </div>
                  <h3 className="font-display font-semibold text-sm mt-0.5 line-clamp-2 group-hover:text-[var(--fubrio-accent)] transition-colors">
                    {p.title}
                  </h3>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {p.readTime} min read
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
