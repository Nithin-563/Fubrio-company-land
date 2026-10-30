"use client";

import { useState } from "react";
import { ArrowUpRight, Boxes, Code2, Gamepad2, Bot, Sparkles, Layers, Cloud, Workflow, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigate } from "@/lib/router";

interface Node {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const NODES: Node[] = [
  { id: "products", label: "Products", desc: "SaaS, apps, plugins", icon: Boxes, href: "#products" },
  { id: "apps", label: "Apps", desc: "Web & mobile", icon: Layers, href: "#showcase" },
  { id: "games", label: "Games", desc: "Browser & native", icon: Gamepad2, href: "#showcase" },
  { id: "ai", label: "AI Tools", desc: "LLM-powered", icon: Sparkles, href: "#showcase" },
  { id: "bots", label: "Discord Bots", desc: "Community automation", icon: Bot, href: "#showcase" },
  { id: "devtools", label: "Dev Tools", desc: "Open-source", icon: Code2, href: "#showcase" },
  { id: "services", label: "Services", desc: "Custom development", icon: Workflow, href: "#services" },
  { id: "community", label: "Community", desc: "Open ecosystem", icon: Users, href: "#community" },
  { id: "infrastructure", label: "Cloud & DevOps", desc: "Scale & deploy", icon: Cloud, href: "#services" },
];

export function Ecosystem() {
  const [active, setActive] = useState<string>("products");
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">
            The Fubrio Ecosystem
          </div>
          <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
            One platform. Every kind of digital product.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Fubrio brings together products, apps, games, AI tools, Discord bots, developer tools, services, and a
            growing community - into a single, cohesive ecosystem.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 -m-8 rounded-full bg-[var(--fubrio-accent)]/10 blur-3xl" aria-hidden />
              <div className="relative h-40 w-40 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-[var(--fubrio-accent)]/30 animate-pulse" aria-hidden />
                <div className="text-center">
                  <img src="/fubrio-logo.png" alt="Fubrio" className="h-16 w-16 mx-auto object-contain rounded-lg mb-1" />
                  <div className="font-display text-lg font-semibold">Fubrio</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Ecosystem</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NODES.map((n) => (
                <button
                  key={n.id}
                  onMouseEnter={() => setActive(n.id)}
                  onClick={() => navigate(n.href)}
                  className={cn(
                    "group relative rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5",
                    active === n.id && "border-[var(--fubrio-accent)]/50 bg-[var(--fubrio-accent-soft)]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border">
                      <n.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{n.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
