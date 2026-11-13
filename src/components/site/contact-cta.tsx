"use client";

import { useState } from "react";
import { ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChapterHead, Meta } from "@/components/site/editorial";

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

const FIELD =
  "h-10 rounded-none border-0 border-b border-border bg-transparent px-0 text-[0.9375rem] shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:bg-transparent";

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

  const helloEmail =
    settings?.["email.hello"] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings["email.hello"].trim())
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
        name: "",
        email: "",
        company: "",
        inquiryType: "GENERAL",
        budget: "",
        message: "",
        consent: false,
        website: "",
      });
    } catch {
      toast.error("Network error - please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20" id="contact">
      <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
        <ChapterHead
          index="08"
          label="Contact"
          title="Tell us what you are trying to build."
          description="A paragraph is enough to start. We will reply with questions, a rough range, and whether we are the right people for it."
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <ul className="ruled-list border-t border-border">
              <li className="flex items-baseline justify-between gap-3 py-3.5">
                <Meta>Email</Meta>
                <a
                  href={`mailto:${helloEmail}`}
                  className="text-sm underline-offset-4 hover:underline"
                >
                  {helloEmail}
                </a>
              </li>
              <li className="flex items-baseline justify-between gap-3 py-3.5">
                <Meta>Discord</Meta>
                <a
                  href="https://discord.gg/UmcWh4VdGK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  discord.gg/UmcWh4VdGK
                </a>
              </li>
              <li className="flex items-baseline justify-between gap-3 py-3.5">
                <Meta>LinkedIn</Meta>
                <a
                  href="https://www.linkedin.com/in/nithin-k-b8082a424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  K Nithin
                </a>
              </li>
              <li className="flex items-baseline justify-between gap-3 py-3.5">
                <Meta>Response time</Meta>
                <span className="text-sm text-muted-foreground">1–2 business days</span>
              </li>
            </ul>

            <p className="mt-6 max-w-sm font-display text-[1.35rem] leading-snug text-muted-foreground">
              Not sure what you need? Describe the problem instead of the solution — that is usually
              more useful anyway.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-border bg-card p-5 sm:p-7">
              {success ? (
                <div className="py-8">
                  <span className="flex h-10 w-10 items-center justify-center border border-border">
                    <Check className="h-5 w-5 text-[var(--fubrio-accent)]" />
                  </span>
                  <h3 className="mt-4 font-display text-[1.8rem]">Inquiry received.</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Reference{" "}
                    <span className="font-mono text-[12px] font-medium text-foreground">{reference}</span>.
                    We will be in touch shortly — check your spam folder if a day passes.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => setSuccess(false)} className="btn-line">
                      Send another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Name" required>
                      <Input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                        maxLength={120}
                        className={FIELD}
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email" required>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                        maxLength={200}
                        className={FIELD}
                        placeholder="you@example.com"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Company">
                      <Input
                        value={form.company}
                        onChange={(e) => update("company", e.target.value)}
                        maxLength={200}
                        className={FIELD}
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Enquiry type">
                      <Select value={form.inquiryType} onValueChange={(v) => update("inquiryType", v)}>
                        <SelectTrigger className={FIELD}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {INQUIRY_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Budget">
                    <Select value={form.budget || undefined} onValueChange={(v) => update("budget", v)}>
                      <SelectTrigger className={FIELD}>
                        <SelectValue placeholder="Select a range" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {BUDGETS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="What are you building?" required>
                    <Textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      required
                      minLength={10}
                      maxLength={5000}
                      className="min-h-[120px] rounded-none border-0 border-b border-border bg-transparent px-0 text-[0.9375rem] shadow-none focus-visible:border-foreground focus-visible:ring-0 dark:bg-transparent"
                      placeholder="A few lines about the project, the timeline, and what done looks like."
                    />
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

                  <label className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <Checkbox
                      checked={form.consent}
                      onCheckedChange={(v) => update("consent", v === true)}
                      className="mt-0.5 rounded-none"
                    />
                    <span>I consent to Fubrio storing this information in order to respond.</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button type="submit" disabled={submitting} className="btn-ink disabled:opacity-60">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          Send enquiry
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      No newsletters, no lists
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
