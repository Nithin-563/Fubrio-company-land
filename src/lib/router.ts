"use client";

import { useEffect, useState } from "react";

type RouteListener = (route: string) => void;
const listeners = new Set<RouteListener>();

function parseHash(): string {
  if (typeof window === "undefined") return "#home";
  const h = window.location.hash || "#home";
  return h;
}

export function getRouteFromHash(): string {
  if (typeof window === "undefined") return "#home";
  return parseHash();
}

export function navigate(hash: string) {
  if (typeof window === "undefined") return;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    listeners.forEach((l) => l(hash));
  }
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(
    typeof window !== "undefined" ? parseHash() : "#home",
  );
  useEffect(() => {
    const onChange = () => {
      const h = parseHash();
      setRoute(h);
      listeners.forEach((l) => l(h));
      if (h.startsWith("#home/")) return; // sub-routes handle their own scroll
      const el = document.getElementById(h.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) window.location.hash = "#home";
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
