"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Package, Wrench, Sparkles, Handshake,
  FileText, Users, Image as ImageIcon, Inbox, Settings as SettingsIcon,
  LogOut, Menu, X, ArrowUpRight, ShieldCheck, FileEdit, Star, HelpCircle,
  Calendar, Server, ListTree, Link2, Mail, Heart, TrendingUp,
  UserCog, Bell, MessageCircle, Key, FlaskConical, Crown, Headset, Bug, Bot, KeyRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/admin/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigate } from "@/lib/router";
import { can, userCanAccessSection } from "@/lib/types";
import type { EmployeePermissions } from "@/lib/types";
import { toast } from "sonner";

export type AdminSection =
  | "overview" | "projects" | "products" | "services"
  | "sponsors" | "partners" | "blog" | "testimonials" | "faqs"
  | "events" | "media" | "inquiries" | "pages" | "users"
  | "categories" | "links" | "team" | "newsletter" | "donation" | "donators"
  | "analytics" | "email" | "shop" | "shopRequests" | "announcements"
  | "employees" | "chat" | "apiKeys" | "example" | "customerChat" | "subscriptions"
  | "bugReports" | "bloomStats" | "settings" | "audit";

const NAV: Array<{ id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; perm?: string; group: string }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Main" },
  { id: "employees", label: "Employees", icon: UserCog, perm: "settings.manage", group: "Main" },
  { id: "projects", label: "Showcase", icon: FolderKanban, perm: "content.manage", group: "Content" },
  { id: "products", label: "Products", icon: Package, perm: "content.manage", group: "Content" },
  { id: "services", label: "Services", icon: Wrench, perm: "content.manage", group: "Content" },
  { id: "blog", label: "Blog", icon: FileText, perm: "content.manage", group: "Content" },
  { id: "testimonials", label: "Testimonials", icon: Star, perm: "content.manage", group: "Content" },
  { id: "faqs", label: "FAQs", icon: HelpCircle, perm: "content.manage", group: "Content" },
  { id: "events", label: "Events", icon: Calendar, perm: "content.manage", group: "Content" },
  { id: "announcements", label: "Announcements", icon: Bell, perm: "content.manage", group: "Content" },
  { id: "sponsors", label: "Sponsors", icon: Sparkles, perm: "content.manage", group: "Network" },
  { id: "partners", label: "Partners", icon: Handshake, perm: "content.manage", group: "Network" },
  { id: "links", label: "Link Manager", icon: Link2, perm: "content.manage", group: "Distribution" },
  { id: "team", label: "Team", icon: Users, perm: "content.manage", group: "Content" },
  { id: "newsletter", label: "Newsletter", icon: Mail, perm: "content.manage", group: "Communication" },
  { id: "donation", label: "Donation", icon: Heart, perm: "settings.manage", group: "System" },
  { id: "donators", label: "Donators", icon: Heart, perm: "content.manage", group: "Communication" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, perm: "content.manage", group: "System" },
  { id: "email", label: "Email", icon: Mail, perm: "content.manage", group: "Communication" },
  { id: "shop", label: "Shop", icon: Package, perm: "content.manage", group: "Content" },
  { id: "shopRequests", label: "Shop Requests", icon: Inbox, perm: "content.manage", group: "Communication" },
  { id: "pages", label: "Pages", icon: FileEdit, perm: "pages.manage", group: "Structure" },
  { id: "categories", label: "Categories", icon: ListTree, perm: "content.manage", group: "Structure" },
  { id: "media", label: "Media Library", icon: ImageIcon, perm: "media.manage", group: "Assets" },
  { id: "inquiries", label: "Inquiries", icon: Inbox, perm: "inquiries.manage", group: "Communication" },
  { id: "users", label: "Users", icon: Users, perm: "users.manage", group: "System" },
  { id: "chat", label: "Chat", icon: MessageCircle, perm: "content.manage", group: "Communication" },
  { id: "apiKeys", label: "API Keys", icon: Key, perm: "settings.manage", group: "System" },
  { id: "example", label: "API Playground", icon: FlaskConical, perm: "content.manage", group: "System" },
  { id: "customerChat", label: "Customer Chat", icon: Headset, perm: "content.manage", group: "Communication" },
  { id: "bugReports", label: "Bug Reports", icon: Bug, perm: "content.manage", group: "Communication" },
  { id: "bloomStats", label: "Bloom Stats", icon: Bot, perm: "content.manage", group: "System" },
  { id: "subscriptions", label: "Subscriptions", icon: Crown, perm: "settings.manage", group: "System" },
  { id: "audit", label: "Audit Logs", icon: Server, group: "System" },
  { id: "settings", label: "Settings", icon: SettingsIcon, perm: "settings.manage", group: "System" },
];

