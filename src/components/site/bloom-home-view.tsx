"use client";

import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Bot, MessageSquare, Shield, Music, Coins, Ticket,
  BarChart3, Users, Server, Bell, Lock, Gift, Calendar, Command, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChapterHead, Meta, Tag } from "@/components/site/editorial";
import type { BrandConfig } from "@/lib/brand";
import type { PageData } from "@/components/page-client";
import { BloomBotStatus } from "@/components/site/bloom-bot-status";
import { BloomCommandsShowcase } from "@/components/site/bloom-commands-showcase";
import { navigate } from "@/lib/router";

const MODULES = [
  { icon: Shield, title: "Moderation", desc: "Ban, kick, timeout, warn, purge, case history, user notes." },
  { icon: Lock, title: "Security", desc: "Anti-raid, anti-nuke, anti-spam, content filters, panic lockdown." },
  { icon: Music, title: "Music", desc: "Playback from YouTube, Spotify and SoundCloud. Queue, filters, lyrics." },
  { icon: Coins, title: "Economy", desc: "Server currency, shop, bank, fishing, mining, leaderboards." },
  { icon: Sparkles, title: "AI", desc: "Questions, ticket summaries, DM chat, translation, drafting." },
  { icon: BarChart3, title: "Leveling", desc: "XP, rank cards, leaderboards, level roles, auto rewards." },
  { icon: Ticket, title: "Tickets", desc: "Support tickets with transcripts, claiming and auto-close." },
  { icon: Bell, title: "Logging", desc: "Joins, leaves, edits, deletes, role and voice activity." },
  { icon: Users, title: "Welcome", desc: "Welcome and farewell cards, auto roles, verification." },
  { icon: Gift, title: "Giveaways", desc: "Requirements, auto winners, rerolls." },
  { icon: Server, title: "Server stats", desc: "Live counters, growth charts, channel and role stats." },
  { icon: Calendar, title: "Scheduled", desc: "Recurring messages, reminders, countdowns, events." },
];

const CATEGORIES = [
  "Moderation", "Security", "Music", "Economy", "AI", "Leveling",
  "Tickets", "Logging", "Welcome", "Giveaways", "Stats", "Verification",
];

