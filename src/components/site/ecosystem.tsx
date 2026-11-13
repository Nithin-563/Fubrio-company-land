"use client";

import { ArrowUpRight } from "lucide-react";
import { navigate } from "@/lib/router";
import { ChapterHead } from "@/components/site/editorial";

const CAPABILITIES = [
  { label: "Websites and web apps", desc: "Marketing sites, portals, dashboards, storefronts.", href: "#services" },
  { label: "Mobile apps", desc: "Android, iOS and cross-platform builds.", href: "#services" },
  { label: "Games", desc: "Browser games, 2D and 3D projects, Minecraft systems.", href: "#services" },
  { label: "AI tools", desc: "Assistants, chat interfaces, retrieval and automation.", href: "#services" },
  { label: "Discord bots", desc: "Moderation, ticketing, economy and community systems.", href: "#services" },
  { label: "Hosting and servers", desc: "Minecraft, VPS, bots, databases and backups.", href: "#services" },
  { label: "Design and branding", desc: "Logos, social kits, interfaces and packaging.", href: "#services" },
  { label: "Maintenance", desc: "Fixes, updates and someone to call when it breaks.", href: "#services" },
];

export function Ecosystem() {
  return (
    <section className="py-16 sm:py-20" id="capabilities">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="03"
          label="What we do"
          title="One studio, a deliberately wide bench."
          description="We keep the team small and the range broad. Most projects start as one thing and end up as three."
        />

        <div className="mt-8 grid gap-x-12 border-t border-border lg:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <button
              key={c.label}
              onClick={() => navigate(c.href)}
              className="group flex items-baseline gap-4 border-b border-border py-4 text-left transition-colors hover:text-[var(--fubrio-accent)]"
            >
              <span className="w-7 shrink-0 font-mono text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[1.3rem] leading-snug">{c.label}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                  {c.desc}
                </span>
              </span>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
