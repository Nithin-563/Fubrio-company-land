"use client";

import { useState } from "react";
import { ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { navigate } from "@/lib/router";

const INQUIRY_TYPES = [
  { value: "GENERAL", label: "General inquiry" },
  { value: "PROJECT", label: "Project request" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "SPONSORSHIP", label: "Sponsorship" },
  { value: "SUPPORT", label: "Product support" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "CAREERS", label: "Careers" },
  { value: "OTHER", label: "Other" },
];

const BUDGETS = ["< $5K", "$5K - $10K", "$10K - $25K", "$25K - $50K", "$50K - $100K", "$100K+", "Not sure yet"];

export function ContactCTA({ settings }: { settings?: Record<string, string> }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "GENERAL",
    budget: "",
    message: "",
    consent: false,
    website: "", // honeypot
  });

  const helloEmail = settings?.["email.hello"] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings["email.hello"].trim())
    ? settings["email.hello"].trim()
    : "hello@fubrio.in";

  const update = (k: string, v: unknown) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot triggered
    if (!form.consent) {
      toast.error("Please accept the consent checkbox");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) {
        const errs = json.errors;
        if (errs) {
          const first = Object.values(errs)[0]?.[0] ?? "Validation failed";
          toast.error(String(first));
        } else {
          toast.error(json.error ?? "Submission failed");
        }
        return;
      }
      setReference(json.reference);
      setSuccess(true);
      toast.success("Inquiry submitted!");
      setForm({
        name: "", email: "", company: "", inquiryType: "GENERAL",
        budget: "", message: "", consent: false, website: "",
      });
    } catch {
      toast.error("Network error - please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-secondary/30 border-t border-border/60" id="contact">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">
              Contact
            </div>
            <h2 className="display-heading mt-3 text-4xl sm:text-5xl">
              Have a project in mind?
              <br />
              Let&apos;s build something remarkable.
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl">
              Whether it&apos;s a SaaS platform, an AI integration, a Discord bot, a mobile app, or something
              completely new - tell us about it. We typically reply within 1–2 business days.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ContactInfo label="Email" value={helloEmail} href={`mailto:${helloEmail}`} />
              <ContactInfo label="Discord" value="discord.gg/UmcWh4VdGK" href="https://discord.gg/UmcWh4VdGK" />
              <ContactInfo label="LinkedIn" value="in/nithin-k-b8082a424" href="https://www.linkedin.com/in/nithin-k-b8082a424" />
            </div>

            <div className="mt-8 p-4 rounded-2xl border border-dashed border-border bg-background">
              <div className="text-xs text-muted-foreground">
                We typically reply within 1–2 business days.
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl glass-strong p-6 sm:p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
                  <Check className="h-7 w-7 text-[var(--fubrio-accent)]" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold">Inquiry received</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your reference number is <span className="font-mono font-semibold text-foreground">{reference}</span>.
                  We&apos;ll be in touch shortly.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="outline" onClick={() => setSuccess(false)} className="rounded-full">
                    Submit another
                  </Button>
                  <Button onClick={() => navigate("#showcase")} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                    Explore showcase
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Name *">
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} required maxLength={120} className="bg-background" placeholder="Your full name" />
                  </Field>
                  <Field label="Email *">
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required maxLength={200} className="bg-background" placeholder="you@example.com" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Company">
                    <Input value={form.company} onChange={(e) => update("company", e.target.value)} maxLength={200} className="bg-background" placeholder="Optional" />
                  </Field>
                  <Field label="Inquiry type">
                    <Select value={form.inquiryType} onValueChange={(v) => update("inquiryType", v)}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INQUIRY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Budget">
                  <Select value={form.budget || undefined} onValueChange={(v) => update("budget", v)}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select a range" /></SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Message *">
                  <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} required minLength={10} maxLength={5000} className="bg-background min-h-[140px]" placeholder="Tell us about your project, timeline, and goals…" />
                </Field>

                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="hidden"
                  aria-hidden
                  tabIndex={-1}
                  autoComplete="off"
                />

                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={form.consent} onCheckedChange={(v) => update("consent", v === true)} className="mt-0.5" />
                  <span>I consent to Fubrio storing my information to respond to this inquiry. </span>
                </label>

                <Button type="submit" disabled={submitting} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 group">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Send inquiry
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
                <div className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ContactInfo({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium truncate">{value}</div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block rounded-xl glass-input p-4 hover:border-[var(--fubrio-accent)]/40 transition-colors"
      >
        {inner}
      </a>
    );
  }
  return <div className="rounded-xl glass-input p-4">{inner}</div>;
}
