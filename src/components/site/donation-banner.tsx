"use client";

import { useEffect, useState } from "react";
import { Heart, X, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DonationLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  description: string | null;
}

const ICON_EMOJI: Record<string, string> = {
  coffee: "☕",
  patreon: "🎨",
  github: "🐙",
  paypal: "💳",
  "ko-fi": "☕",
  stripe: "💳",
  venmo: "💸",
  cashapp: "💵",
  bitcoin: "₿",
  custom: "💖",
};

export function DonationBanner() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState({ enabled: false, url: "", text: "" });
  const [links, setLinks] = useState<DonationLink[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingPicker, setLoadingPicker] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.settings) {
          const s = json.settings;
          setConfig({
            enabled: s["donation.enabled"] === "true",
            url: s["donation.url"] || "",
            text: s["donation.text"] || "Support Fubrio",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (config.enabled) {
      const dismissed = sessionStorage.getItem("donation-dismissed");
      if (!dismissed) {
        requestAnimationFrame(() => setShow(true));
      }
    }
  }, [config]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("donation-dismissed", "1");
  };

  const onDonateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingPicker(true);
    try {
      const res = await fetch("/api/donation-links");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setLinks(json.data);
        if (json.data.length > 1) {
          setPickerOpen(true);
          return;
        }
        if (json.data.length === 1) {
          window.open(json.data[0].url, "_blank", "noopener,noreferrer");
          return;
        }
      }

      if (config.url) {
        window.open(config.url, "_blank", "noopener,noreferrer");
      } else {
        toast.info("No donation URL configured yet.");
      }
    } catch {
      if (config.url) {
        window.open(config.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Network error - please try again.");
      }
    } finally {
      setLoadingPicker(false);
    }
  };

  if (!show || !config.enabled) return null;

  return (
    <>
      <div className="relative z-50 border-b border-border bg-[var(--fubrio-accent-soft)]">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-center gap-3 py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/80">
              {config.text || "Support Fubrio"}
            </span>
            <button
              onClick={onDonateClick}
              disabled={loadingPicker}
              className="inline-flex items-center gap-1 border border-foreground/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground transition-colors hover:border-foreground disabled:opacity-70"
            >
              {loadingPicker ? <Loader2 className="h-3 w-3 animate-spin" /> : <Heart className="h-3 w-3" />}
              Donate
            </button>
            <button
              onClick={dismiss}
              className="absolute right-0 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={(o) => !o && setPickerOpen(false)}>
        <DialogContent className="max-w-md rounded-none border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl font-normal">
              <Heart className="h-4 w-4 text-[var(--fubrio-accent)]" />
              Where should it go?
            </DialogTitle>
            <DialogDescription>
              Donations are handled by the platforms below. Pick whichever is easiest for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            {links.map((link) => {
              const emoji = link.icon ? (ICON_EMOJI[link.icon] ?? "💖") : "💖";
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPickerOpen(false)}
                  className="group flex items-center gap-3 border border-border bg-card p-3 transition-colors hover:border-foreground"
                >
                  <div className="flex h-8 w-8 items-center justify-center border border-border text-sm">
                    {emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{link.label}</div>
                    {link.description && (
                      <div className="text-xs text-muted-foreground truncate">{link.description}</div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              );
            })}
          </div>
          <div className="text-[10px] text-muted-foreground text-center">
            You will be redirected to the chosen platform in a new tab.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
