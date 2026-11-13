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
      const p = saved ? JSON.parse(saved) : null;
      if (p && typeof p.x === "number" && typeof p.y === "number") {
        setPos(clamp(p.x, p.y));
      } else {
        // Sit in the lower-left corner by default, clear of the header and the footer links.
        setPos(clamp(20, window.innerHeight - 88));
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
    const size = 44;
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
        className="relative flex h-11 w-11 cursor-grab items-center justify-center border border-border bg-background transition-transform hover:border-foreground active:cursor-grabbing"
        style={{
          boxShadow: hasNew ? "2px 2px 0 0 var(--fubrio-accent)" : undefined,
        }}
      >
        <Bell className={`h-5 w-5 ${hasNew ? "text-[var(--fubrio-accent)]" : "text-foreground"} ${hasNew ? "animate-swing" : ""}`} />
        {hasNew && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center bg-[var(--fubrio-accent)] font-mono text-[9px] font-bold text-white">
            !
          </span>
        )}
      </button>
      <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-background opacity-0 transition-opacity hover:opacity-100">
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