interface Props {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  children: React.ReactNode;
}

export function AdminShell({ active, onChange, children }: Props) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = (session?.user as { role?: string } | undefined)?.role ?? "CONTRIBUTOR";
  const permissions = (session?.user as { permissions?: EmployeePermissions } | undefined)?.permissions;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="eyebrow">Loading</span>
      </div>
    );
  }
  if (!session) return null;

  const visibleNav = NAV.filter((n) => {
    if (n.id === "overview") return true;
    if (n.id === "audit") return role === "SUPER_ADMIN";
    if (role === "EMPLOYEE") {
      return userCanAccessSection(role, permissions, n.id, n.perm ?? "");
    }
    return !n.perm || can(role, n.perm);
  });
  const groups = Array.from(new Set(visibleNav.map((n) => n.group)));
  const isActiveAllowed = visibleNav.some((n) => n.id === active);
  const canCzer = role === "SUPER_ADMIN";
  const activeLabel = NAV.find((n) => n.id === active)?.label ?? "Admin";

  const handleNav = (s: AdminSection) => {
    onChange(s);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden -ml-1 p-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <button onClick={() => navigate("#home")} className="flex items-baseline gap-1.5">
              <span className="font-display text-lg leading-none tracking-tight">Fubrio</span>
              <span className="h-1.5 w-1.5 translate-y-[-2px] bg-[var(--fubrio-accent)]" aria-hidden />
            </button>
            <span className="hidden sm:inline text-muted-foreground/40">/</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">{activeLabel}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-[var(--fubrio-accent)]" />
              {role.replace("_", " ")}
            </span>
            {canCzer && (
              <button
                onClick={() => navigate("#czer")}
                className="hidden sm:inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                title="Czer access"
              >
                <KeyRound className="h-3 w-3" /> Czer
              </button>
            )}
            <button
              onClick={() => navigate("#home")}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              View site <ArrowUpRight className="h-3 w-3" />
            </button>
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-border">
              <div className="flex h-7 w-7 items-center justify-center border border-border text-[11px] font-medium">
                {(session.user?.name ?? session.user?.email ?? "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-medium">{session.user?.name ?? "User"}</div>
                <div className="text-[10px] text-muted-foreground">{session.user?.email}</div>
              </div>
            </div>
            <button
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => signOut({ callbackUrl: "/" }).then(() => toast.success("Signed out"))}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-14 inset-y-0 lg:top-14 lg:translate-x-0 z-30 w-60 shrink-0 border-r border-border bg-background h-[calc(100vh-3.5rem)] overflow-y-auto transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="py-4">
            {groups.map((g) => (
              <div key={g} className="mb-5">
                <div className="px-4 mb-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">{g}</div>
                <div>
                  {visibleNav.filter((n) => n.group === g).map((n) => {
                    const isActive = active === n.id;
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNav(n.id)}
                        className={cn(
                          "group flex w-full items-center gap-2.5 border-l-2 px-4 py-[7px] text-[13px] transition-colors",
                          isActive
                            ? "border-[var(--fubrio-accent)] bg-secondary/50 text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                        )}
                      >
                        <n.icon className={cn("h-3.5 w-3.5 flex-shrink-0", isActive && "text-[var(--fubrio-accent)]")} />
                        <span className="flex-1 text-left">{n.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 z-20 bg-foreground/25 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {isActiveAllowed ? children : (
              <div className="border border-dashed border-border px-6 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have access to this section. Pick another from the sidebar.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => handleNav("overview")}>
                  Go to overview
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function SectionHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 border-b border-border pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] leading-none tracking-tight sm:text-[2rem]">{title}</h1>
          {desc && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
