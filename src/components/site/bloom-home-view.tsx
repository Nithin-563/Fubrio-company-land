"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import {
  ArrowRight, Bot, Shield, Music, Coins, MessageSquare, Ticket, BarChart3,
  Sparkles, Users, Server, Zap, Gift, Calendar, Lock, Bell, ArrowLeft,
  Loader2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BrandConfig } from "@/lib/brand";
import type { PageData } from "@/components/page-client";
import { BloomBotStatus } from "@/components/site/bloom-bot-status";
import { BloomCommandsShowcase } from "@/components/site/bloom-commands-showcase";
import { AnnouncementsView } from "@/components/site/announcements-view";
import { navigate } from "@/lib/router";


const FEATURES = [
  { icon: Shield, title: "Moderation", desc: "Ban, kick, timeout, warn, purge, mass actions, case history, user notes, DMs.", color: "var(--fubrio-accent)" },
  { icon: Lock, title: "Security", desc: "Anti-raid, anti-nuke, anti-spam, anti-bot, anti-webhook, content filters, panic lockdown.", color: "#ef4444" },
  { icon: Music, title: "Music", desc: "High-quality playback from YouTube, Spotify, SoundCloud. Queue, filters, lyrics.", color: "#a855f7" },
  { icon: Coins, title: "Economy", desc: "Server currency, shop, gambling, fishing, mining, leaderboards, bank system.", color: "#f59e0b" },
  { icon: Sparkles, title: "AI", desc: "Ask questions, ticket AI assistant, DM chat, summarize, translate, explain, write.", color: "#3b82f6" },
  { icon: BarChart3, title: "Leveling", desc: "XP, rank cards, leaderboards, level roles, auto-rewards.", color: "#10b981" },
  { icon: Ticket, title: "Tickets", desc: "Support tickets with AI assistant, transcripts, auto-close, claim system.", color: "#ec4899" },
  { icon: Bell, title: "Logging", desc: "Track joins, leaves, message edits/deletes, role changes, voice activity.", color: "#6366f1" },
  { icon: Users, title: "Welcome", desc: "Custom welcome/farewell cards, auto-roles, verification, greeting messages.", color: "#f97316" },
  { icon: Gift, title: "Giveaways", desc: "Host giveaways with auto-winner selection, requirements, and rerolls.", color: "#f43f5e" },
  { icon: Server, title: "Server Stats", desc: "Live member counters, growth charts, channel stats, role counts.", color: "#8b5cf6" },
  { icon: Calendar, title: "Scheduled", desc: "Schedule recurring messages, reminders, countdowns, and events.", color: "#06b6d4" },
];

export function BloomHomeView({ data, brand }: { data: PageData; brand: BrandConfig }) {
  const [showCommands, setShowCommands] = useState(false);

  return (
    <>
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 fubrio-aurora opacity-40" aria-hidden />
        <div className="absolute inset-0 fubrio-grid-bg opacity-20" aria-hidden />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Bot className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
            {brand.tagline}
            <span className="text-[var(--fubrio-accent)]">· by Fubrio</span>
          </div>

          <h1 className="display-heading mt-6 text-5xl sm:text-6xl lg:text-7xl">
            {brand.heroTitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {brand.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {brand.botInviteUrl && (
              <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Bot className="h-4 w-4 mr-2" /> Add to Discord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              onClick={() => navigate("#commands")}
            >
              <Zap className="h-4 w-4 mr-2" /> Browse Commands
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate("#docs")}
            >
              Docs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12">
            <BloomBotStatus fallback={brand.botStatsFallback} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Features</div>
            <h2 className="display-heading mt-2 text-3xl sm:text-4xl">Everything your server needs</h2>
            <p className="mt-2 text-muted-foreground">12 powerful modules, all in one bot. No need for 10 different bots.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40 glass-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="rounded-full" onClick={() => navigate("#commands")}>
              View all 100+ commands
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Commands</div>
            <h2 className="display-heading mt-2 text-3xl sm:text-4xl">100+ commands, 21 categories</h2>
            <p className="mt-2 text-muted-foreground">Browse, search, and filter every single Bloom command.</p>
          </div>

          {showCommands ? (
            <BloomCommandsShowcase />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {["🛡️ Moderation", "🔒 Security", "🎵 Music", "💰 Economy", "🤖 AI", "📊 Leveling", "🎫 Tickets", "📝 Logging", "👋 Welcome", "🎁 Giveaways", "📈 Stats", "✅ Verification"].map((cat) => (
                <div key={cat} className="rounded-xl border border-border bg-card p-4 text-center glass-card">
                  <div className="text-2xl mb-2">{cat.split(" ")[0]}</div>
                  <div className="text-xs font-medium">{cat.split(" ").slice(1).join(" ")}</div>
                </div>
              ))}
            </div>
          )}

          {!showCommands && (
            <div className="mt-6 text-center">
              <Button variant="outline" className="rounded-full" onClick={() => setShowCommands(true)}>
                Show all commands
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-2 text-sm font-medium">
            <span className="text-[var(--fubrio-accent)]">100% Free</span>
            <span className="text-muted-foreground">· No paywalls · No premium tiers · No limits</span>
          </div>
          <h2 className="display-heading mt-6 text-3xl sm:text-4xl">Bloom is completely free</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Every feature, every command, every module - free for everyone. No premium tiers, no paywalled features,
            no usage limits. Just add Bloom to your server and get everything.
          </p>
          {brand.botInviteUrl && (
            <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
              <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                <Bot className="h-4 w-4 mr-2" /> Add to Discord - It's Free
              </Button>
            </a>
          )}
        </div>
      </section>

      {data.posts && data.posts.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Blog</div>
              <h2 className="display-heading mt-2 text-3xl">Latest updates</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.posts.slice(0, 3).map((post: any) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`#blog/${post.slug}`)}
                  className="group text-left rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40 glass-card"
                >
                  {post.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={post.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display font-semibold group-hover:text-[var(--fubrio-accent)] transition-colors">{post.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" className="rounded-full" onClick={() => navigate("#blog")}>
                View all posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {data.faqs && data.faqs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-8">
              <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">FAQ</div>
              <h2 className="display-heading mt-2 text-3xl">Common questions</h2>
            </div>
            <div className="space-y-3">
              {data.faqs.slice(0, 6).map((faq: any) => (
                <div key={faq.id} className="rounded-xl border border-border bg-card p-4 glass-card">
                  <div className="font-medium text-sm mb-1">{faq.question}</div>
                  <div className="text-xs text-muted-foreground">{faq.answer}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" className="rounded-full" onClick={() => navigate("#faq")}>
                View all FAQs
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-2xl text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-[var(--fubrio-accent)]" />
          <h2 className="display-heading text-3xl sm:text-4xl mb-3">Ready to bloom?</h2>
          <p className="text-muted-foreground mb-6">
            Add Bloom to your server in 30 seconds. Completely free, no paywalls, no limits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {brand.botInviteUrl && (
              <a href={brand.botInviteUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Bot className="h-4 w-4 mr-2" /> Add to Discord
                </Button>
              </a>
            )}
            <a href={brand.discordUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="rounded-full">
                <MessageSquare className="h-4 w-4 mr-2" /> Join our Discord
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
