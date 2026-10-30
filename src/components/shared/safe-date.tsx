"use client";

/**
 * SafeDate - renders formatted dates without hydration mismatches.
 *
 * During SSR, `toLocaleString` / `toLocaleDateString` use the server's timezone (UTC on
 * Vercel/Netlify). On the client, they use the user's local timezone. This mismatch
 * causes React hydration errors.
 *
 * This component uses `suppressHydrationWarning` so React accepts the client-rendered
 * version without throwing.
 */

export function SafeDate({
  date,
  options,
  className,
  children,
}: {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  children?: (formatted: string) => React.ReactNode;
}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = options
    ? d.toLocaleString("en-US", options)
    : d.toLocaleString("en-US");
  if (children) {
    return <span className={className} suppressHydrationWarning>{children(formatted)}</span>;
  }
  return <span className={className} suppressHydrationWarning>{formatted}</span>;
}
