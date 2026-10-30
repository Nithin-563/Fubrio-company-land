"use client";

import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SerializedTestimonial } from "@/lib/types";

export function Testimonials({ testimonials }: { testimonials: SerializedTestimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">
            Testimonials
          </div>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            What partners and clients say.
          </h2>
          <p className="mt-4 text-muted-foreground">
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="relative rounded-2xl glass-card p-6"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-[var(--fubrio-accent)]/30" />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < t.rating ? "fill-[var(--fubrio-accent)] text-[var(--fubrio-accent)]" : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-foreground/90 leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-sm font-semibold">
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}{t.role && t.company ? " · " : ""}{t.company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
