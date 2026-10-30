"use client";

import { MessageCircle, Calendar, Users, ArrowUpRight, Sparkles, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import { SafeDate } from "@/components/shared/safe-date";
import type { SerializedEvent } from "@/lib/types";

export function Community({ events }: { events: SerializedEvent[] }) {
  return (
    <section className="py-24 sm:py-32 bg-secondary/30 border-y border-border/60" id="community">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Community
            </div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Where builders, makers, and explorers gather.
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Join the Fubrio Discord, follow along on social, or attend an upcoming event. The community is open
              to anyone building or curious about digital products.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="https://discord.gg/UmcWh4VdGK"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl glass-card p-5 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5865F2]/15 border border-[#5865F2]/30">
                    <MessageCircle className="h-4 w-4 text-[#5865F2]" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3 font-display font-semibold">Discord Community</div>
                <div className="text-xs text-muted-foreground mt-1">Live chat, support, and community events.</div>
                <div className="mt-3 text-xs font-medium text-[#5865F2]">Join Discord →</div>
              </a>
              <a
                href="https://www.linkedin.com/in/nithin-k-b8082a424"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl glass-card p-5 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2]/15 border border-[#0A66C2]/30">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-3 font-display font-semibold">LinkedIn</div>
                <div className="text-xs text-muted-foreground mt-1">Connect with the founder, K Nithin.</div>
                <div className="mt-3 text-xs font-medium text-[#0A66C2]">Connect →</div>
              </a>
              <CommunityCard
                icon={<Sparkles className="h-4 w-4" />}
                title="Newsletter"
                desc="Subscribe for product updates and articles."
                href="#contact"
                cta="Subscribe"
              />
            </div>

            <div className="mt-6">
              <Button onClick={() => navigate("#contact")} variant="outline" className="rounded-full group">
                Start a conversation
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>

          <div className="rounded-3xl glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--fubrio-accent)]" />
                <h3 className="font-display text-lg font-semibold">Upcoming events</h3>
              </div>
              <Badge variant="outline">{events.length}</Badge>
            </div>
            {events.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((e) => (
                  <div key={e.id} className="flex gap-4 p-3 rounded-xl hover:bg-accent transition-colors group">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-background border border-border flex-shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground" suppressHydrationWarning>
                        <SafeDate date={e.date} options={{ month: "short" }} />
                      </div>
                      <div className="text-xl font-display font-semibold" suppressHydrationWarning>
                        <SafeDate date={e.date} options={{ day: "numeric" }} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                        {e.location && (
                          <span className="text-[11px] text-muted-foreground">{e.location}</span>
                        )}
                      </div>
                      <div className="font-semibold text-sm">{e.title}</div>
                      {e.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{e.description}</div>
                      )}
                      <div className="text-[11px] text-muted-foreground mt-1" suppressHydrationWarning>
                        <SafeDate date={e.date} options={{ hour: "numeric", minute: "2-digit" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityCard({
  icon, title, desc, href, cta,
}: { icon: React.ReactNode; title: string; desc: string; href: string; cta: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-2xl glass-card p-5 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border">
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-3 font-display font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      <div className="mt-3 text-xs font-medium text-[var(--fubrio-accent)]">{cta} →</div>
    </a>
  );
}
