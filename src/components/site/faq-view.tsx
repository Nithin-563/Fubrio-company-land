"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { navigate } from "@/lib/router";
import type { SerializedFaq } from "@/lib/types";

export function FaqView({ faqs }: { faqs: SerializedFaq[] }) {
  const categories = Array.from(new Set(faqs.map((f) => f.category)));
  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>
        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">FAQ</div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Frequently asked questions</h1>
        <p className="mt-2 text-muted-foreground">Common questions about Fubrio.</p>

        {faqs.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="font-display text-lg font-semibold">No FAQs yet</div>
            <div className="mt-1 text-sm text-muted-foreground">Check back soon.</div>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="font-display text-xl font-semibold mb-3">{cat}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.filter((f) => f.category === cat).map((f) => (
                    <AccordionItem key={f.id} value={f.id} className="border border-border rounded-xl px-4 bg-card">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
