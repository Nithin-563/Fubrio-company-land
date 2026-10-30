"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Send, Paperclip, Phone, PhoneOff, Mic, X, Loader2, Plus, Check, CheckCheck,
  Image as ImageIcon, FileText, Audio as AudioIcon, Video, MessageCircle, User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Participant {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  id: string;
  type: string;
  name: string | null;
  participants: Participant[];
  others: Participant[];
  lastMessage: any;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  type: "text" | "image" | "file" | "audio" | "call";
  body: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileMime: string | null;
  callStatus: string | null;
  callDuration: number | null;
  createdAt: string;
  isMine?: boolean;
}

interface Employee {
  id: string;
  email: string;
  name: string;
  status: string;
}

function formatBytes(b: number | null | undefined): string {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function ChatAdmin() {
  const { data: session } = useSession();
  const me = (session?.user as { id?: string })?.id ?? "czer-super-admin";
  const myEmail = (session?.user as { email?: string })?.email ?? "czer@fubrio.in";
  const myName = (session?.user as { name?: string })?.name ?? myEmail;
  const role = (session?.user as { role?: string })?.role ?? "CONTRIBUTOR";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmps, setSelectedEmps] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [activeCall, setActiveCall] = useState<{ conversationId: string; participantName: string } | null>(null);
  const [callStatus, setCallStatus] = useState<string>("");

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const iceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const [inCall, setInCall] = useState(false);

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch("/api/admin/chat/conversations");
      const json = await res.json();
      if (json.ok) {
        setConversations(json.data);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/admin/chat/messages?conversationId=${convId}`);
      const json = await res.json();
      if (json.ok) {
        setMessages(json.data.map((m: any) => ({ ...m, isMine: m.senderId === me })));
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }, [me]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/chat/messages?conversationId=${activeId}&limit=200`);
        const json = await res.json();
        if (!json.ok || !Array.isArray(json.data)) return;
        const incoming: ChatMessage[] = json.data.map((m: any) => ({
          ...m,
          isMine: m.senderId === me,
        }));
        setMessages((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = incoming.filter((m) => !existingIds.has(m.id));
          if (newOnes.length === 0) return prev;
          return [...prev, ...newOnes];
        });
      } catch {}
    };

    poll();
    const intervalMs = inCall ? 1000 : 2000;
    const interval = setInterval(poll, intervalMs);
    return () => clearInterval(interval);
  }, [activeId, me, inCall]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendText = async () => {
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          type: "text",
          body: draft.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDraft("");
      } else {
        toast.error(json.error ?? "Send failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file: File, type: "image" | "file" | "audio") => {
    if (!activeId) return;
    setUploadingFile(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/chat/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error ?? "Upload failed");
        return;
      }
      const msgRes = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          type,
          fileUrl: json.fileUrl,
          fileName: json.fileName,
          fileSize: json.fileSize,
          fileMime: json.fileMime,
        }),
      });
      const msgJson = await msgRes.json();
      if (!msgJson.ok) toast.error(msgJson.error ?? "Send failed");
    } catch {
      toast.error("Network error");
    } finally {
      setUploadingFile(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        await uploadFile(file, "audio");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = (send: boolean) => {
    if (!mediaRecorderRef.current) return;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecording(false);
    if (send) {
      mediaRecorderRef.current.stop();
    } else {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
  };

  const startCall = async () => {
    if (!activeId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          await sendCallSignal({ kind: "ice", candidate: e.candidate.toJSON() });
        }
      };

      pc.ontrack = (e) => {
        if (remoteAudioRef.current && e.streams[0]) {
          remoteAudioRef.current.srcObject = e.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      await sendCallMessage("initiated");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendCallSignal({ kind: "offer", sdp: pc.localDescription!.toJSON() });

      setInCall(true);
      setActiveCall({
        conversationId: activeId,
        participantName: conversations.find((c) => c.id === activeId)?.others[0]?.name ?? "Employee",
      });
      setCallStatus("Calling…");
    } catch (err) {
      toast.error("Microphone access denied - can't start a voice call");
      endCall();
    }
  };

  const endCall = async (status: "ended" | "declined" = "ended") => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setInCall(false);
    setActiveCall(null);
    setCallStatus("");
    await sendCallMessage(status);
  };

  const sendCallMessage = async (status: string, duration?: number) => {
    if (!activeId) return;
    try {
      await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          type: "call",
          callStatus: status,
          callDuration: duration,
        }),
      });
    } catch {}
  };

  const sendCallSignal = async (signal: any) => {
    if (!activeId) return;
    try {
      await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          type: "call",
          body: JSON.stringify(signal),
        }),
      });
    } catch {}
  };

  useEffect(() => {
    if (!inCall || !activeId) return;
    const lastCallMsgs = messages.filter((m) => m.type === "call" && m.body && !m.isMine);
    if (lastCallMsgs.length === 0) return;
    const latest = lastCallMsgs[lastCallMsgs.length - 1];
    try {
      const sig = JSON.parse(latest.body!);
      const pc = peerRef.current;
      if (!pc) return;
      if (sig.kind === "offer" && pc.signalingState === "stable") {
        pc.setRemoteDescription(new RTCSessionDescription(sig.sdp)).then(async () => {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendCallSignal({ kind: "answer", sdp: pc.localDescription!.toJSON() });
          setCallStatus("Connected");
        });
      } else if (sig.kind === "answer" && pc.signalingState === "have-local-offer") {
        pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
        setCallStatus("Connected");
      } else if (sig.kind === "ice") {
        pc.addIceCandidate(new RTCIceCandidate(sig.candidate)).catch(() => {});
      }
    } catch {}
  }, [messages, inCall, activeId]);

  const openNewChat = async () => {
    setShowNewChat(true);
    try {
      const res = await fetch("/api/admin/employees");
      const json = await res.json();
      if (json.ok) {
        setEmployees(json.data.filter((e: any) => e.status === "ACTIVE"));
      }
    } catch {}
  };

  const createConversation = async () => {
    if (selectedEmps.length === 0) return;
    try {
      const res = await fetch("/api/admin/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantIds: selectedEmps,
          type: selectedEmps.length > 1 ? "group" : "direct",
          name: selectedEmps.length > 1 ? "Team chat" : null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Conversation created");
        setShowNewChat(false);
        setSelectedEmps([]);
        await loadConversations();
        if (json.data?.id) setActiveId(json.data.id);
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div>
      <SectionHeader
        title="Chat"
        desc="WhatsApp-style chat with your team. Text, files, images, voice messages, and live voice calls - all real."
        action={
          <Button onClick={openNewChat} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> New chat
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <Card className="overflow-hidden flex flex-col">
          <div className="border-b border-border p-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-3"><Skeleton className="h-12" /></div>)
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No conversations yet.
                <br />
                Click <strong>New chat</strong> to start one with an employee.
              </div>
            ) : (
              conversations.map((c) => {
                const last = c.lastMessage;
                const isActive = c.id === activeId;
                const title = c.type === "group" ? (c.name ?? "Group chat") : (c.others[0]?.name ?? c.others[0]?.email ?? "Unknown");
                const avatar = c.others[0]?.avatar;
                const initials = (title || "?").slice(0, 1).toUpperCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full text-left p-3 flex items-center gap-3 transition-colors border-l-2",
                      isActive
                        ? "bg-[var(--fubrio-accent-soft)] border-[var(--fubrio-accent)]"
                        : "border-transparent hover:bg-accent/40",
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-semibold flex-shrink-0 overflow-hidden">
                      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{title}</span>
                        {last && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(last.createdAt)}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {last
                          ? last.type === "text"
                            ? last.body
                            : last.type === "image"
                              ? "📷 Image"
                              : last.type === "file"
                                ? `📎 ${last.fileName ?? "File"}`
                                : last.type === "audio"
                                  ? "🎤 Voice message"
                                  : last.type === "call"
                                    ? `📞 ${last.callStatus ?? "Call"}`
                                    : "Message"
                          : "No messages yet"}
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
                <div>Pick a conversation to start chatting</div>
                <div className="text-[11px] mt-1">Or click <strong>New chat</strong> above</div>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-border p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {(() => {
                      const conv = conversations.find((c) => c.id === activeId);
                      if (!conv) return "?";
                      const title = conv.type === "group" ? (conv.name ?? "Group") : (conv.others[0]?.name ?? "?");
                      const avatar = conv.others[0]?.avatar;
                      if (avatar) return <img src={avatar} alt="" className="h-full w-full object-cover" />;
                      return title.slice(0, 1).toUpperCase();
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {(() => {
                        const conv = conversations.find((c) => c.id === activeId);
                        if (!conv) return "Conversation";
                        return conv.type === "group" ? (conv.name ?? "Group chat") : (conv.others[0]?.name ?? conv.others[0]?.email ?? "Unknown");
                      })()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {(() => {
                        const conv = conversations.find((c) => c.id === activeId);
                        return conv ? `${conv.participants.length} participant${conv.participants.length === 1 ? "" : "s"}` : "";
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={inCall ? () => endCall("ended") : startCall}
                    title={inCall ? "End call" : "Voice call"}
                  >
                    {inCall ? <PhoneOff className="h-4 w-4 text-destructive" /> : <Phone className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/20">
                {loadingMsgs ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg w-3/4" />)
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    No messages yet. Send the first one below.
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble key={m.id} m={m} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border p-3">
                {inCall && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fubrio-accent)] text-white">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{activeCall?.participantName ?? "Voice call"}</div>
                        <div className="text-[11px] text-muted-foreground">{callStatus || "Connecting…"}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" className="rounded-full" onClick={() => endCall("ended")}>
                      <PhoneOff className="h-3.5 w-3.5 mr-1.5" /> End
                    </Button>
                  </div>
                )}
                {recording ? (
                  <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                      <span className="text-sm font-mono">
                        {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Recording voice message…</span>
                    <div className="flex-1" />
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => stopRecording(false)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="rounded-full bg-foreground text-background" onClick={() => stopRecording(true)}>
                      <Send className="h-3.5 w-3.5 mr-1" /> Send
                    </Button>
                  </div>
                ) : uploadingFile ? (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading…</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const isImage = f.type.startsWith("image/");
                          uploadFile(f, isImage ? "image" : "file");
                        }
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={startRecording}
                      title="Record voice message"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendText();
                        }
                      }}
                      rows={1}
                      placeholder="Type a message…"
                      className="flex-1 bg-background max-h-32"
                    />
                    <Button
                      size="icon"
                      onClick={sendText}
                      disabled={sending || !draft.trim()}
                      className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <Dialog open={showNewChat} onOpenChange={(o) => !o && setShowNewChat(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>Pick one or more employees to start a chat with.</DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-80 overflow-y-auto space-y-1.5">
            {employees.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-6">
                No active employees yet. Create one in the Employees tab first.
              </div>
            ) : (
              employees.map((e) => {
                const selected = selectedEmps.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => {
                      setSelectedEmps((prev) =>
                        prev.includes(e.id) ? prev.filter((x) => x !== e.id) : [...prev, e.id],
                      );
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3",
                      selected
                        ? "border-[var(--fubrio-accent)] bg-[var(--fubrio-accent-soft)]"
                        : "border-border hover:bg-accent/40",
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-semibold flex-shrink-0">
                      {(e.name || e.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{e.name || e.email}</div>
                      <div className="text-xs text-muted-foreground truncate">{e.email}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {selected && <Check className="h-4 w-4 text-[var(--fubrio-accent)]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChat(false)}>Cancel</Button>
            <Button
              onClick={createConversation}
              disabled={selectedEmps.length === 0}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Start chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  return (
    <div className={cn("flex", m.isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2",
          m.isMine
            ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] rounded-br-sm"
            : "bg-card border border-border rounded-bl-sm",
        )}
      >
        {m.type === "text" && (
          <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
        )}
        {m.type === "image" && m.fileUrl && (
          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
            <img src={m.fileUrl} alt={m.fileName ?? "image"} className="rounded-lg max-w-full max-h-64" />
          </a>
        )}
        {m.type === "file" && m.fileUrl && (
          <a
            href={m.fileUrl}
            download={m.fileName ?? undefined}
            className="flex items-center gap-2 hover:underline"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{m.fileName ?? "File"}</div>
              <div className="text-[10px] opacity-70">{formatBytes(m.fileSize)}</div>
            </div>
          </a>
        )}
        {m.type === "audio" && m.fileUrl && (
          <audio controls src={m.fileUrl} className="w-full max-w-xs" />
        )}
        {m.type === "call" && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className={cn("h-3.5 w-3.5", m.callStatus === "ended" && "opacity-50")} />
            <span>
              {m.callStatus === "initiated" ? "📞 Call started" : ""}
              {m.callStatus === "accepted" ? "✓ Call accepted" : ""}
              {m.callStatus === "declined" ? "✗ Call declined" : ""}
              {m.callStatus === "ended" ? `Call ended${m.callDuration ? ` · ${Math.floor(m.callDuration / 60)}m ${m.callDuration % 60}s` : ""}` : ""}
            </span>
          </div>
        )}
        <div className="text-[9px] opacity-60 mt-1 text-right flex items-center gap-1 justify-end">
          {formatTime(m.createdAt)}
          {m.isMine && <CheckCheck className="h-2.5 w-2.5" />}
        </div>
      </div>
    </div>
  );
}
