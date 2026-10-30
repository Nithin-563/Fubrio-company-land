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

export function gradientFor(seed: string): string {
  const hash = Array.from(seed).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 7);
  const palettes: Array<[string, string, string]> = [
    ["oklch(0.22 0.02 240)", "oklch(0.27 0.04 270)", "oklch(0.18 0.02 240)"],
    ["oklch(0.22 0.04 200)", "oklch(0.27 0.06 220)", "oklch(0.18 0.03 200)"],
    ["oklch(0.22 0.05 160)", "oklch(0.27 0.07 180)", "oklch(0.18 0.04 160)"],
    ["oklch(0.22 0.04 290)", "oklch(0.27 0.06 320)", "oklch(0.18 0.03 290)"],
    ["oklch(0.22 0.06 30)", "oklch(0.27 0.08 50)", "oklch(0.18 0.04 30)"],
    ["oklch(0.22 0.05 350)", "oklch(0.27 0.07 10)", "oklch(0.18 0.03 350)"],
    ["oklch(0.22 0.03 180)", "oklch(0.27 0.05 210)", "oklch(0.18 0.02 180)"],
    ["oklch(0.22 0.04 100)", "oklch(0.27 0.06 130)", "oklch(0.18 0.03 100)"],
  ];
  const p = palettes[Math.abs(hash) % palettes.length];
  const angle = (Math.abs(hash) % 90) + 90; // 90 to 180 degrees
  return `linear-gradient(${angle}deg, ${p[0]} 0%, ${p[1]} 50%, ${p[2]} 100%)`;
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
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
        aria-hidden
      />
      <div
        className="absolute -inset-1 opacity-20"
        style={{
          background:
            "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative text-center">
        <div className={cn("font-display font-semibold text-white/90 tracking-tight", monoCls)}>
          {mono}
        </div>
        {showLabel && label && (
          <div className={cn("text-white/60 mt-1 px-3 truncate", labelCls)}>{label}</div>
        )}
      </div>
    </div>
  );
}
