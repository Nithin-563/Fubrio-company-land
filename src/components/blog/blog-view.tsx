"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/editorial";
import type { SerializedPost } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { SafeDate } from "@/components/shared/safe-date";

const FIELD =
  "h-9 w-full rounded-none border-0 border-b border-border bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:bg-transparent";

export function BlogView({ posts }: { posts: SerializedPost[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q));
  }, [posts, search]);

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#home")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </button>

        <div className="chapter-head">
          <div className="chapter-num">07</div>
          <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Journal</div>
              <h1 className="display-heading mt-2 text-[2.4rem] leading-[1.02] sm:text-[3.2rem]">
                Notes from the build
              </h1>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
                Post-mortems, decisions and the occasional rant about caching. {filtered.length} entr
                {filtered.length === 1 ? "y" : "ies"}.
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries"
                aria-label="Search entries"
                className={cn(FIELD, "pl-6")}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24">
            <div className="font-display text-[1.8rem]">No entries match that.</div>
            <p className="mt-2 text-sm text-muted-foreground">Try a shorter word.</p>
          </div>
        ) : (
          <div className="mt-8">
            {featured && (
              <button
                onClick={() => navigate(`#blog/${featured.slug}`)}
                className="group grid w-full gap-6 border-b border-border pb-8 text-left lg:grid-cols-12 lg:gap-10"
              >
                <div className="relative aspect-[16/10] overflow-hidden border border-border bg-muted lg:col-span-7">
                  {usableImage(featured.coverImage) ? (
                    <img
                      src={featured.coverImage as string}
                      alt={featured.title}
                      width={1200}
                      height={750}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <GradientPlaceholder seed={featured.title} label="Journal" className="absolute inset-0" size="lg" />
                  )}
                </div>

                <div className="flex flex-col justify-between lg:col-span-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3">
                      {featured.publishedAt && (
                        <Meta>
                          <span suppressHydrationWarning>
                            <SafeDate date={featured.publishedAt} options={{ day: "2-digit", month: "short", year: "numeric" }} />
                          </span>
                        </Meta>
                      )}
                      <Meta>{featured.readTime} min read</Meta>
                      {featured.featured && <Meta className="text-[var(--fubrio-accent)]">Featured</Meta>}
                    </div>

                    <h2 className="mt-3 font-display text-[2rem] leading-[1.05] transition-colors group-hover:text-[var(--fubrio-accent)]">
                      {featured.title}
                    </h2>
                    <p className="mt-3 line-clamp-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {featured.excerpt}
                    </p>
                  </div>

                  <span className="link-arrow mt-6 self-start text-foreground">
                    Read it <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            )}

            <ul className="ruled-list">
              {rest.map((p) => (
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
                      <span className="font-display text-[1.4rem] leading-tight transition-colors group-hover:text-[var(--fubrio-accent)]">
                        {p.title}
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
        )}
      </div>
    </div>
  );
}

export function BlogDetail({ post }: { post: SerializedPost }) {
  return (
    <article className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#blog")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Journal
        </button>

        <header className="border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-x-3">
            {post.publishedAt && (
              <Meta>
                <span suppressHydrationWarning>
                  <SafeDate date={post.publishedAt} options={{ day: "2-digit", month: "long", year: "numeric" }} />
                </span>
              </Meta>
            )}
            <Meta>{post.readTime} min read</Meta>
            {post.featured && <Meta className="text-[var(--fubrio-accent)]">Featured</Meta>}
          </div>

          <h1 className="display-heading mt-3 text-[2.5rem] leading-[1.03] sm:text-[3.1rem]">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-4 max-w-2xl font-display text-[1.35rem] leading-snug text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {post.author && (
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-border font-mono text-[10px] uppercase">
                {(post.author.name ?? post.author.email).slice(0, 2)}
              </span>
              <span className="text-[13px]">
                {post.author.name ?? "Anonymous"}
                <Meta className="ml-2">{post.author.email}</Meta>
              </span>
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden border border-border bg-muted">
            <img src={post.coverImage} alt={post.title} width={1200} height={675} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}

        {post.content && (
          <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-normal prose-p:leading-[1.75] prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="mb-4 mt-8 font-display text-[2rem] leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-8 font-display text-[1.6rem] leading-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-6 font-display text-[1.25rem] leading-snug">{children}</h3>,
                p: ({ children }) => <p className="my-4 leading-[1.75] text-foreground/85">{children}</p>,
                ul: ({ children }) => <ul className="my-4 list-disc space-y-1 pl-6 text-foreground/85">{children}</ul>,
                ol: ({ children }) => <ol className="my-4 list-decimal space-y-1 pl-6 text-foreground/85">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote className="my-6 border-l-2 border-[var(--fubrio-accent)] pl-4 font-display text-[1.3rem] leading-snug text-foreground/80">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => (
                  <code className={className?.includes("language-") ? "my-4 block overflow-x-auto border border-border bg-card p-4 font-mono text-[13px]" : "bg-secondary px-1.5 py-0.5 font-mono text-[13px]"}>
                    {children}
                  </code>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-12 border-t border-border pt-4">
            <div className="eyebrow mb-2">Filed under</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {post.tags.map((t) => (
                <Meta key={t.id}>{t.name}</Meta>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
