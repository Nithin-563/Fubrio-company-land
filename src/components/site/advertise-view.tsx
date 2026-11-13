"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { navigate } from "@/lib/router";
import { Meta, Tag } from "@/components/site/editorial";
import { toast } from "sonner";

const FORMATS = [
  "Newsletter placement",
  "Site banner",
  "Sponsored article",
  "API / product integration",
  "Something else",
];

const BUDGETS = ["Under $500", "$500 – $2,000", "$2,000 – $10,000", "$10,000+", "Not decided"];

export function AdvertiseView({ communityEmail }: { communityEmail?: string }) {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    advertiserWebsite: "",
    budget: "",
    format: FORMATS[0],
    message: "",
    consent: false,
    honeypot: "",
  });
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;
    if (!form.consent) {
      toast.error("Please accept the privacy terms to continue");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          inquiryType: "ADVERTISING",
          budget: form.budget || null,
          message: [
            `Format: ${form.format}`,
            form.advertiserWebsite ? `Website: ${form.advertiserWebsite}` : "",
            "",
            form.message,
          ]
            .filter(Boolean)
            .join("\n"),
          consent: true,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Could not send the form");
        return;
      }
      setReference(json.reference ?? "received");
      toast.success("Enquiry sent");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (reference) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <span className="eyebrow">Enquiry received</span>
        <h1 className="display-heading mt-3 text-[2.25rem] leading-none">Thank you.</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          We read every advertising enquiry ourselves. Expect a reply within two working days from{" "}
          {communityEmail ?? "hello@fubrio.in"}. Your reference is{" "}
          <span className="font-mono text-[12px] text-foreground">{reference}</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("#home")}
            className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Back to site
          </button>
          <button
            onClick={() => {
              setReference(null);
              setForm({ ...form, message: "", company: "", advertiserWebsite: "" });
            }}
            className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[84rem] px-4 pt-10 sm:px-6 lg:px-8">
          <button onClick={() => navigate("#home")} className="link-arrow text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </button>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag>Advertising</Tag>
            <Tag className="text-[var(--fubrio-accent)]">Open for enquiries</Tag>
          </div>

          <h1 className="display-heading mt-5 max-w-3xl text-[2.5rem] leading-[0.98] sm:text-[3.5rem]">
            Put your product in front of people who build.
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-muted-foreground">
            Fubrio reaches developers, server owners and small teams through this site, Bloom and the
            products published here. Tell us what you want to place and we will reply with formats,
            availability and a fixed price.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[84rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="eyebrow">How it works</div>
            <ol className="mt-3 border-t border-border">
              {[
                ["Send the brief", "Company, product, format and budget. Two minutes."],
                ["We reply", "Within two working days, with availability and a fixed price."],
                ["Review and go live", "We check the creative, you approve, we publish."],
              ].map(([title, body], i) => (
                <li key={title} className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-border py-3.5">
                  <Meta>{String(i + 1).padStart(2, "0")}</Meta>
                  <div>
                    <div className="text-[0.9375rem]">{title}</div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
              We decline misleading creative and categories we cannot verify, including unlicensed
              gambling and financial products. No tracking pixels on our pages.
            </p>

            <a href={`mailto:${communityEmail ?? "hello@fubrio.in"}`} className="link-arrow mt-6 text-muted-foreground">
              Prefer email? <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </aside>

          <form onSubmit={submit} className="lg:col-span-8 lg:border-l lg:border-border lg:pl-12">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company">
                <input
                  required
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Acme Inc."
                  className="input-line"
                />
              </Field>
              <Field label="Your name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Full name"
                  className="input-line"
                />
              </Field>
              <Field label="Work email">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@company.com"
                  className="input-line"
                />
              </Field>
              <Field label="Website (optional)">
                <input
                  value={form.advertiserWebsite}
                  onChange={(e) => update("advertiserWebsite", e.target.value)}
                  placeholder="company.com"
                  className="input-line"
                />
              </Field>
              <Field label="Format">
                <select
                  value={form.format}
                  onChange={(e) => update("format", e.target.value)}
                  className="input-line"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label="Budget">
                <select
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="input-line"
                >
                  <option value="">Select a range</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="What are you advertising?">
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Product, audience, timing, and anything you already have in mind."
                  className="input-line"
                />
              </Field>
            </div>

            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={form.honeypot}
              onChange={(e) => update("honeypot", e.target.value)}
              className="hidden"
            />

            <label className="mt-5 flex items-start gap-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[var(--fubrio-accent)]"
              />
              <span>
                I agree that Fubrio may store this enquiry to reply to it, as described in the{" "}
                <button
                  type="button"
                  onClick={() => navigate("#privacy")}
                  className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
                >
                  privacy policy
                </button>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={sending}
              className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Send enquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
