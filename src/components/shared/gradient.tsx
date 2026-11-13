"use client";

import { cn } from "@/lib/utils";

export function isStockImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("unsplash.com") ||
    url.includes("images.unsplash") ||
    url.includes("pexels.com") ||
    url.includes("shutterstock.com") ||
    url.includes("stock.") ||
    url.includes("placeholder.com")
  );
}

export function usableImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (isStockImage(url)) return null;
  return url;
}

/** Flat paper wash used behind missing images — no rainbow gradients. */
export function gradientFor(_seed: string): string {
  return "var(--muted)";
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export function GradientPlaceholder({
  seed,
  label,
  className,
  size = "md",
  showLabel = true,
}: {
  seed: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}) {
  const grad = gradientFor(seed);
  const mono = initialsOf(seed);
  const labelCls =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : size === "xl" ? "text-base" : "text-xs";
  const monoCls =
    size === "sm" ? "text-lg" : size === "lg" ? "text-4xl" : size === "xl" ? "text-6xl" : "text-2xl";
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: grad }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <div className="relative text-center">
        <div className={cn("font-display leading-none text-foreground/25", monoCls)}>
          {mono}
        </div>
        {showLabel && label && (
          <div className={cn("mt-1 px-3 font-mono uppercase tracking-[0.1em] text-muted-foreground truncate", labelCls)}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
