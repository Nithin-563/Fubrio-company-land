"use client";

import { ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { SafeDate } from "@/components/shared/safe-date";
import { ChapterHead, Meta } from "@/components/site/editorial";
import type { SerializedPost } from "@/lib/types";

export function BlogPreview({ posts }: { posts: SerializedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20" id="blog">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="07"
          label="Journal"
          title="Notes from the build."
          description="What broke, what we changed, and the occasional long explanation of a short decision."
          action={
            <button onClick={() => navigate("#blog")} className="link-arrow text-foreground">
              All entries <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        <ul className="ruled-list mt-8 border-t border-border">
          {posts.slice(0, 5).map((p) => (
            <li key={p.id}>
              <button
                onClick={() => navigate(`#blog/${p.slug}`)}
                className="group grid w-full grid-cols-1 gap-1 py-4 text-left sm:grid-cols-12 sm:items-baseline sm:gap-6"
              >
                <span className="sm:col-span-2">
                  <Meta>
                    {p.publishedAt ? (
                      <span suppressHydrationWarning>
                        <SafeDate date={p.publishedAt} options={{ day: "2-digit", month: "short", year: "numeric" }} />
                      </span>
                    ) : (
                      "Draft"
                    )}
                  </Meta>
                </span>

                <span className="sm:col-span-8">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-[1.45rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
                      {p.title}
                    </span>
                    {p.featured && <Meta>Featured</Meta>}
                  </span>
                  <span className="mt-1 line-clamp-2 block max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </span>
                </span>

                <span className="mt-1 flex items-center justify-between gap-3 sm:col-span-2 sm:mt-0 sm:justify-end">
                  <Meta>{p.readTime} min</Meta>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
