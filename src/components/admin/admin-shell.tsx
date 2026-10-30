"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Package, Wrench, Sparkles, Handshake,
  FileText, Users, Image as ImageIcon, Inbox, Settings as SettingsIcon,
  LogOut, Menu, X, ChevronRight, ShieldCheck, FileEdit, Star, HelpCircle,
  Calendar, Server, ListTree, PanelLeftClose, PanelLeft, Link2, Mail, Heart, TrendingUp,
  UserCog, Bell, MessageCircle, Key, FlaskConical, Crown, Headset, Bug, Bot,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/admin/notification-bell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  { id: "employees", label: "Employees", icon: UserCog, perm: "settings.manage", group: "System" },
  { id: "chat", label: "Chat", icon: MessageCircle, perm: "content.manage", group: "Communication" },
  { id: "apiKeys", label: "API Keys", icon: Key, perm: "settings.manage", group: "System" },
  { id: "example", label: "Example", icon: FlaskConical, perm: "content.manage", group: "System" },
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
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
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

  const handleNav = (s: AdminSection) => {
    onChange(s);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <button onClick={() => navigate("#home")} className="hidden sm:block">
              <Logo size="sm" />
            </button>
            <Badge variant="outline" className="hidden sm:inline-flex">
              <ShieldCheck className="h-3 w-3 mr-1 text-[var(--fubrio-accent)]" />
              {role}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("#home")} className="rounded-full hidden sm:inline-flex">
              View site
            </Button>
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-semibold">
                {(session.user?.name ?? session.user?.email ?? "A").slice(0, 1).toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="font-medium leading-none">{session.user?.name ?? "User"}</div>
                <div className="text-muted-foreground mt-0.5">{session.user?.email}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => signOut({ callbackUrl: "/" }).then(() => toast.success("Signed out"))}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-14 inset-y-0 lg:top-14 lg:translate-x-0 z-30 w-64 shrink-0 border-r border-border bg-background h-[calc(100vh-3.5rem)] overflow-y-auto transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="p-3 space-y-4">
            {groups.map((g) => (
              <div key={g}>
                <div className="px-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{g}</div>
                {visibleNav.filter((n) => n.group === g).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNav(n.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active === n.id
                        ? "bg-[var(--fubrio-accent-soft)] text-foreground border border-[var(--fubrio-accent)]/30"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent",
                    )}
                  >
                    <n.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{n.label}</span>
                    {active === n.id && <ChevronRight className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-3 mt-auto">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose className="h-3.5 w-3.5 mr-1.5" />
              Collapse
            </Button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 top-14 z-20 bg-background/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {isActiveAllowed ? children : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <div className="text-sm text-muted-foreground">
                  You don&apos;t have access to this section. Pick another from the sidebar.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full"
                  onClick={() => handleNav("overview")}
                >
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
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {action}
    </div>
  );
}
