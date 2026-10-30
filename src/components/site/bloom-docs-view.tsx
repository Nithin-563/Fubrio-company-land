"use client";

import { ArrowLeft, BookOpen, Bot, Zap, Shield, BarChart3, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { navigate } from "@/lib/router";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Bot },
  { id: "commands", label: "Commands", icon: Zap },
  { id: "security", label: "Security", icon: Shield },
  { id: "faq", label: "FAQ", icon: MessageSquare },
] as const;

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold mt-8 mb-3 scroll-mt-24">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-semibold mt-5 mb-2 scroll-mt-24">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

export function BloomDocsView({ botInviteUrl, discordUrl }: { botInviteUrl?: string; discordUrl?: string }) {
  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Bloom Docs</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Everything you need to set up, configure, and get the most out of Bloom - the all-in-one Discord bot by Fubrio.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pb-2">On this page</div>
              <nav className="flex flex-col">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                  >
                    <s.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <section id="getting-started" className="scroll-mt-24">
              <H2>Getting Started</H2>
              <P>Adding Bloom to your Discord server takes about 30 seconds. Here's how:</P>

              <H3>Step 1: Invite Bloom</H3>
              <P>
                Click the button below to add Bloom to your server. You'll need the <strong>Manage Server</strong> permission
                in the target server. Discord will show you the permissions Bloom needs - review them and click Authorize.
              </P>
              {botInviteUrl && (
                <a href={botInviteUrl} target="_blank" rel="noopener noreferrer" className="inline-block mb-4">
                  <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Bot className="h-4 w-4 mr-2" /> Add Bloom to Discord
                  </Button>
                </a>
              )}

              <H3>Step 2: Set up your prefix</H3>
              <P>
                By default, Bloom responds to <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/</code> slash commands.
                You can also set a text prefix (like <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">!</code> or <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">?</code>)
                using the <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/config</code> command in Discord.
              </P>

              <H3>Step 3: Configure modules</H3>
              <P>
                Use the <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/config</code> command in Discord to set up
                modules like security, logging, AI, welcome, and more. Bloom's interactive config wizard will
                guide you through each module. You can also use individual commands like{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/security</code>,{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/logging</code>,{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/welcome</code> to configure each module.
              </P>

              <H3>Step 4: Use commands</H3>
              <P>
                Type <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/help</code> in your server to see all available commands.
                Or browse the full <button onClick={() => navigate("#commands")} className="text-foreground underline hover:no-underline">command list</button> on this website.
              </P>
            </section>

            <section id="commands" className="scroll-mt-24">
              <H2>Commands</H2>
              <P>
                Bloom has 100+ commands across 21 categories. Here's a quick overview:
              </P>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  { cat: "Moderation", cmds: "ban, kick, timeout, warn, purge, lock" },
                  { cat: "Security", cmds: "anti-raid, anti-nuke, anti-spam, filters" },
                  { cat: "Music", cmds: "play, queue, nowplaying, join" },
                  { cat: "Economy", cmds: "balance, daily, work, shop, gamble" },
                  { cat: "AI", cmds: "/ask, ticket AI, DM chat" },
                  { cat: "Leveling", cmds: "rank, level, leaderboard" },
                  { cat: "Tickets", cmds: "ticket create, claim, close" },
                  { cat: "Logging", cmds: "message edits, deletes, joins, leaves" },
                  { cat: "Welcome", cmds: "welcome cards, auto-roles, farewell" },
                  { cat: "Utility", cmds: "remind, poll, schedule, weather" },
                ].map((c) => (
                  <Card key={c.cat} className="p-3 glass-card">
                    <div className="text-xs font-semibold text-[var(--fubrio-accent)] mb-1">{c.cat}</div>
                    <div className="text-xs text-muted-foreground">{c.cmds}</div>
                  </Card>
                ))}
              </div>
              <P>
                For the complete list with descriptions, visit the{" "}
                <button onClick={() => navigate("#commands")} className="text-foreground underline hover:no-underline">
                  Commands page
                </button>.
              </P>
            </section>

            <section id="security" className="scroll-mt-24">
              <H2>Security</H2>
              <P>
                Bloom's security module protects your server from raids, nukes, spam, and bot attacks.
                Enable it by running <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/security</code> in Discord.
              </P>
              <H3>Anti-raid</H3>
              <P>
                Detects when many accounts join in a short period and automatically kicks/bans them.
                Configure the threshold (e.g. 5 joins in 10 seconds) from Discord.
              </P>
              <H3>Anti-nuke</H3>
              <P>
                Blocks mass channel and role deletions. If an admin goes rogue and tries to delete everything,
                Bloom will stop them and alert the server owner.
              </P>
              <H3>Anti-spam</H3>
              <P>
                Detects spam patterns (repeated messages, links, mentions) and automatically mutes the offender.
                You can configure what counts as spam and what action to take.
              </P>
              <H3>Anti-bot</H3>
              <P>
                Automatically kicks bot accounts that join without authorization. Keep your server clean of
                malicious bots.
              </P>
            </section>

            <section id="faq" className="scroll-mt-24">
              <H2>FAQ</H2>
              <H3>Is Bloom free?</H3>
              <P>
                Yes! Bloom is completely free - every feature, every command, every module. No premium tiers,
                no paywalls, no usage limits. Just add Bloom to your server and get everything for free.
              </P>
              <H3>How do I report a bug or suggest a feature?</H3>
              <P>
                Click the floating bug icon in the bottom-left of any page on this site, or use the{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/report</code> and{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">/suggest</code> commands in Discord.
              </P>
              <H3>How do I get support?</H3>
              <P>
                Join our{" "}
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">
                  Discord server
                </a>{" "}
                and ask in the #bloom-support channel. Or email{" "}
                <a href="mailto:support@fubrio.in" className="text-foreground underline hover:no-underline">
                  support@fubrio.in
                </a>.
              </P>
              <H3>Can Bloom replace Carl-bot / Wick / MEE6?</H3>
              <P>
                Yes! Bloom includes moderation, security, music, economy, leveling, tickets, logging, AI, welcome cards,
                reaction roles, giveaways, and more - all in one bot. No need for multiple bots.
              </P>
            </section>

            <div className="mt-12 rounded-2xl border border-border bg-secondary/30 p-6 text-center">
              <Bot className="h-8 w-8 mx-auto mb-3 text-[var(--fubrio-accent)]" />
              <h3 className="font-display text-lg font-semibold mb-2">Ready to get started?</h3>
              <p className="text-sm text-muted-foreground mb-4">Add Bloom to your server and start configuring in 30 seconds.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {botInviteUrl && (
                  <a href={botInviteUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                      <Bot className="h-4 w-4 mr-2" /> Add to Discord
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="rounded-full" onClick={() => navigate("#commands")}>
                  <Zap className="h-4 w-4 mr-2" /> Browse Commands
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
