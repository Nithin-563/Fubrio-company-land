"use client";

import { useEffect, useState } from "react";
import { Menu, X, Search, ArrowUpRight, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { navigate } from "@/lib/router";
import type { BrandConfig } from "@/lib/brand";
import { FUBRIO_CONFIG } from "@/lib/brand";

export function Navbar({ onOpenSearch, brand = FUBRIO_CONFIG }: { onOpenSearch: () => void; brand?: BrandConfig }) {
  const NAV_ITEMS = brand.navItems;
  const SECONDARY_ITEMS = brand.secondaryNavItems;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMobileOpen(false);
    setMoreOpen(false);
    navigate(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled
          ? "glass-nav"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => go("#home")} className="flex items-center gap-2 focus-premium rounded-md" aria-label={brand.name + " home"}>
            <Logo text={brand.name} showImage={!brand.isBloom} subtitle={brand.isBloom ? "by Fubrio" : undefined} />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                {item.label}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreOpen((s) => !s)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
              >
                More
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-xl animate-scale-in">
                  {SECONDARY_ITEMS.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => go(item.href)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                    </button>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => go("#admin")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--fubrio-accent)]" />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => go("#czer")}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <span>Czer</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={onOpenSearch} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button
              variant="default"
              size="sm"
              className="hidden sm:inline-flex ml-2 bg-foreground text-background hover:bg-foreground/90 rounded-full"
              onClick={() => go("#contact")}
            >
              Contact
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-9 w-9" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[380px] p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-left">
                      <Logo />
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <div className="flex flex-col px-6 py-4 overflow-y-auto h-full">
                  <nav className="flex flex-col gap-1">
                    {[...NAV_ITEMS, ...SECONDARY_ITEMS].map((item) => (
                      <button
                        key={item.href}
                        onClick={() => go(item.href)}
                        className="group flex items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-accent transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium">{item.label}</div>
                          {(item as any).desc && <div className="text-xs text-muted-foreground mt-0.5">{(item as any).desc}</div>}
                        </div>
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </nav>
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button
                      onClick={() => go("#admin")}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-[var(--fubrio-accent)]" />
                      Admin Dashboard
                    </Button>
                    <Button
                      onClick={() => go("#contact")}
                      className="w-full mt-3 bg-foreground text-background hover:bg-foreground/90 rounded-full"
                    >
                      Contact Fubrio
                    </Button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <button
                      onClick={() => go("#czer")}
                      className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1.5"
                    >
                      Czer
                    </button>
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
