"use client";

import { Meta } from "@/components/site/editorial";
import type { SerializedTestimonial } from "@/lib/types";

export function Testimonials({ testimonials }: { testimonials: SerializedTestimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="pb-16 sm:pb-20">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-t border-border pt-5">
          <span className="eyebrow">In their words</span>
          <Meta>{testimonials.length} notes</Meta>
        </div>

        <div className="mt-7 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <figure key={t.id} className="flex h-full flex-col">
              <blockquote className="font-display text-[1.35rem] leading-[1.35]">
                <span className="text-[var(--fubrio-accent)]" aria-hidden>
                  “
                </span>
                {t.content}
                <span className="text-[var(--fubrio-accent)]" aria-hidden>
                  ”
                </span>
              </blockquote>
              <figcaption className="mt-auto pt-4">
                <div className="h-px w-full bg-border" />
                <div className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium">{t.name}</span>
                  <Meta className="text-right">
                    {[t.role, t.company].filter(Boolean).join(", ")}
                  </Meta>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
