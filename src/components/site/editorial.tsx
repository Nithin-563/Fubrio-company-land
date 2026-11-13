import { cn } from "@/lib/utils";

export function ChapterHead({
  index,
  label,
  title,
  description,
  action,
  className,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("chapter-head", className)}>
      <div className="chapter-num">{index}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="eyebrow">{label}</div>
          <h2 className="display-heading mt-2 text-[2rem] leading-[1.05] sm:text-[2.6rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("tag", className)}>{children}</span>;
}

export function Meta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] tracking-[0.06em] text-muted-foreground", className)}>
      {children}
    </span>
  );
}
