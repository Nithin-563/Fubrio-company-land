"use client";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
  showText = true,
  text = "Fubrio",
  showImage = true,
  subtitle,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  showImage?: boolean;
  subtitle?: string;
}) {
  const sizeCls =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const textCls =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showImage && (
        <img
          src="/fubrio-logo.png"
          alt={text}
          className={cn(sizeCls, "object-contain rounded-sm")}
        />
      )}
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", textCls)}>
          {text}
          {subtitle && (
            <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">by Fubrio</span>
          )}
        </span>
      )}
    </span>
  );
}
