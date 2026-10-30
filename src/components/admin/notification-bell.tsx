"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Loader2, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  sourceId: string | null;
  readAt: string | null;
  createdAt: string;
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch { return iso; }
}

const TYPE_ICON: Record<string, string> = {
  bug_report: "🐛",
  inquiry: "✉️",
  shop_request: "🛒",
  service_request: "🛎️",
  customer_chat: "💬",
  subscription_change: "💰",
  announcement_webhook_failed: "⚠️",
  system: "🔔",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=30");
      const json = await res.json();
      if (json.ok) {
        setNotifications(json.data ?? []);
        setUnreadCount(json.unreadCount ?? 0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const onClickNotification = (n: Notification) => {
    if (!n.readAt) markOneRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full relative h-9 w-9"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={markAllRead}>
                  <Check className="h-3 w-3 mr-1" /> Mark all read
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <div>No notifications yet</div>
                <div className="text-[11px] mt-1">You&apos;ll see new bug reports, inquiries, shop requests, etc. here.</div>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <button
                    key={n.id}
                    onClick={() => onClickNotification(n)}
                    className={cn(
                      "w-full text-left p-3 border-b border-border last:border-0 transition-colors flex items-start gap-2",
                      isUnread ? "bg-[var(--fubrio-accent-soft)]/30 hover:bg-[var(--fubrio-accent-soft)]" : "hover:bg-accent/40",
                    )}
                  >
                    <div className="flex-shrink-0 text-base mt-0.5">
                      {TYPE_ICON[n.type] ?? "🔔"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn("text-xs", isUnread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {n.title}
                        </div>
                        {isUnread && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[var(--fubrio-accent)] mt-1" />
                        )}
                      </div>
                      {n.body && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        {formatRelative(n.createdAt)} {n.link && <ChevronRight className="h-2.5 w-2.5" />}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border p-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-[11px] rounded-full"
                onClick={() => { setOpen(false); navigate("#admin/bugReports"); }}
              >
                View all reports
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
