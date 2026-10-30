"use client";

import { useEffect, useState, useRef } from "react";
import {
  MessageCircle, Send, Loader2, Mail, Phone, User, Clock, Inbox,
  ChevronDown, X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  sourceType: string;
  sourceId: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  customerContactMethod: string | null;
  status: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: { body: string; senderType: string; createdAt: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  chatId: string;
  senderType: "customer" | "support";
  senderName: string | null;
  body: string;
  readAt: string | null;
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

export function CustomerChatAdmin() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = async () => {
    try {
      const res = await fetch(`/api/admin/customer-chats?status=${statusFilter}`);
      const json = await res.json();
      if (json.ok) setChats(json.data);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadMessages = async (chatId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/admin/customer-chats/${chatId}/messages`);
      const json = await res.json();
      if (json.ok) setMessages(json.data);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => loadMessages(activeId), 2000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/customer-chats/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        setDraft("");
        await loadMessages(activeId);
        await loadChats();
      } else {
        toast.error(json.error ?? "Send failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (chatId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/customer-chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chatId, status }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(`Chat marked as ${status}`);
        await loadChats();
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const totalUnread = chats.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div>
      <SectionHeader
        title="Customer Chat"
        desc="All chats with customers who submitted a buy/service request or opened a general inquiry. Reply in-thread - the customer sees your messages on their chat page."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <Card className="overflow-hidden flex flex-col">
          <div className="border-b border-border p-3 flex items-center justify-between gap-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {statusFilter === "OPEN" ? "Open chats" : "Closed chats"}
            </div>
            {totalUnread > 0 && (
              <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30">
                {totalUnread} unread
              </Badge>
            )}
          </div>
          <div className="flex gap-1 px-3 py-2 border-b border-border">
            {["OPEN", "CLOSED"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[11px]"
                onClick={() => setStatusFilter(s)}
              >
                {s === "OPEN" ? "Open" : "Closed"}
              </Button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-3"><Skeleton className="h-14" /></div>)
            ) : chats.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No {statusFilter.toLowerCase()} chats.
              </div>
            ) : (
              chats.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full text-left p-3 border-l-2 transition-colors",
                      isActive
                        ? "bg-[var(--fubrio-accent-soft)] border-[var(--fubrio-accent)]"
                        : "border-transparent hover:bg-accent/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {c.customerName || c.customerEmail}
                          </span>
                          {c.unreadCount > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] border-[var(--fubrio-accent)]">
                              {c.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.customerEmail}
                        </div>
                        {c.lastMessage && (
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                            <span className="opacity-60">{c.lastMessage.senderType === "customer" ? "Customer:" : "You:"}</span>{" "}
                            {c.lastMessage.body}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatTime(c.updatedAt)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <div>Pick a chat to view the conversation</div>
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const chat = chats.find((c) => c.id === activeId);
                if (!chat) return null;
                return (
                  <div className="border-b border-border p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {chat.customerName || chat.customerEmail}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{chat.status}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{chat.sourceType}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" /> {chat.customerEmail}
                        </span>
                        {chat.customerPhone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" /> {chat.customerPhone}
                          </span>
                        )}
                        {chat.customerContactMethod && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-2.5 w-2.5" /> {chat.customerContactMethod}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="rounded-full">
                          Status <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(chat.id, "OPEN")}>
                          Mark as open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(chat.id, "CLOSED")}>
                          Mark as closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })()}

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/20">
                {loadingMsgs ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg w-3/4" />)
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    No messages yet. Send the first one below.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn("flex", m.senderType === "support" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3 py-2",
                          m.senderType === "support"
                            ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] rounded-br-sm"
                            : "bg-card border border-border rounded-bl-sm",
                        )}
                      >
                        {m.senderType === "support" && (
                          <div className="text-[10px] font-medium opacity-80 mb-0.5">
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
                    placeholder="Reply to customer…"
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
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
