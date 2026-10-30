"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Clock, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { navigate } from "@/lib/router";
import type { SerializedPost } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";
import { SafeDate } from "@/components/shared/safe-date";

export function BlogView({ posts }: { posts: SerializedPost[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return posts;
    const q = search.toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q));
  }, [posts, search]);

  const [featured, ...rest] = filtered;

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>
        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Blog</div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Notes from the build</h1>
        <p className="mt-2 text-muted-foreground">{filtered.length} article{filtered.length !== 1 ? "s" : ""}.</p>

        <div className="mt-8 relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…" className="pl-10 bg-background" />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="font-display text-lg font-semibold">No articles found</div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {featured && (
              <button
                onClick={() => navigate(`#blog/${featured.slug}`)}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-3xl overflow-hidden border border-border bg-card text-left"
              >
                <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden">
                  {usableImage(featured.coverImage) ? (
                       
                      <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <GradientPlaceholder seed={featured.title} label={featured.category?.name} className="absolute inset-0" size="md" />
                    )}
                </div>
                <div className="p-6 sm:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {featured.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                    {featured.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /><SafeDate date={featured.publishedAt} options={{ month: "long", day: "numeric", year: "numeric" }} /></span>}
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime} min read</span>
                  </div>
                  <h2 className="display-heading text-3xl sm:text-4xl mt-4">{featured.title}</h2>
                  <p className="mt-3 text-muted-foreground line-clamp-3">{featured.excerpt}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fubrio-accent)]">
                    Read article
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`#blog/${p.slug}`)}
                  className="group rounded-2xl border border-border bg-card overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {usableImage(p.coverImage) ? (
                       
                      <img src={p.coverImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <GradientPlaceholder seed={p.title} label={p.category?.name} className="absolute inset-0" size="md" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {p.publishedAt && <span><SafeDate date={p.publishedAt} options={{ month: "short", day: "numeric" }} /></span>}
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{p.readTime} min</span>
                    </div>
                    <h3 className="font-display font-semibold mt-2 group-hover:text-[var(--fubrio-accent)] transition-colors line-clamp-2">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogDetail({ post }: { post: SerializedPost }) {
  return (
    <article className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#blog")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
        </button>

        <header className="mb-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.featured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
            {post.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /><SafeDate date={post.publishedAt} options={{ month: "long", day: "numeric", year: "numeric" }} /></span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min read</span>
          </div>
          <h1 className="display-heading text-4xl sm:text-5xl mt-4">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
          {post.author && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-sm font-semibold">
                {(post.author.name ?? post.author.email).split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-semibold">{post.author.name ?? "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">{post.author.email}</div>
              </div>
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-border mb-10">
            { }
            <img src={post.coverImage} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}

        {post.content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="font-display text-3xl font-semibold mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="font-display text-2xl font-semibold mt-8 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="font-display text-xl font-semibold mt-6 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-foreground/80 leading-relaxed my-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1 text-foreground/80">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1 text-foreground/80">{children}</ol>,
                code: ({ children, className }) => (
                  <code className={className?.includes("language-") ? "block bg-secondary p-4 rounded-lg font-mono text-sm overflow-x-auto my-4" : "bg-secondary px-1.5 py-0.5 rounded font-mono text-sm"}>
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
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => <Badge key={t.id} variant="outline" className="rounded-full">{t.name}</Badge>)}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
