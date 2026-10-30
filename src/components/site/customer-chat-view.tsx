"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft, MessageCircle, Send, Loader2, Mail, Phone, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatInfo {
  id: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  customerContactMethod: string | null;
  subject: string | null;
  status: string;
  sourceType: string;
}

interface Message {
  id: string;
  chatId: string;
  senderType: "customer" | "support";
  senderName: string | null;
  body: string;
  createdAt: string;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
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

export function CustomerChatView() {
  const [chat, setChat] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getParams = useCallback(() => {
    if (typeof window === "undefined") return { chatId: null, email: null, token: null };
    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    if (qIndex === -1) return { chatId: null, email: null, token: null };
    const search = hash.slice(qIndex + 1);
    const params = new URLSearchParams(search);
    return {
      chatId: params.get("c"),
      email: params.get("e"),
      token: params.get("t"),
    };
  }, []);

  const loadMessages = useCallback(async (chatId: string, email: string | null, token: string | null) => {
    try {
      const url = new URL(`/api/customer-chats/${chatId}/messages`, window.location.origin);
      if (email) url.searchParams.set("email", email);
      if (token) url.searchParams.set("token", token);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.ok) setMessages(json.data);
      else if (json.error === "Not your chat") {
        setError("This chat belongs to a different email address. Please use the same email you submitted the request with.");
      }
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      const { chatId, email, token } = getParams();
      if (!chatId) {
        setError("No chat ID provided. Open this page from a buy-request confirmation or your email.");
        setLoading(false);
        return;
      }

      try {
        if (email) {
          const res = await fetch(`/api/customer-chats?id=${encodeURIComponent(chatId)}&email=${encodeURIComponent(email)}&token=${encodeURIComponent(token || "")}`);
          const json = await res.json();
          if (json.ok) {
            const found = json.data.find((c: any) => c.id === chatId);
            if (found) {
              setChat(found);
              await loadMessages(chatId, email, token);
            } else {
              setError("Chat not found for this email. Make sure you're using the email you submitted the request with.");
            }
          }
        } else {
          setError("Email is required to access your chat.");
        }
      } catch {
        setError("Network error loading chat.");
      } finally {
        setLoading(false);
      }
    })();
  }, [getParams, loadMessages]);

  useEffect(() => {
    if (!chat) return;
    const { chatId, email, token } = getParams();
    if (!chatId) return;
    const interval = setInterval(() => {
      loadMessages(chatId, email, token);
    }, 2000);
    return () => clearInterval(interval);
  }, [chat, getParams, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !chat) return;
    setSending(true);
    try {
      const res = await fetch(`/api/customer-chats/${chat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: chat.customerName || chat.customerEmail,
          email: getParams().email,
          token: getParams().token,
          body: draft.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDraft("");
        await loadMessages(chat.id, getParams().email, getParams().token);
      } else {
        toast.error(json.error ?? "Send failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="pt-4 pb-24 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </button>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5" />
            Customer Chat
          </div>
          <h1 className="display-heading mt-2 text-3xl">Chat not available</h1>
          <p className="mt-2 text-muted-foreground">{error ?? "Unknown error."}</p>
          <div className="mt-6">
            <Button onClick={() => navigate("#contact")} variant="outline" className="rounded-full">
              Go to contact form
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <MessageCircle className="h-3.5 w-3.5" />
          Customer Chat
        </div>
        <h1 className="display-heading mt-2 text-3xl">
          {chat.subject || "Chat with Fubrio Support"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3 w-3" /> {chat.customerEmail}
          </span>
          {chat.customerPhone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" /> {chat.customerPhone}
            </span>
          )}
          {chat.customerContactMethod && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" /> {chat.customerContactMethod}
            </span>
          )}
          <span className="badge inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase">
            {chat.status}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-[60vh] min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/20">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-12">
                No messages yet. Send the first message below.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.senderType === "customer" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3 py-2",
                      m.senderType === "customer"
                        ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm",
                    )}
                  >
                    {m.senderType === "support" && (
                      <div className="text-[10px] font-medium text-[var(--fubrio-accent)] mb-0.5">
                        {m.senderName || "Support"}
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                    <div className="text-[9px] opacity-60 mt-1 text-right">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3">
            {chat.status === "CLOSED" ? (
              <div className="text-center text-sm text-muted-foreground py-3">
                This chat has been closed by support.{" "}
                <button onClick={() => navigate("#contact")} className="text-foreground underline hover:no-underline">
                  Open a new inquiry
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Type a message…"
                  className="flex-1 bg-background max-h-32"
                />
                <Button
                  size="icon"
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-[10px] text-muted-foreground text-center">
          This chat is private to <strong>{chat.customerEmail}</strong>. Messages are stored securely.
        </div>
      </div>
    </div>
  );
}
