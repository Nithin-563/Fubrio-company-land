"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { navigate } from "@/lib/router";

export function FloatingAnnouncementsButton() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const [hasNew, setHasNew] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragData = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fubrio_announcement_bubble_pos");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === "number" && typeof p.y === "number") setPos(p);
      }
    } catch {}

    const t = setTimeout(() => setVisible(true), 1200);

    (async () => {
      try {
        const res = await fetch("/api/announcements");
        const json = await res.json();
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const latest = json.data[0];
          const latestTs = new Date(latest.publishedAt || latest.createdAt).getTime();
          const lastSeen = Number(localStorage.getItem("fubrio_announcement_last_seen") || "0");
          if (latestTs > lastSeen) setHasNew(true);
        }
      } catch {}
    })();

    return () => clearTimeout(t);
  }, []);

  const clamp = (x: number, y: number) => {
    if (typeof window === "undefined") return { x, y };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = 56;
    return {
      x: Math.max(8, Math.min(w - size - 8, x)),
      y: Math.max(8, Math.min(h - size - 8, y)),
    };
  };

  const onMouseDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragData.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMouseMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragData.current.startX;
    const dy = e.clientY - dragData.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragData.current.moved = true;
    const newX = dragData.current.origX + dx;
    const newY = dragData.current.origY + dy;
    setPos(clamp(newX, newY));
  };

  const onMouseUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    try {
      localStorage.setItem("fubrio_announcement_bubble_pos", JSON.stringify(pos));
    } catch {}
    if (!dragData.current.moved) {
      setHasNew(false);
      try {
        localStorage.setItem("fubrio_announcement_last_seen", String(Date.now()));
      } catch {}
      navigate("#announcements");
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 60,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <button
        aria-label="View announcements"
        onPointerDown={onMouseDown}
        onPointerMove={onMouseMove}
        onPointerUp={onMouseUp}
        className="relative flex h-14 w-14 items-center justify-center rounded-full glass-strong shadow-xl border border-border hover:scale-105 transition-transform cursor-grab active:cursor-grabbing"
        style={{
          boxShadow: hasNew
            ? "0 0 0 4px var(--fubrio-accent-soft), 0 12px 32px -8px var(--fubrio-accent)"
            : undefined,
        }}
      >
        <Bell className={`h-5 w-5 ${hasNew ? "text-[var(--fubrio-accent)]" : "text-foreground"} ${hasNew ? "animate-swing" : ""}`} />
        {hasNew && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--fubrio-accent)] text-white text-[9px] font-bold">
            !
          </span>
        )}
      </button>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Announcements · drag to move
      </div>
      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .animate-swing {
          animation: swing 0.6s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}
