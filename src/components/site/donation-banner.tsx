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
      <div className="relative z-50 glass-strong border-b border-[var(--fubrio-accent)]/30 animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 py-2.5 text-sm relative">
            <Heart className="h-4 w-4 text-[var(--fubrio-accent)] flex-shrink-0" />
            <span className="text-muted-foreground">
              {config.text || "Support Fubrio"}
            </span>
            <button
              onClick={onDonateClick}
              disabled={loadingPicker}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] px-3 py-1 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loadingPicker ? <Loader2 className="h-3 w-3 animate-spin" /> : <Heart className="h-3 w-3" />}
              Donate
            </button>
            <button
              onClick={dismiss}
              className="absolute right-4 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={(o) => !o && setPickerOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[var(--fubrio-accent)]" />
              Choose where to donate
            </DialogTitle>
            <DialogDescription>
              Fubrio accepts donations through multiple platforms. Pick the one you prefer - every bit helps.
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
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-[var(--fubrio-accent)]/40 hover:bg-[var(--fubrio-accent-soft)] transition-all group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30 text-base">
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
