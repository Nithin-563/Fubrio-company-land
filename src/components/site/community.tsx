"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { navigate } from "@/lib/router";
import { SafeDate } from "@/components/shared/safe-date";
import { ChapterHead, Meta } from "@/components/site/editorial";
import type { SerializedEvent } from "@/lib/types";

export function Community({ events }: { events: SerializedEvent[] }) {
  return (
    <section className="py-16 sm:py-20" id="community">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="04"
          label="Community"
          title="A Discord server, mostly."
          description="Most of what we make is discussed in public first. If you are building something, you are welcome to sit in."
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
              We run a small, quiet community: build logs, half-finished screenshots, occasional
              help with someone else&rsquo;s bug. No growth hacking, no engagement bait.
            </p>

            <ul className="ruled-list mt-6 border-t border-border">
              <li>
                <a
                  href="https://discord.gg/UmcWh4VdGK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="flex items-center gap-2.5">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Discord community</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/nithin-k-b8082a424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-3.5"
                >
                  <span className="text-sm">LinkedIn — K Nithin, founder</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("#contact")}
                  className="group flex w-full items-center justify-between py-3.5 text-left"
                >
                  <span className="text-sm">Newsletter — one letter a month</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <span className="eyebrow">On the calendar</span>
              <Meta>{events.length === 0 ? "Nothing scheduled" : `${events.length} upcoming`}</Meta>
            </div>

            {events.length === 0 ? (
              <p className="py-10 text-sm text-muted-foreground">
                No events on the books right now. Things usually get announced in Discord first.
              </p>
            ) : (
              <ul className="ruled-list mt-0">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-5 py-4">
                    <div className="w-14 shrink-0 border-r border-border pr-3 text-right">
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground" suppressHydrationWarning>
                        <SafeDate date={e.date} options={{ month: "short" }} />
                      </div>
                      <div className="font-display text-xl leading-none" suppressHydrationWarning>
                        <SafeDate date={e.date} options={{ day: "numeric" }} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-[0.9375rem] font-medium">{e.title}</h3>
                        <Meta>{e.type}</Meta>
                      </div>
                      {e.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                      )}
                      <Meta className="mt-1 block">
                        {e.location ?? "Online"} ·{" "}
                        <span suppressHydrationWarning>
                          <SafeDate date={e.date} options={{ hour: "numeric", minute: "2-digit" }} />
                        </span>
                      </Meta>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
