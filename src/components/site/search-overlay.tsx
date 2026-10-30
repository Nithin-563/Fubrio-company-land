"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowUpRight, FileText, Package, Boxes, Handshake, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { navigate } from "@/lib/router";
import type {
  SerializedProject,
  SerializedProduct,
  SerializedPost,
  SerializedSponsor,
  SerializedPartner,
} from "@/lib/types";

interface SearchResults {
  projects: SerializedProject[];
  products: SerializedProduct[];
  posts: SerializedPost[];
  sponsors: SerializedSponsor[];
  partners: SerializedPartner[];
}

const EMPTY: SearchResults = { projects: [], products: [], posts: [], sponsors: [], partners: [] };

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(EMPTY);
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(EMPTY);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.results ?? EMPTY);
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const total =
    results.projects.length + results.products.length + results.posts.length +
    results.sponsors.length + results.partners.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-2xl mt-16 sm:mt-24 rounded-2xl glass-strong shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, products, posts…"
            className="border-0 bg-transparent px-0 py-0 h-auto focus-visible:ring-0 text-base"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
            ESC
          </kbd>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1 hover:bg-accent" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Start typing to search across projects, products, posts, sponsors and partners.
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Searching…</div>
          ) : total === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm text-muted-foreground mb-2">No results for &quot;{query}&quot;</div>
              <div className="text-xs text-muted-foreground">Try a different keyword or browse the showcase.</div>
            </div>
          ) : (
            <div className="p-2">
              {results.projects.length > 0 && (
                <ResultGroup title="Projects" icon={<Boxes className="h-3.5 w-3.5" />}>
                  {results.projects.map((p) => (
                    <ResultRow key={p.id} title={p.title} desc={p.shortDesc} onClick={() => { onOpenChange(false); navigate(`#showcase/${p.slug}`); }} />
                  ))}
                </ResultGroup>
              )}
              {results.products.length > 0 && (
                <ResultGroup title="Products" icon={<Package className="h-3.5 w-3.5" />}>
                  {results.products.map((p) => (
                    <ResultRow key={p.id} title={p.title} desc={p.shortDesc} onClick={() => { onOpenChange(false); navigate(`#products/${p.slug}`); }} />
                  ))}
                </ResultGroup>
              )}
              {results.posts.length > 0 && (
                <ResultGroup title="Blog" icon={<FileText className="h-3.5 w-3.5" />}>
                  {results.posts.map((p) => (
                    <ResultRow key={p.id} title={p.title} desc={p.excerpt} onClick={() => { onOpenChange(false); navigate(`#blog/${p.slug}`); }} />
                  ))}
                </ResultGroup>
              )}
              {results.sponsors.length > 0 && (
                <ResultGroup title="Sponsors" icon={<Sparkles className="h-3.5 w-3.5" />}>
                  {results.sponsors.map((p) => (
                    <ResultRow key={p.id} title={p.name} desc={p.description} onClick={() => { onOpenChange(false); navigate(`#sponsors`); }} />
                  ))}
                </ResultGroup>
              )}
              {results.partners.length > 0 && (
                <ResultGroup title="Partners" icon={<Handshake className="h-3.5 w-3.5" />}>
                  {results.partners.map((p) => (
                    <ResultRow key={p.id} title={p.name} desc={p.description} onClick={() => { onOpenChange(false); navigate(`#partners`); }} />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({ title, desc, onClick }: { title: string; desc?: string | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors text-left">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {desc && <div className="text-xs text-muted-foreground truncate mt-0.5">{desc}</div>}
      </div>
      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
