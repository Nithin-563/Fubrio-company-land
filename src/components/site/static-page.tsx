"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/router";
import type { SerializedPage } from "@/lib/types";

const SECTION_TYPES: Record<string, (content: any, config: any) => React.ReactNode> = {
  hero: (c) => (
    <section className="py-12 text-center">
      {c.eyebrow && <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">{c.eyebrow}</div>}
      {c.title && <h1 className="display-heading text-4xl sm:text-5xl mt-3">{c.title}</h1>}
      {c.subtitle && <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">{c.subtitle}</p>}
      {(c.primaryCta || c.secondaryCta) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {c.primaryCta && (
            <Button onClick={() => navigate(c.primaryCta.href)} className="rounded-full bg-foreground text-background hover:bg-foreground/90">{c.primaryCta.label}</Button>
          )}
          {c.secondaryCta && (
            <Button variant="outline" onClick={() => navigate(c.secondaryCta.href)} className="rounded-full">{c.secondaryCta.label}</Button>
          )}
        </div>
      )}
    </section>
  ),
  text: (c, cfg) => (
    <section className={`py-8 ${cfg?.width === "narrow" ? "max-w-2xl mx-auto" : ""}`}>
      {c.title && <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">{c.title}</h2>}
      {c.body && <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{c.body}</p>}
    </section>
  ),
  cta: (c) => (
    <section className="py-12">
      <div className="rounded-3xl border border-border bg-secondary/40 p-8 sm:p-12 text-center">
        {c.title && <h2 className="display-heading text-3xl sm:text-4xl">{c.title}</h2>}
        {c.subtitle && <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{c.subtitle}</p>}
        {c.cta && (
          <Button onClick={() => navigate(c.cta.href)} className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90">
            {c.cta.label}
          </Button>
        )}
      </div>
    </section>
  ),
};

export function StaticPage({ page }: { page: SerializedPage }) {
  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        {page.sections.length === 0 ? (
          <div className="text-center py-20">
            <h1 className="display-heading text-3xl font-semibold">{page.title}</h1>
            <p className="mt-2 text-muted-foreground">This page has no content yet.</p>
          </div>
        ) : (
          <>
            <h1 className="sr-only">{page.title}</h1>
            {page.sections.map((section) => {
              const renderer = SECTION_TYPES[section.type];
              if (!renderer) return null;
              return (
                <div key={section.id}>
                  {renderer(section.content as any, section.config as any)}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
