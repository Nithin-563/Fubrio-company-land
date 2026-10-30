"use client";

import { Boxes, Package, Handshake, Users, Code2, Zap } from "lucide-react";
import type { SerializedMetric } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Boxes,
  Package,
  Handshake,
  Users,
  Code2,
  Zap,
};

export function Metrics({ metrics }: { metrics: SerializedMetric[] }) {
  if (metrics.length === 0) return null;
  return (
    <section className="relative py-16 border-y border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m) => {
            const Icon = ICONS[m.icon ?? ""] ?? Boxes;
            return (
              <div key={m.id} className="group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border group-hover:border-[var(--fubrio-accent)] transition-colors">
                    <Icon className="h-4 w-4 text-[var(--fubrio-accent)]" />
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                </div>
                <div className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-foreground">
                  {m.value}
                  {m.unit && <span className="ml-1 text-base text-muted-foreground">{m.unit}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
