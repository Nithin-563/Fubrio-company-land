"use client";

import { useEffect, useState } from "react";
import { navigate } from "@/lib/router";

const STORAGE_KEY = "fubrio.cookie-choice.v1";
const COOKIE_NAME = "fubrio_consent";
const OPEN_EVENT = "fubrio:cookie-settings";

interface Choice {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  at: string;
}

function writeChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {}
  const value = `${choice.analytics ? "analytics" : "-"}.${choice.marketing ? "marketing" : "-"}.${choice.at}`;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent("fubrio:consent", { detail: choice }));
}

function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Choice;
    if (typeof parsed?.at !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setChoice(readChoice());
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    const stored = readChoice();
    if (!stored) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener(OPEN_EVENT, show);
      };
    }
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  const decide = (analytics: boolean, marketing: boolean) => {
    const next: Choice = { essential: true, analytics, marketing, at: new Date().toISOString() };
    writeChoice(next);
    setChoice(next);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] sm:left-4 sm:right-auto sm:max-w-md">
      <div className="border border-border bg-background p-4 shadow-[4px_4px_0_0_var(--border)]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[var(--fubrio-accent)]" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Cookies
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          We set two essential cookies: one keeps admin sign-in working, one remembers this choice.
          Analytics and marketing stay off unless you allow them.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => decide(true, false)}
            className="bg-foreground px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-background transition-opacity hover:opacity-90"
          >
            Accept all
          </button>
          <button
            onClick={() => decide(false, false)}
            className="border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Essential only
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("#cookies");
            }}
            className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
          >
            Policy
          </button>
        </div>

        {choice && (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
            Saved {new Date(choice.at).toLocaleDateString("en-GB")} · change it any time in the footer
          </p>
        )}
      </div>
    </div>
  );
}
