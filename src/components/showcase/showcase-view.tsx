"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpRight, SlidersHorizontal, LayoutGrid, List, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import type { SerializedProject, SerializedCategory } from "@/lib/types";
import { GradientPlaceholder, usableImage } from "@/components/shared/gradient";

interface Props {
  projects: SerializedProject[];
  categories: SerializedCategory[];
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30",
  MAINTENANCE: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  DRAFT: "bg-muted text-muted-foreground border-border",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

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

  const activeFilterCount = (search ? 1 : 0) + (categoryId !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0) + (featuredOnly ? 1 : 0);

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Showcase</div>
            <h1 className="display-heading mt-2 text-4xl sm:text-5xl">All projects & creations</h1>
            <p className="mt-2 text-muted-foreground">{filtered.length} of {projects.length} projects shown.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => setView(view === "grid" ? "list" : "grid")} aria-label="Toggle view">
              {view === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search projects…"
              className="pl-10 bg-background"
            />
          </div>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
            <SelectTrigger className="bg-background w-full lg:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="bg-background w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="bg-background w-full lg:w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">A → Z</SelectItem>
              <SelectItem value="featured">Featured first</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={featuredOnly ? "default" : "outline"}
            onClick={() => { setFeaturedOnly(!featuredOnly); setPage(1); }}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Featured
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={resetFilters} className="rounded-full">
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        {paged.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="font-display text-lg font-semibold">No projects found</div>
            <div className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</div>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={resetFilters} className="mt-4 rounded-full">Clear filters</Button>
            )}
          </div>
        ) : (
          <div className={cn(
            "mt-10 gap-5",
            view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col",
          )}>
            {paged.map((p) => (
              <ProjectCard key={p.id} project={p} view={view} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-full">Previous</Button>
            <span className="text-sm text-muted-foreground">Page {current} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage(current + 1)} className="rounded-full">Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, view }: { project: SerializedProject; view: "grid" | "list" }) {
  return (
    <button
      onClick={() => navigate(`#showcase/${project.slug}`)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40",
        view === "list" && "flex items-center gap-4",
      )}
    >
      <div className={cn("relative overflow-hidden", view === "list" ? "w-48 h-32 flex-shrink-0" : "aspect-[16/11]")}>
        {usableImage(project.coverImage) ? (
                       
                      <img src={project.coverImage} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <GradientPlaceholder seed={project.title} label={project.category?.name} className="absolute inset-0" size="md" />
                    )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-1.5">
          {project.featured && (
            <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20 text-[10px]">Featured</Badge>
          )}
        </div>
      </div>
      <div className={cn("p-4", view === "list" && "flex-1")}>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          {project.category && <span>{project.category.name}</span>}
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] border", STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT)}>
            {project.status}
          </span>
        </div>
        <h3 className="font-display font-semibold text-base group-hover:text-[var(--fubrio-accent)] transition-colors line-clamp-1">{project.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.shortDesc}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((t) => (
              <span key={t} className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
            ))}
            {project.technologies.length > 3 && <span className="text-[10px] text-muted-foreground">+{project.technologies.length - 3}</span>}
          </div>
          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </button>
  );
}

export function ShowcaseViewSkeleton() {
  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-4 w-64 mt-2" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-[16/11]" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
