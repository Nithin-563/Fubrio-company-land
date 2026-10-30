"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  ArrowLeft, Sparkles, Check, Loader2, Crown, Shield, IndianRupee, MessageCircle,
  Zap, Bell, Megaphone, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { navigate } from "@/lib/router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceInr: number;
  period: string;
  priceType: string;
  aiCreditsPerDay: number;
  adsRequestsPerDay: number;
  features: string[];
  order: number;
}

interface ActiveSub {
  id: string;
  planId: string;
  planName: string;
  priceInr: number;
  period: string;
  status: string;
  expiresAt: string | null;
  startedAt: string | null;
}

function formatPeriod(p: string): string {
  if (p === "monthly") return "/month";
  if (p === "yearly") return "/year";
  if (p === "lifetime") return "once";
  return `/${p}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}

export function SubscriptionsView() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
  const [payingFor, setPayingFor] = useState<Plan | null>(null);
  const [showPriceRequest, setShowPriceRequest] = useState<Plan | null>(null);

  const authProvider = (session?.user as { authProvider?: string })?.authProvider ?? "credentials";
  const isGoogleAuth = authProvider === "google";

  const load = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch("/api/subscriptions/plans"),
        session ? fetch("/api/subscriptions/mine") : Promise.resolve(null),
      ]);
      const plansJson = await plansRes.json();
      if (plansJson.ok) setPlans(plansJson.data);
      if (subRes) {
        const subJson = await subRes.json();
        if (subJson.ok) setActiveSub(subJson.data);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") load();
    else if (status !== "loading") setLoading(false);
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const qIndex = hash.indexOf("?");
    if (qIndex === -1) return;
    const search = hash.slice(qIndex + 1);
    const params = new URLSearchParams(search);
    const status = params.get("status");
    const error = params.get("error");
    if (status === "paid") {
      toast.success("Payment successful! Your subscription is now active.");
      load();
      window.location.hash = "#subscriptions";
    } else if (status === "failed") {
      toast.error("Payment failed. Please try again.");
      window.location.hash = "#subscriptions";
    } else if (status === "pending") {
      toast.info("Payment is pending. We'll activate your subscription once it completes.");
      window.location.hash = "#subscriptions";
    } else if (error) {
      toast.error(`Payment error: ${error}`);
      window.location.hash = "#subscriptions";
    }
  }, []);

  const startPayment = async (plan: Plan) => {
    setPayingFor(plan);
    try {
      const res = await fetch("/api/subscriptions/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const json = await res.json();
      if (json.ok && json.paymentUrl) {
        window.location.href = json.paymentUrl;
      } else {
        toast.error(json.error ?? "Failed to create payment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setPayingFor(null);
    }
  };

  const submitPriceRequest = async (plan: Plan, requestedPrice: number, reason: string) => {
    try {
      const res = await fetch("/api/subscriptions/request-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          requestedPriceInr: requestedPrice,
          reason: reason || null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Price request submitted. We'll discuss it with you in chat.");
        setShowPriceRequest(null);
        if (json.data?.chatId) {
          const email = (session?.user as { email?: string })?.email ?? "";
          navigate(`#chat?c=${json.data.chatId}&e=${encodeURIComponent(email)}&t=${encodeURIComponent(json.data.accessToken || "")}`);
        }
      } else {
        toast.error(json.error ?? "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <Crown className="h-3.5 w-3.5" />
          Subscriptions
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Upgrade your Fubrio plan</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Get higher AI daily limits, more ad impressions, and premium support. All prices in INR. Payment via Instamojo
          (UPI, cards, net banking).
        </p>

        {status !== "loading" && !session && (
          <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-8 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 text-[var(--fubrio-accent)]" />
            <h2 className="font-display text-2xl font-semibold mb-2">Sign in to view plans</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Subscriptions require Google authentication. This prevents abuse and ties purchases to your Google account.
            </p>
            <Button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/#subscriptions` })} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Shield className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>
          </div>
        )}

        {status === "authenticated" && !isGoogleAuth && (
          <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <h2 className="font-display text-xl font-semibold mb-1">Google authentication required</h2>
            <p className="text-sm text-muted-foreground mb-3">
              You&apos;re signed in via <code>{authProvider}</code>. Sign out and sign back in with Google to subscribe.
            </p>
            <Button onClick={() => signIn("google", { callbackUrl: `${window.location.origin}/#subscriptions` })} className="rounded-full">
              Sign in with Google
            </Button>
          </div>
        )}

        {activeSub && (
          <div className="mt-6 rounded-2xl border border-[var(--fubrio-accent)]/40 bg-[var(--fubrio-accent-soft)] p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)]">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Active: {activeSub.planName}</div>
                <div className="text-xs text-muted-foreground">
                  ₹{activeSub.priceInr} {formatPeriod(activeSub.period)} · Expires {formatDate(activeSub.expiresAt)}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => navigate("#api-keys")}
            >
              Manage API keys
            </Button>
          </div>
        )}

        {isGoogleAuth && (
          <>
            {loading ? (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : plans.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="font-display text-lg font-semibold">No subscription plans available yet</div>
                <div className="mt-1 text-sm text-muted-foreground">Check back soon - we&apos;re setting up plans.</div>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((plan) => {
                  const isCurrent = activeSub?.planId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "rounded-2xl border bg-card overflow-hidden flex flex-col",
                        plan.order === 0 ? "border-[var(--fubrio-accent)]/40 shadow-lg" : "border-border",
                      )}
                    >
                      {plan.order === 0 && (
                        <div className="bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] text-center text-xs font-medium py-1.5 uppercase tracking-wider">
                          Most popular
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                          {isCurrent && <Badge variant="outline" className="text-[10px] bg-[var(--fubrio-accent)]/15 text-[var(--fubrio-accent)]">Current</Badge>}
                        </div>
                        {plan.description && (
                          <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                        )}
                        <div className="flex items-baseline gap-1 mb-4">
                          <IndianRupee className="h-4 w-4" />
                          <span className="font-display text-3xl font-bold">{plan.priceInr.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">{formatPeriod(plan.period)}</span>
                        </div>
                        <ul className="space-y-1.5 mb-5 flex-1">
                          <li className="text-xs flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[var(--fubrio-accent)] mt-0.5 flex-shrink-0" />
                            <span><strong>{plan.aiCreditsPerDay}</strong> Wisee AI requests per day</span>
                          </li>
                          <li className="text-xs flex items-start gap-2">
                            <Megaphone className="h-3.5 w-3.5 text-[var(--fubrio-accent)] mt-0.5 flex-shrink-0" />
                            <span><strong>{plan.adsRequestsPerDay}</strong> ad impressions per day</span>
                          </li>
                          <li className="text-xs flex items-start gap-2">
                            <Bell className="h-3.5 w-3.5 text-[var(--fubrio-accent)] mt-0.5 flex-shrink-0" />
                            <span>Unlimited announcement webhooks</span>
                          </li>
                          {plan.features?.map((f, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-[var(--fubrio-accent)] mt-0.5 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-2">
                          <Button
                            disabled={isCurrent || !!payingFor}
                            onClick={() => startPayment(plan)}
                            className={cn(
                              "w-full rounded-full",
                              plan.order === 0
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : "bg-foreground text-background hover:bg-foreground/90",
                            )}
                          >
                            {payingFor?.id === plan.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : isCurrent ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : null}
                            {isCurrent ? "Current plan" : payingFor?.id === plan.id ? "Redirecting…" : "Subscribe now"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-full text-[11px]"
                            onClick={() => setShowPriceRequest(plan)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" /> Request custom price
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!showPriceRequest} onOpenChange={(o) => !o && setShowPriceRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a custom price</DialogTitle>
            <DialogDescription>
              Tell us what you&apos;d like to pay for <strong>{showPriceRequest?.name}</strong> and why.
              We&apos;ll review and open a chat to discuss.
            </DialogDescription>
          </DialogHeader>
          {showPriceRequest && (
            <PriceRequestForm
              plan={showPriceRequest}
              onSubmit={(price, reason) => submitPriceRequest(showPriceRequest, price, reason)}
              onCancel={() => setShowPriceRequest(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PriceRequestForm({ plan, onSubmit, onCancel }: {
  plan: Plan;
  onSubmit: (price: number, reason: string) => void;
  onCancel: () => void;
}) {
  const [price, setPrice] = useState<string>(String(Math.floor(plan.priceInr * 0.8)));
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Original price</Label>
        <div className="text-sm font-mono">₹{plan.priceInr.toLocaleString()} {formatPeriod(plan.period)}</div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Your offer (in ₹)</Label>
        <Input
          type="number"
          min={1}
          max={100000}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-background"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Reason (optional)</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Tell us why you'd like a custom price - student, non-profit, indie dev, etc."
          className="bg-background"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit(Number(price), reason)}
          disabled={!price || Number(price) <= 0}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Submit request
        </Button>
      </DialogFooter>
    </div>
  );
}
