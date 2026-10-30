"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bug, Lightbulb, X, Send, Loader2, Check, AlertTriangle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const KNOWN_PROJECTS = [
  "Wisee AI 1.0 API",
  "Fubrio Ads API",
  "Fubrio API Keys",
  "Fubrio Announcements Webhook",
  "Bloom Discord Bot",
  "Other (specify below)",
];

export function FloatingBugReportButton() {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 90 });
  const [visible, setVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragData = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean }>({
    startX: 0, startY: 0, origX: 0, origY: 0, moved: false,
  });

  const [type, setType] = useState<"bug" | "suggestion">("bug");
  const [projectName, setProjectName] = useState("");
  const [customProject, setCustomProject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fubrio_bug_bubble_pos");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === "number" && typeof p.y === "number") setPos(p);
      }
    } catch {}
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showDialog) return;
    try {
      const saved = localStorage.getItem("fubrio_bug_draft");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.type) setType(d.type);
        if (d.projectName) setProjectName(d.projectName);
        if (d.customProject) setCustomProject(d.customProject);
        if (d.body) setBody(d.body);
        if (d.email) setEmail(d.email);
      }
    } catch {}
  }, [showDialog]);

  useEffect(() => {
    if (!showDialog) return;
    localStorage.setItem("fubrio_bug_draft", JSON.stringify({ type, projectName, customProject, body, email }));
  }, [type, projectName, customProject, body, email, showDialog]);

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

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragData.current = {
      startX: e.clientX, startY: e.clientY,
      origX: pos.x, origY: pos.y, moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragData.current.startX;
    const dy = e.clientY - dragData.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragData.current.moved = true;
    setPos(clamp(dragData.current.origX + dx, dragData.current.origY + dy));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    try {
      localStorage.setItem("fubrio_bug_bubble_pos", JSON.stringify(pos));
    } catch {}
    if (!dragData.current.moved) {
      setShowDialog(true);
    }
  };

  const submit = async () => {
    const finalProject = projectName === "Other (specify below)"
      ? customProject.trim()
      : projectName.trim();
    if (!finalProject) {
      toast.error("Please pick a project (or specify your own)");
      return;
    }
    if (body.trim().length < 5) {
      toast.error("Please describe the bug/suggestion (min 5 chars)");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email is required so we can follow up");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          projectName: finalProject,
          body: body.trim(),
          email: email.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
          website: "", // honeypot
        }),
      });

      const responseText = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(responseText);
      } catch {
        toast.error(`Server error (HTTP ${res.status}). ${responseText.slice(0, 200)}`);
        return;
      }

      if (json.ok) {
        setDone(true);
        toast.success(type === "bug" ? "Bug report submitted - thank you!" : "Suggestion submitted - thank you!");
        localStorage.removeItem("fubrio_bug_draft");
      } else {
        toast.error(json.error ?? `Submission failed (HTTP ${res.status})`);
      }
    } catch (err) {
      toast.error(`Network error: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setType("bug");
    setProjectName("");
    setCustomProject("");
    setBody("");
    setEmail("");
    setDone(false);
    setShowDialog(false);
  };

  if (!visible) return null;

  const effectiveProject = projectName === "Other (specify below)" ? customProject.trim() : projectName.trim();

  return (
    <>
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
          aria-label="Report a bug or suggest a feature"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative flex h-12 w-12 items-center justify-center rounded-full glass-strong shadow-xl border border-border hover:scale-105 transition-transform cursor-grab active:cursor-grabbing"
          style={{
            boxShadow: "0 0 0 4px var(--fubrio-accent-soft), 0 8px 24px -6px rgba(0,0,0,0.3)",
          }}
        >
          <Bug className="h-4 w-4 text-foreground" />
        </button>
      </div>

      <Dialog open={showDialog} onOpenChange={(o) => { if (!o) setShowDialog(false); }}>
        <DialogContent className="max-w-md">
          {!done ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-[var(--fubrio-accent)]" />
                  Report a bug or suggest a feature
                </DialogTitle>
                <DialogDescription>
                  Help us improve Fubrio. Pick a type, choose the project, and tell us what&apos;s wrong or what you&apos;d love to see.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("bug")}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      type === "bug"
                        ? "border-destructive bg-destructive/10"
                        : "border-border hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bug className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Bug report</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Something is broken or wrong</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      type === "suggestion"
                        ? "border-[var(--fubrio-accent)] bg-[var(--fubrio-accent-soft)]"
                        : "border-border hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-[var(--fubrio-accent)]" />
                      <span className="text-sm font-medium">Suggestion</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">A new feature or improvement</div>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Which product/project? <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">- Pick a project -</option>
                    {KNOWN_PROJECTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {projectName === "Other (specify below)" && (
                    <Input
                      value={customProject}
                      onChange={(e) => setCustomProject(e.target.value)}
                      placeholder="Type the project name"
                      className="bg-background mt-2"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {type === "bug" ? "What's the bug?" : "What's your suggestion?"} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    maxLength={10000}
                    className="bg-background"
                    placeholder={type === "bug"
                      ? "Describe what happened, what you expected, and steps to reproduce…"
                      : "Tell us what feature you'd love to see and why…"
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Your email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-background"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    We&apos;ll only use this to follow up about your report. Never shared.
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button
                  onClick={submit}
                  disabled={submitting || !effectiveProject || body.trim().length < 5 || !email}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
                <Check className="h-7 w-7 text-[var(--fubrio-accent)]" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold">Thank you!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your {type === "bug" ? "bug report" : "suggestion"} for <strong>{effectiveProject}</strong> has been submitted.
                We&apos;ll review it and may reach out at <strong>{email}</strong> if we need more details.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="outline" onClick={() => reset()} className="rounded-full">
                  Submit another
                </Button>
                <Button onClick={() => setShowDialog(false)} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
