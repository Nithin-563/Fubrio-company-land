"use client";

import { ArrowLeft } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { navigate } from "@/lib/router";
import { Meta } from "@/components/site/editorial";
import type { SerializedFaq } from "@/lib/types";

export function FaqView({ faqs }: { faqs: SerializedFaq[] }) {
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#home")}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </button>

        <div className="chapter-head">
          <div className="chapter-num">FAQ</div>
          <div>
            <div className="eyebrow">Questions, answered</div>
            <h1 className="display-heading mt-2 text-[2.4rem] leading-[1.02] sm:text-[3rem]">
              The things people ask first
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
              Pricing, timelines and how we work. If your question is not here,{" "}
              <button onClick={() => navigate("#contact")} className="underline underline-offset-4 hover:text-foreground">
                send it over
              </button>
              .
            </p>
          </div>
        </div>

        {faqs.length === 0 ? (
          <div className="py-20">
            <div className="font-display text-[1.6rem]">Nothing written yet.</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Questions are added as they come up. Ask us anything in the meantime.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {categories.map((cat) => (
              <section key={cat}>
                <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                  <span className="eyebrow">{cat || "General"}</span>
                  <Meta>{faqs.filter((f) => f.category === cat).length}</Meta>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.filter((f) => f.category === cat).map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="border-b border-border">
                      <AccordionTrigger className="py-4 text-left text-[0.9375rem] font-medium hover:no-underline">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