export function BloomHomeView({ data, brand }: { data: PageData; brand: BrandConfig }) {
  const [showCommands, setShowCommands] = useState(false);

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2">
                <Tag>Discord bot</Tag>
                <Tag className="text-[var(--fubrio-accent)]">Free</Tag>
              </div>

              <h1 className="display-heading mt-6 text-[3rem] leading-[0.95] sm:text-[4.25rem] lg:text-[5rem]">
                {brand.heroTitle}
              </h1>

              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                {brand.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {brand.botInviteUrl && (
                  <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg">
                      <Bot className="mr-2 h-4 w-4" /> Add to Discord
                    </Button>
                  </a>
                )}
                <Button size="lg" variant="outline" onClick={() => navigate("#commands")}>
                  Command index <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <button onClick={() => navigate("#docs")} className="link-arrow px-1 text-muted-foreground">
                  Documentation <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-12">
              <div className="eyebrow mb-3">Live status</div>
              <BloomBotStatus fallback={brand.botStatsFallback} />
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                Running on sharded infrastructure with a 60-second status feed. No paywalls, no
                premium tier, no usage caps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <ChapterHead
            index="01"
            label="Modules"
            title="One bot instead of ten"
            description="Twelve modules ship in the same install. Enable what a server needs, ignore the rest."
          />

          <ul className="ruled-list mt-8 grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <li key={m.title} className="border-b border-border py-5 pr-4 sm:odd:pr-8 lg:[&:nth-child(3n)]:pr-0">
                <div className="flex items-baseline gap-3">
                  <Meta>{String(i + 1).padStart(2, "0")}</Meta>
                  <h3 className="text-[0.9375rem]">{m.title}</h3>
                </div>
                <p className="mt-1.5 pl-[2.1rem] text-[13px] leading-relaxed text-muted-foreground">{m.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30" id="commands">
        <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <ChapterHead
            index="02"
            label="Command index"
            title="150 commands, 21 categories"
            description="Every command is documented, permission-aware and slash-command native."
            action={
              !showCommands ? (
                <Button variant="outline" onClick={() => setShowCommands(true)}>
                  Open full index
                </Button>
              ) : undefined
            }
          />

          {showCommands ? (
            <div className="mt-8">
              <BloomCommandsShowcase />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShowCommands(true)}
                  className="group flex items-center justify-between gap-2 border-b border-border py-3 text-left text-[0.875rem] transition-colors hover:text-[var(--fubrio-accent)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Command className="h-3.5 w-3.5 text-muted-foreground" />
                    {cat}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-colors group-hover:text-[var(--fubrio-accent)]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Pricing</div>
              <p className="mt-2 font-display text-[1.75rem] leading-tight">Free, in full.</p>
            </div>
            <div className="lg:col-span-8 lg:border-l lg:border-border lg:pl-12">
              <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                Every module, every command, every update. There is no paid tier, no locked feature
                and no per-message billing. Bloom is funded by the studio, not by your server.
              </p>
              {brand.botInviteUrl && (
                <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block">
                  <Button variant="outline">
                    Add Bloom to a server <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <ChapterHead
            index="03"
            label="Setup"
            title="Three steps, no dashboard required"
            description="Bloom runs on sensible defaults from the first minute. Configuration is there when you want it, not before."
          />

          <ol className="mt-8 grid gap-8 border-t border-border pt-6 sm:grid-cols-3 sm:gap-10">
            {[
              [
                "Invite",
                "Pick the server, review the permissions Bloom asks for, authorise. Only the modules you enable need them.",
              ],
              [
                "Configure",
                "Run /config for a guided pass over moderation, logging, welcome and tickets. It writes only what you change.",
              ],
              [
                "Leave it alone",
                "Defaults are conservative: log-only where a wrong action would be expensive, action where the signal is certain.",
              ],
            ].map(([title, body], i) => (
              <li key={title}>
                <Meta>{String(i + 1).padStart(2, "0")}</Meta>
                <h3 className="mt-2 text-[1.0625rem]">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">Safety</div>
              <h2 className="display-heading mt-2 text-[1.75rem] leading-tight">
                Moderation you can undo.
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Every action is recorded as a case with the reason, the moderator and a jump link, so a
                wrong call is one command away from being reversed.
              </p>
            </div>

            <dl className="lg:col-span-8 lg:border-l lg:border-border lg:pl-12">
              {[
                ["Reversible first", "Timeouts before bans, and bans always carry a reason and a case id."],
                ["Only what you enable", "No module acts in a channel until you turn it on for that server."],
                ["No paid protection", "Anti-raid, anti-nuke and anti-spam are free. Safety is not a subscription."],
              ].map(([title, body], i) => (
                <div key={title} className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-border py-4 first:border-t">
                  <Meta>{String(i + 1).padStart(2, "0")}</Meta>
                  <div>
                    <dt className="text-[0.9375rem]">{title}</dt>
                    <dd className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{body}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {data.posts && data.posts.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <ChapterHead
              index="04"
              label="Journal"
              title="Release notes"
              action={
                <Button variant="outline" onClick={() => navigate("#blog")}>
                  All posts
                </Button>
              }
            />
            <div className="mt-8 border-t border-border">
              {data.posts.slice(0, 3).map((post: { id: string; slug: string; title: string; excerpt?: string | null; coverImage?: string | null }) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`#blog/${post.slug}`)}
                  className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-4 border-b border-border py-4 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] transition-colors group-hover:text-[var(--fubrio-accent)]">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">{post.excerpt}</p>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-[var(--fubrio-accent)]" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.faqs && data.faqs.length > 0 && (
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <ChapterHead
              index="05"
              label="Questions"
              title="Before you add it"
              action={
                <Button variant="outline" onClick={() => navigate("#faq")}>
                  All answers
                </Button>
              }
            />
            <dl className="mt-8 grid gap-x-12 gap-y-6 border-t border-border pt-6 sm:grid-cols-2">
              {data.faqs.slice(0, 6).map((faq: { id: string; question: string; answer: string }) => (
                <div key={faq.id}>
                  <dt className="text-[0.9375rem]">{faq.question}</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-[84rem] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="eyebrow">Install</div>
              <h2 className="display-heading mt-2 text-[2rem] leading-[1.05] sm:text-[2.75rem]">
                Thirty seconds, then it is live.
              </h2>
              <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground">
                Pick a server, approve the permissions, done. Defaults run sensibly from the first
                minute; the dashboard takes over when you want to tune it.
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-3 lg:col-span-5 lg:justify-end">
              {brand.botInviteUrl && (
                <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <Bot className="mr-2 h-4 w-4" /> Add to Discord
                  </Button>
                </a>
              )}
              <a href={brand.discordUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" /> Support server
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
