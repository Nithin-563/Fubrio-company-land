"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Bell, Pin, Eye, Loader2, Check, Clock, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  image: string | null;
  pinned: boolean;
  viewsCount: number;
  createdAt: string;
  publishedAt: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("fubrio_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("fubrio_visitor_id", id);
  }
  return id;
}

export function AnnouncementsView() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState<Announcement | null>(null);
  const [openLoading, setOpenLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.ok) setItems(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushSupported(false);
      return;
    }
    setPushSupported(true);
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) setSubscribed(true);
      } catch {}
    })();
  }, []);

  const openAnnouncement = async (item: Announcement) => {
    setOpenItem(item);
    setOpenLoading(true);
    try {
      const visitorId = getVisitorId();
      const res = await fetch(`/api/announcements/${item.id}?visitorId=${encodeURIComponent(visitorId)}`);
      const json = await res.json();
      if (json.ok && json.data) {
        setOpenItem(json.data);
        load();
      }
    } catch {
    } finally {
      setOpenLoading(false);
    }
  };

  const subscribe = async () => {
    if (!pushSupported) {
      toast.error("Your browser doesn't support push notifications. Try Chrome, Firefox, or Edge.");
      return;
    }
    setSubscribing(true);
    try {
      const vapidRes = await fetch("/api/announcements/vapid-public");
      const vapidJson = await vapidRes.json();
      if (!vapidJson.ok || !vapidJson.configured || !vapidJson.publicKey) {
        toast.error("Push notifications are not configured on the server yet. Please try again later.");
        return;
      }
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidJson.publicKey),
      });
      const visitorId = getVisitorId();
      const subJson = sub.toJSON();
      const res = await fetch("/api/announcements/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          visitorId,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSubscribed(true);
        toast.success("Subscribed! You'll be notified when new announcements drop.");
      } else {
        toast.error(json.error ?? "Failed to subscribe");
      }
    } catch (err) {
      if (Notification?.permission === "denied") {
        toast.error("Push notifications are blocked in your browser settings. Please unblock them.");
      } else {
        toast.error(err instanceof Error ? err.message : "Subscription failed");
      }
    } finally {
      setSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch(`/api/announcements/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: "DELETE" });
      }
      setSubscribed(false);
      toast.success("Unsubscribed - you won't receive push notifications anymore.");
    } catch {
      toast.error("Failed to unsubscribe");
    }
  };

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("#home")}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" />
          Announcements
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Latest from Fubrio</h1>
        <p className="mt-2 text-muted-foreground">
          Product launches, releases, news, and important updates. {items.length} announcement{items.length === 1 ? "" : "s"} so far.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-secondary/40 to-background p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30 flex-shrink-0">
            <Bell className="h-4 w-4 text-[var(--fubrio-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">
              {subscribed ? "You're subscribed" : "Get notified instantly"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {pushSupported
                ? subscribed
                  ? "You'll receive a push notification when we publish a new announcement. Manage your subscription anytime."
                  : "Allow browser notifications to get a ping whenever a new announcement goes live."
                : "Your browser doesn't support push notifications, but you can still browse all announcements below."}
            </div>
          </div>
          {pushSupported && (
            <Button
              onClick={subscribed ? unsubscribe : subscribe}
              disabled={subscribing}
              variant={subscribed ? "outline" : "default"}
              className="rounded-full"
            >
              {subscribing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : subscribed ? <Check className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              {subscribed ? "Subscribed" : subscribing ? "Subscribing…" : "Subscribe"}
            </Button>
          )}
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="font-display text-lg font-semibold">No announcements yet</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Subscribe above and you'll get notified the moment we post something.
              </div>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => openAnnouncement(item)}
                className="group w-full text-left rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40 glass-card"
              >
                <div className="flex flex-col sm:flex-row">
                  {item.image && (
                    <div className="sm:w-44 sm:h-32 h-40 flex-shrink-0 relative overflow-hidden">
                      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {item.pinned && (
                        <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
                          <Pin className="h-2.5 w-2.5 mr-1" /> Pinned
                        </Badge>
                      )}
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5" />
                        {item.viewsCount} view{item.viewsCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-semibold group-hover:text-[var(--fubrio-accent)] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    {item.body && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {stripHtml(item.body)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {openItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {openItem.pinned && (
                    <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
                      <Pin className="h-2.5 w-2.5 mr-1" /> Pinned
                    </Badge>
                  )}
                  {openItem.title}
                </DialogTitle>
                <DialogDescription>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(openItem.publishedAt || openItem.createdAt)}
                  </span>
                  {" · "}
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {(openItem as any).viewsCount ?? 0} views
                  </span>
                </DialogDescription>
              </DialogHeader>
              {openLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : (
                <div>
                  {openItem.image && (
                    <img
                      src={openItem.image}
                      alt=""
                      className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4"
                    />
                  )}
                  {openItem.body && (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: openItem.body }}
                    />
                  )}
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
