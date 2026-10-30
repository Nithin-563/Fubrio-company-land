"use client";

import { useEffect, useState } from "react";
import { Send, Mail, Trash2, Loader2, Reply, Plus, Inbox, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  status: string;
  replyToId: string | null;
  createdAt: string;
}

const DEFAULT_FROM_ADDRESSES = [
  "hello@fubrio.in",
  "community@fubrio.in",
];

export function EmailAdmin() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sent" | "compose">("sent");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [fromAddresses, setFromAddresses] = useState<string[]>(DEFAULT_FROM_ADDRESSES);

  const [fromAddress, setFromAddress] = useState(DEFAULT_FROM_ADDRESSES[0]);
  const [toAddress, setToAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [emailsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/email/sent"),
        fetch("/api/admin/settings"),
      ]);
      const emailsJson = await emailsRes.json();
      if (emailsJson.ok) setEmails(emailsJson.data);

      const settingsJson = await settingsRes.json();
      if (settingsJson.ok && settingsJson.settings) {
        const s = settingsJson.settings;
        const list: string[] = [];
        const validateEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        if (validateEmail(s["email.hello"])) list.push(s["email.hello"].trim());
        else list.push("hello@fubrio.in");
        if (validateEmail(s["email.community"])) list.push(s["email.community"].trim());
        else list.push("community@fubrio.in");
        const unique = Array.from(new Set(list));
        setFromAddresses(unique);
        setFromAddress(unique[0] ?? "hello@fubrio.in");
      }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const send = async (isReply = false) => {
    if (!toAddress || !subject || !body) {
      toast.error("To, Subject, and Body are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/email/sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          subject,
          body,
          replyToId: isReply ? selectedEmail?.id : null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Email sent");
        setShowCompose(false);
        setToAddress(""); setSubject(""); setBody("");
        await load();
      } else {
        toast.error(json.error ?? "Send failed");
      }
    } catch { toast.error("Network error"); }
    finally { setSending(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/email/sent?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) { toast.success("Deleted"); setDeleteId(null); await load(); }
      else toast.error(json.error ?? "Failed");
    } catch { toast.error("Network error"); }
  };

  const openReply = (email: Email) => {
    setSelectedEmail(email);
    const matchFrom = fromAddresses.find((a) => a === email.toAddress);
    const fromForReply = matchFrom ?? (fromAddresses.includes(email.fromAddress) ? email.fromAddress : fromAddresses[0]);
    setFromAddress(fromForReply);
    setToAddress(fromAddresses.includes(email.fromAddress) || fromAddresses.includes(email.toAddress) ? email.toAddress : email.fromAddress);
    setSubject(`Re: ${email.subject}`);
    setBody(`\n\n---\nOriginal to: ${email.toAddress}\nSubject: ${email.subject}\n\n${email.body.slice(0, 200)}...`);
    setShowCompose(true);
  };

  const openCompose = () => {
    setSelectedEmail(null);
    setFromAddress(fromAddresses[0] ?? "hello@fubrio.in");
    setToAddress(""); setSubject(""); setBody("");
    setShowCompose(true);
  };

  return (
    <div>
      <SectionHeader
        title="Email"
        desc="Send emails from your Fubrio addresses. From-addresses are configured in Settings → Public Email Addresses."
        action={
          <Button onClick={openCompose} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> Compose
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2"><Send className="h-4 w-4 text-[var(--fubrio-accent)]" /><div className="text-xs uppercase tracking-wider text-muted-foreground">Total Sent</div></div>
          <div className="mt-2 font-display text-2xl font-semibold">{emails.length}</div>
        </div>
        <div className="rounded-xl glass-card p-4">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><div className="text-xs uppercase tracking-wider text-muted-foreground">Failed</div></div>
          <div className="mt-2 font-display text-2xl font-semibold">{emails.filter(e => e.status === "FAILED").length}</div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12" /></div>)
          ) : emails.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No emails sent yet. Click "Compose" to send your first email.
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="flex items-start gap-3 p-4 hover:bg-accent/40 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full glass-card flex-shrink-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">{email.subject}</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      email.status === "SENT" ? "bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)] border-[var(--fubrio-accent)]/30" :
                      email.status === "FAILED" ? "bg-destructive/15 text-destructive border-destructive/30" :
                      "bg-muted text-muted-foreground border-border"
                    )}>{email.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From: {email.fromAddress} → To: {email.toAddress}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{email.body.slice(0, 100)}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(email.createdAt).toLocaleString()}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openReply(email)}>
                      <Reply className="h-3.5 w-3.5 mr-2" /> Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(email.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </Card>

      <Dialog open={showCompose} onOpenChange={(o) => !o && setShowCompose(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmail ? "Reply" : "Compose Email"}</DialogTitle>
            <DialogDescription>Send an email from your Fubrio address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Select value={fromAddress} onValueChange={setFromAddress}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fromAddresses.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To *</Label>
                <Input type="email" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="recipient@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject *</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message *</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write your email here..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={() => send(!!selectedEmail)} disabled={sending || !toAddress || !subject || !body} className="bg-foreground text-background hover:bg-foreground/90">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete email?</DialogTitle>
            <DialogDescription>This will permanently remove the email record.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={remove}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
