"use client";

import { useEffect, useState } from "react";
import { Menu, Search, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { navigate, useHashRoute } from "@/lib/router";
import type { BrandConfig } from "@/lib/brand";
import { FUBRIO_CONFIG } from "@/lib/brand";

const GROUPS: Array<{ title: string; keys: string[] }> = [
  { title: "The studio", keys: ["About", "Partners", "Sponsors", "FAQ"] },
  { title: "Resources", keys: ["Docs", "API Keys", "Pricing", "Announcements"] },
  { title: "Elsewhere", keys: ["Contact", "Shop", "Blog"] },
];

function splitRoute(route: string) {
  const clean = route.startsWith("#") ? route.slice(1) : route;
  return clean.split("/").filter(Boolean)[0] ?? "home";
}

function Wordmark({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-[1.6rem] leading-none tracking-[-0.03em]">{name}</span>
      {subtitle ? (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
          {subtitle}
        </span>
      ) : (
        <span className="mb-[3px] h-[7px] w-[7px] shrink-0 bg-[var(--fubrio-accent)]" aria-hidden />
      )}
    </span>
  );
}

export function Navbar({ onOpenSearch, brand = FUBRIO_CONFIG }: { onOpenSearch: () => void; brand?: BrandConfig }) {
  const route = useHashRoute();
  const current = splitRoute(route);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);

  useEffect(() => {
    setIndexOpen(false);
  }, [route]);

  const go = (href: string) => {
    setMobileOpen(false);
    setIndexOpen(false);
    navigate(href);
  };

  const tabs = brand.navItems;
  const secondary = brand.secondaryNavItems;
  const isTabActive = (href: string) => splitRoute(href) === current;

  const grouped = GROUPS.map((g) => ({
    ...g,
    items: g.keys
      .map((k) => secondary.find((s) => s.label === k))
      .filter((s): s is { label: string; href: string } => Boolean(s))
      .filter((s) => !tabs.some((tab) => tab.href === s.href)),
  })).filter((g) => g.items.length > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between gap-4">
          <button
            onClick={() => go("#home")}
            className="focus-premium -ml-1 flex items-center rounded-sm px-1 py-1"
            aria-label={`${brand.name} home`}
          >
            <Wordmark name={brand.name} subtitle={brand.isBloom ? "by Fubrio" : undefined} />
          </button>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {tabs.map((item) => (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                aria-current={isTabActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-sm px-2.5 py-1.5 text-[0.8125rem] transition-colors",
                  isTabActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {isTabActive(item.href) && (
                  <span
                    className="absolute inset-x-2 -bottom-[9px] h-[2px] bg-foreground"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenSearch}
              className="focus-premium hidden h-8 items-center gap-1.5 rounded-sm border border-transparent px-2 text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:flex"
              aria-label="Search"
            >
              <Search className="h-[15px] w-[15px]" />
              <span className="font-mono text-[10px] tracking-[0.06em]">⌘K</span>
            </button>

            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setIndexOpen((s) => !s)}
                className={cn(
                  "hidden items-center gap-1 rounded-sm px-2.5 py-1.5 text-[0.8125rem] transition-colors md:flex",
                  indexOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-expanded={indexOpen}
                aria-haspopup="true"
              >
                Index
                <ChevronDown className={cn("h-3 w-3 transition-transform", indexOpen && "rotate-180")} />
              </button>

              {indexOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIndexOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 top-full z-50 mt-3 w-[30rem] border border-border bg-background p-5 shadow-[6px_6px_0_0_rgba(0,0,0,0.06)] animate-fade-in">
                    <div className="grid grid-cols-3 gap-5">
                      {grouped.map((group) => (
                        <div key={group.title}>
                          <div className="eyebrow mb-2 border-b border-border pb-2">{group.title}</div>
                          <ul className="space-y-1">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <button
                                  onClick={() => go(item.href)}
                                  className="w-full rounded-sm py-1 text-left text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <button
                        onClick={() => go("#admin")}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => go("#czer")}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 transition-colors hover:text-foreground"
                      >
                        Czer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => go("#contact")}
              className="btn-ink ml-2 hidden h-8 px-3 text-[0.8125rem] sm:inline-flex"
            >
              Start a project
            </button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="focus-premium ml-1 flex h-8 w-8 items-center justify-center rounded-sm text-foreground md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-[18px] w-[18px]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 sm:w-[360px]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <SheetTitle className="text-left">
                      <Wordmark name={brand.name} subtitle={brand.isBloom ? "by Fubrio" : undefined} />
                    </SheetTitle>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="text-muted-foreground"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="eyebrow mb-2">Sections</div>
                    <ul className="ruled-list">
                      {tabs.map((item) => (
                        <li key={item.href}>
                          <button
                            onClick={() => go(item.href)}
                            className="flex w-full items-baseline justify-between py-3 text-left"
                          >
                            <span className="font-display text-xl">{item.label}</span>
                            {item.desc ? (
                              <span className="ml-4 hidden text-right text-[11px] text-muted-foreground sm:block">
                                {item.desc}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {grouped.map((group) => (
                      <div key={group.title} className="mt-6">
                        <div className="eyebrow mb-1">{group.title}</div>
                        <ul className="ruled-list">
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <button
                                onClick={() => go(item.href)}
                                className="flex w-full items-center justify-between py-2.5 text-left text-sm text-muted-foreground"
                              >
                                {item.label}
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border p-5">
                    <button onClick={() => go("#contact")} className="btn-ink w-full">
                      Start a project
                    </button>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => go("#admin")}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => go("#czer")}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60"
                      >
                        Czer
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
