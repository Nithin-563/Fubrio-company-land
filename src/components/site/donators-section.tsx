"use client";

import { ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { Meta } from "@/components/site/editorial";

interface Donator {
  id: string;
  name: string;
  amount: number;
  currency: string;
  message: string | null;
  date: string | null;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}k`;
  return `${symbol}${amount}`;
}

export function DonatorsSection({ donators }: { donators: Donator[] }) {
  if (!donators || donators.length === 0) return null;

  const totalRaised = donators.reduce((sum, d) => sum + (d.amount || 0), 0);
  const currency = donators[0]?.currency ?? "INR";
  const sorted = [...donators].sort((a, b) => (b.amount || 0) - (a.amount || 0));

  return (
    <section className="pb-16 sm:pb-20" id="donators">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border pt-5">
          <span className="eyebrow">Supporters</span>
          <Meta>
            {donators.length} {donators.length === 1 ? "person" : "people"}
            {totalRaised > 0 ? ` · ${formatAmount(totalRaised, currency)} raised` : ""}
          </Meta>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="max-w-xs font-display text-[1.35rem] leading-snug">
              Servers cost money. These are the people who quietly covered some of it.
            </p>
            <button onClick={() => navigate("#contact")} className="link-arrow mt-5 text-muted-foreground">
              Support the studio <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="ruled-list border-t border-border lg:col-span-8">
            {sorted.map((d, i) => (
              <li key={d.id} className="grid grid-cols-[1.75rem_1fr_auto] items-baseline gap-3 py-3.5">
                <Meta>{String(i + 1).padStart(2, "0")}</Meta>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-[0.9375rem]">{d.name}</span>
                    {d.date && (
                      <Meta>
                        {new Date(d.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </Meta>
                    )}
                  </div>
                  {d.message && (
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                      “{d.message}”
                    </p>
                  )}
                </div>

                <Meta className="text-foreground">{formatAmount(d.amount, d.currency)}</Meta>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
