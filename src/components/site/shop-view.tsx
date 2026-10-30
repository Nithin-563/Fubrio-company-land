"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Search, Download, ExternalLink, ShoppingBag,
  Gift, Sparkles, Mail, Phone, Loader2, Check, Send, X, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  category: string;
  creator: string | null;
  downloadUrl: string | null;
  demoUrl: string | null;
  features: string[];
  tags: string[];
  featured: boolean;
}

const CATEGORIES = ["all", "app", "game", "bot", "template", "plugin", "tool", "theme"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CAD: "C$",
  AED: "د.إ", SGD: "S$", CNY: "¥", KRW: "₩", BRL: "R$", ZAR: "R", PKR: "₨",
  BDT: "৳", NGN: "₦",
};

function formatPrice(price: number, currency: string, isFree: boolean): string {
  if (isFree) return "Free";
  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";
  return `${symbol}${Number(price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function buyLabel(category: string): string {
  switch (category) {
    case "game": return "Buy Game";
    case "bot": return "Buy Bot";
    case "template": return "Get Template";
    case "plugin": return "Buy Plugin";
    case "tool": return "Buy Tool";
    case "theme": return "Buy Theme";
    case "app":
    default:
      return "Buy App";
  }
}

function buildSubmissionMailto(communityEmail: string): string {
  const subject = "Shop Submission - App/Game/Bot for Sale on Fubrio";
  const body = [
    "Hi Fubrio team,",
    "",
    "I'd like to submit my product for sale on the Fubrio Shop. Here are the details:",
    "",
    "1) Product name: ____________________",
    "",
    "2) Type of product (app / game / bot / template / plugin / tool / theme / other): ____________________",
    "",
    "3) Short description (1-2 sentences): ____________________",
    "",
    "4) Detailed description / features (what it does, key highlights): ____________________",
    "",
    "5) Selling price (number + currency, e.g. ₹499 or $9.99). Put 'Free' if it's free: ____________________",
    "",
    "6) Creator / publisher name: ____________________",
    "",
    "7) Website / product URL (where users can preview or learn more): ____________________",
    "",
    "8) Download URL (where buyers get the file after purchase - leave blank if Fubrio will host): ____________________",
    "",
    "9) Demo URL (optional, live demo / sandbox): ____________________",
    "",
    "10) Cover image (attach an image - 1600x1000 recommended, PNG/JPG, < 2 MB): ____________________",
    "",
    "11) Key features (comma-separated, e.g. 'Fast, Secure, Easy to use'): ____________________",
    "",
    "12) Tags (comma-separated, e.g. 'productivity, ai, mobile'): ____________________",
    "",
    "13) Your contact email (so we can reach you): ____________________",
    "",
    "14) Anything else we should know? (licensing, support, refunds, future updates, etc.): ____________________",
    "",
    "-",
    "Sent from the Fubrio Shop submit-app form.",
  ].join("\n");
  return `mailto:${communityEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ShopView({ items, settings }: { items: ShopItem[]; settings?: Record<string, string> }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [buyItem, setBuyItem] = useState<ShopItem | null>(null);

  const communityEmail =
    settings?.["email.community"] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings["email.community"].trim())
      ? settings["email.community"].trim()
      : "community@fubrio.in";
  const supportEmail =
    settings?.["email.support"] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings["email.support"].trim())
      ? settings["email.support"].trim()
      : "support@fubrio.in";

  const filtered = useMemo(() => {
    let r = [...items];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((i) => i.title.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q) || (i.creator ?? "").toLowerCase().includes(q));
    }
    if (category !== "all") r = r.filter((i) => i.category === category);
    if (filter === "free") r = r.filter((i) => i.isFree);
    if (filter === "paid") r = r.filter((i) => !i.isFree);
    return r;
  }, [items, search, category, filter]);

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <ShoppingBag className="h-3.5 w-3.5" />
          Shop
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Browse the Fubrio Shop</h1>
        <p className="mt-2 text-muted-foreground">{filtered.length} of {items.length} items available.</p>

        <div className="mt-8 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shop…" className="pl-10 bg-background" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="rounded-full capitalize"
              >
                {c}
              </Button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(["all", "free", "paid"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="rounded-full capitalize">
                {f}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="font-display text-lg font-semibold">No items found</div>
            <div className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div key={item.id} className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-[var(--fubrio-accent)]/40 glass-card flex flex-col">
                <div className="aspect-[16/10] relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {item.featured && (
                      <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-white/20 text-[10px]">Featured</Badge>
                    )}
                    {item.isFree && (
                      <Badge variant="secondary" className="bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] text-[10px]">Free</Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="rounded-full bg-background/95 backdrop-blur px-3 py-1 text-xs font-semibold">
                      {formatPrice(item.price, item.currency || "USD", item.isFree)}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <span className="capitalize">{item.category}</span>
                    {item.creator && <span>· by {item.creator}</span>}
                  </div>
                  <h3 className="font-display font-semibold text-base group-hover:text-[var(--fubrio-accent)] transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  {item.features && item.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 pt-auto">
                    {!item.isFree && (
                      <Button
                        size="sm"
                        className="rounded-full flex-1 bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => setBuyItem(item)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                        {buyLabel(item.category)}
                      </Button>
                    )}
                    {item.downloadUrl && (
                      <Button asChild size="sm" variant={item.isFree ? "default" : "outline"} className={cn("rounded-full", item.isFree && "flex-1 bg-foreground text-background hover:bg-foreground/90")}>
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
                          {item.isFree ? <Download className="h-3.5 w-3.5 mr-1" /> : null}
                          {item.isFree ? "Download" : "Get"}
                        </a>
                      </Button>
                    )}
                    {item.demoUrl && (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SubmitAppCTA communityEmail={communityEmail} supportEmail={supportEmail} />
      </div>

      <BuyDialog
        item={buyItem}
        supportEmail={supportEmail}
        onClose={() => setBuyItem(null)}
      />
    </div>
  );
}

function SubmitAppCTA({ communityEmail, supportEmail }: { communityEmail: string; supportEmail: string }) {
  return (
    <section className="mt-20 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/60 via-background to-background p-8 sm:p-12">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[var(--fubrio-accent)]/10 blur-3xl" aria-hidden />
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Sell on Fubrio
          </div>
          <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
            Built an app, game, or bot? <br />Submit it to the Fubrio Shop.
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-xl">
            We're always looking for high-quality digital products to feature. Whether you've built a SaaS tool,
            a mobile app, an indie game, a Discord bot, a plugin, or a polished template - tell us about it and
            we'll get back to you within 1–2 business days. Click <strong>Submit your app</strong> below and
            your email composer will open with a ready-to-fill template covering everything we need to evaluate
            your submission.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["App", "Game", "Bot", "Template", "Plugin", "Tool", "Theme"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl glass-strong p-6 sm:p-8">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">What to include in your submission</div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              "Product name and type (app / game / bot / template / etc.)",
              "Short and detailed description of what it does",
              "Selling price (with currency, e.g. ₹499 or $9.99) - or 'Free'",
              "Your name / publisher / creator handle",
              "Website, demo, and download URLs",
              "Cover image (PNG/JPG, 1600×1000 recommended)",
              "Key features and tags",
              "Your contact email so we can reach you",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[var(--fubrio-accent)] mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href={buildSubmissionMailto(communityEmail)} className="flex-1">
              <Button className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                <Send className="h-4 w-4 mr-1.5" />
                Submit your app
              </Button>
            </a>
            <a href={`mailto:${supportEmail}`} className="flex-1">
              <Button variant="outline" className="w-full rounded-full">
                Questions? Email us
              </Button>
            </a>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground text-center">
            Submissions go to <a href={`mailto:${communityEmail}`} className="text-foreground hover:underline">{communityEmail}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuyDialog({
  item,
  supportEmail,
  onClose,
}: {
  item: ShopItem | null;
  supportEmail: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatToken, setChatToken] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setEmail(""); setPhone(""); setContactMethod(""); setMessage(""); setChatId(null);
        setSubmitting(false); setDone(false); setReference(null);
        onClose();
      }, 200);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/shop-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopItemId: item.id,
          itemTitle: item.title,
          itemType: item.category,
          email,
          phone: phone || null,
          contactMethod: contactMethod || null,
          message: message || null,
          website: "", // honeypot
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setReference(json.id ? `SR-${json.id.slice(0, 8).toUpperCase()}` : null);
        setChatId(json.chatId ?? null);
        setChatToken(json.accessToken ?? null);
        setDone(true);
        toast.success("Your buy request has been submitted!");
      } else {
        toast.error(json.error ?? "Submission failed");
      }
    } catch {
      toast.error("Network error - please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {!item ? null : done ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
              <Check className="h-7 w-7 text-[var(--fubrio-accent)]" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Request received</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your request to buy <strong className="text-foreground">{item.title}</strong> has been submitted
              to <a href={`mailto:${supportEmail}`} className="text-[var(--fubrio-accent)] hover:underline">{supportEmail}</a>.
              Our team will reach you shortly at <strong className="text-foreground">{email}</strong>
              {phone ? <> or <strong className="text-foreground">{phone}</strong></> : null}.
            </p>
            {reference && (
              <div className="mt-3 text-xs text-muted-foreground">
                Reference: <span className="font-mono font-semibold text-foreground">{reference}</span>
              </div>
            )}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => handleOpenChange(false)}>
                Continue browsing
              </Button>
              {chatId && (
                <Button
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => {
                    handleOpenChange(false);
                    navigate(`#chat?c=${chatId}&e=${encodeURIComponent(email)}&t=${encodeURIComponent(chatToken || "")}`);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  Chat with support
                </Button>
              )}
              <a href={`mailto:${supportEmail}`}>
                <Button variant="outline" className="rounded-full">
                  <Mail className="h-4 w-4 mr-1.5" />
                  Email support
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[var(--fubrio-accent)]" />
                {buyLabel(item.category)} - {item.title}
              </DialogTitle>
              <DialogDescription>
                You're interested in <strong className="text-foreground">{item.title}</strong> by{" "}
                <span className="text-foreground">{item.creator || "Fubrio"}</span> -{" "}
                {formatPrice(item.price, item.currency || "USD", item.isFree)}{" "}
                <span className="text-muted-foreground">({item.currency || "USD"})</span>.
                Share your contact details and our team will reach out to complete the purchase.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <input
                type="text"
                value=""
                onChange={() => {}}
                name="website"
                className="hidden"
                aria-hidden
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email address *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={200}
                  className="bg-background"
                  placeholder="you@example.com"
                />
                <div className="text-[10px] text-muted-foreground">We'll reach you at this address.</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Phone number (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={60}
                    className="bg-background pl-9"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">Optional - only fill in if you'd prefer a call/WhatsApp.</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Other contact method (optional)</Label>
                <Input
                  type="text"
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  maxLength={300}
                  className="bg-background"
                  placeholder="Discord: username  ·  Telegram: @handle  ·  Slack: workspace"
                />
                <div className="text-[10px] text-muted-foreground">
                  Where else can we reach you besides email/phone? Discord, Telegram, Slack, Twitter DM, etc.
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Message (optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="bg-background"
                  placeholder="Questions, use-case, customization needs…"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !email}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit request
                </Button>
              </DialogFooter>
              <div className="text-[10px] text-muted-foreground text-center">
                Your request will be sent to <a href={`mailto:${supportEmail}`} className="hover:underline">{supportEmail}</a>.
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
