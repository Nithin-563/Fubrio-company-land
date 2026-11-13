"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpRight, ArrowLeft, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/editorial";
import type { SerializedProject, SerializedCategory } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";

interface Props {
  projects: SerializedProject[];
  categories: SerializedCategory[];
}

const FIELD =
  "h-9 w-full rounded-none border-0 border-b border-border bg-transparent px-0 text-sm shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:bg-transparent";

export function ShowcaseView({ projects, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "featured">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const filtered = useMemo(() => {
    let result = [...projects];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.shortDesc ?? "").toLowerCase().includes(q),
      );
    }
    if (categoryId !== "all") result = result.filter((p) => p.category?.id === categoryId);
    if (status !== "all") result = result.filter((p) => p.status === status);
    if (featuredOnly) result = result.filter((p) => p.featured);
    if (sort === "oldest") result.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    else if (sort === "name") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "featured") result.sort((a, b) => Number(b.featured) - Number(a.featured));
    else result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return result;
  }, [projects, search, categoryId, status, featuredOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const resetFilters = () => {
    setSearch(""); setCategoryId("all"); setStatus("all"); setFeaturedOnly(false); setSort("newest");
    setPage(1);
  };

  const activeFilterCount =
    (search ? 1 : 0) + (categoryId !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (featuredOnly ? 1 : 0);

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
          <div className="chapter-num">01</div>
          <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Showcase</div>
              <h1 className="display-heading mt-2 text-[2.4rem] leading-[1.02] sm:text-[3.2rem]">
                Everything we have shipped
              </h1>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
                Case studies, tools and experiments, newest first. {filtered.length} of {projects.length}{" "}
                shown.
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={cn("border p-1.5 transition-colors", view === "grid" ? "border-foreground text-foreground" : "border-border hover:text-foreground")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
                className={cn("border p-1.5 transition-colors", view === "list" ? "border-foreground text-foreground" : "border-border hover:text-foreground")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters sit on a single ruled row, like a catalogue index. */}
        <div className="mt-8 grid items-end gap-x-6 gap-y-4 border-b border-border pb-4 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search projects"
              aria-label="Search projects"
              className={cn(FIELD, "pl-6")}
            />
          </div>

          <div className="lg:col-span-2">
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
              <SelectTrigger className={FIELD}><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className={FIELD}><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className={FIELD}><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name">A → Z</SelectItem>
                <SelectItem value="featured">Featured first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 lg:col-span-2">
            <button
              onClick={() => { setFeaturedOnly(!featuredOnly); setPage(1); }}
              aria-pressed={featuredOnly}
              className={cn(
                "border-b pb-0.5 text-[13px] transition-colors",
                featuredOnly ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Featured only
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="py-24">
            <div className="font-display text-[1.8rem]">Nothing matches that.</div>
            <p className="mt-2 text-sm text-muted-foreground">Try a different word, or clear the filters.</p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="mt-5 border border-border px-4 py-2 text-sm transition-colors hover:border-foreground">
                Clear filters
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <ul className="ruled-list mt-6 border-t border-border">
            {paged.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`#showcase/${p.slug}`)}
                  className="group grid w-full grid-cols-[1.75rem_1fr_auto] items-center gap-4 py-4 text-left"
                >
                  <Meta>{String(i + 1 + (current - 1) * PER_PAGE).padStart(2, "0")}</Meta>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-[1.35rem] transition-colors group-hover:text-[var(--fubrio-accent)]">{p.title}</span>
                      <Meta>{p.category?.name ?? "Project"}</Meta>
                      <Meta>{p.status}</Meta>
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">{p.shortDesc}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-border pt-4">
            <button
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground disabled:opacity-40 enabled:hover:text-foreground"
            >
              ← Previous
            </button>
            <Meta>Page {current} / {totalPages}</Meta>
            <button
              onClick={() => setPage(current + 1)}
              disabled={current === totalPages}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground disabled:opacity-40 enabled:hover:text-foreground"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: SerializedProject }) {
  return (
    <button
      onClick={() => navigate(`#showcase/${project.slug}`)}
      className="group text-left focus-premium"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-muted">
        {usableImage(project.coverImage) ? (
          <img
            src={project.coverImage as string}
            alt={project.title}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <GradientPlaceholder seed={project.title} label={project.category?.name} className="absolute inset-0" size="md" />
        )}
        {project.featured && (
          <span className="absolute left-0 top-0 bg-background px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]">
            Featured
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[1.3rem] leading-snug transition-colors group-hover:text-[var(--fubrio-accent)]">
            {project.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {project.shortDesc}
          </p>
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 border-t border-border pt-2">
        <Meta>{project.category?.name ?? "Project"}</Meta>
        <Meta>{project.status}</Meta>
        {project.technologies.slice(0, 2).map((t) => (
          <Meta key={t} className="text-muted-foreground/70">{t}</Meta>
        ))}
      </div>
    </button>
  );
}

export function ShowcaseViewSkeleton() {
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-72 rounded-none" />
        <Skeleton className="mt-2 h-4 w-64 rounded-none" />
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/3] rounded-none" />
              <Skeleton className="mt-3 h-5 w-32 rounded-none" />
              <Skeleton className="mt-2 h-3 w-full rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
