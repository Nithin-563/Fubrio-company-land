"use client";

import { useState } from "react";
import {
  ArrowLeft, BookOpen, Code2, Bell, Sparkles, Shield, Key, Copy, Check,
  ChevronRight, Webhook, Zap, AlertTriangle, Megaphone, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "about", label: "About Fubrio", icon: Building2 },
  { id: "intro", label: "Introduction", icon: BookOpen },
  { id: "auth", label: "Authentication", icon: Shield },
  { id: "rate-limits", label: "Rate Limits", icon: Zap },
  { id: "announcements", label: "Announcements API", icon: Bell },
  { id: "ai", label: "Wisee AI 1.0 API", icon: Sparkles },
  { id: "ads", label: "Fubrio Ads API", icon: Megaphone },
  { id: "errors", label: "Error Handling", icon: AlertTriangle },
  { id: "examples", label: "Examples", icon: Code2 },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg bg-secondary border border-border">
      <div className="absolute top-2 right-2">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3 w-3 text-[var(--fubrio-accent)]" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="text-xs font-mono p-3 overflow-x-auto"><code className={lang}>{code}</code></pre>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold mt-8 mb-3 scroll-mt-24">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-semibold mt-5 mb-2 scroll-mt-24">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-muted-foreground leading-relaxed mb-1.5 ml-4 list-disc">{children}</li>;
}

export function DocsView() {
  const [active, setActive] = useState<SectionId>("intro");

  const scrollTo = (id: SectionId) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pt-4 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </button>

        <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </div>
        <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Fubrio API Docs</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Complete reference for Fubrio&apos;s public APIs. Wire announcements into your app, call the Wisee AI 1.0 chat
          endpoint, and more.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pb-2">
                On this page
              </div>
              <nav className="flex flex-col">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      active === s.id
                        ? "bg-[var(--fubrio-accent-soft)] text-foreground border border-[var(--fubrio-accent)]/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent",
                    )}
                  >
                    <s.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1">{s.label}</span>
                    {active === s.id && <ChevronRight className="h-3 w-3" />}
                  </button>
                ))}
              </nav>
              <div className="mt-3 pt-3 border-t border-border">
                <Button onClick={() => navigate("#api-keys")} size="sm" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <Key className="h-3.5 w-3.5 mr-1.5" /> Manage API Keys
                </Button>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <section id="about" className="scroll-mt-24">
              <H2>About Fubrio</H2>
              <P>
                Fubrio is a digital technology and creative ecosystem founded by <strong>K Nithin</strong> and
                headquartered in India. The company builds products, software, AI tools, games, and creative
                experiments - all under one umbrella. The Fubrio platform is deployed at{" "}
                <a href="https://fubrio.in" className="text-foreground underline hover:no-underline">fubrio.in</a>{" "}
                and serves visitors worldwide.
              </P>

              <H3>Founder</H3>
              <P>
                Fubrio was founded by K Nithin, who serves as the company&apos;s founder and CEO. Nithin is a
                hands-on technologist - he is directly involved in product design, engineering, and the
                creative direction of everything Fubrio ships. He can be reached on{" "}
                <a href="https://www.linkedin.com/in/nithin-k-b8082a424" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">LinkedIn</a>{" "}
                and through the Fubrio{" "}
                <a href="https://discord.gg/UmcWh4VdGK" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">Discord community</a>.
              </P>

              <H3>Mission</H3>
              <P>
                Fubrio exists to build useful, beautiful, and accessible digital products. The platform
                brings together a public showcase of projects, a digital shop, an announcements system, an
                AI assistant (Wisee AI 1.0), a developer-grade public API, and a community hub. Everything
                is built in the open - the website itself is the product.
              </P>

              <H3>What Fubrio builds</H3>
              <ul className="space-y-1 mb-4">
                <Li><strong>Software products</strong> - SaaS apps, Discord bots, indie games, and AI tools, available through the Fubrio Shop.</Li>
                <Li><strong>Services</strong> - custom development, AI integrations, and creative technology work for clients.</Li>
                <Li><strong>Public APIs</strong> - Announcements webhooks, Wisee AI 1.0 chat completion, and Fubrio Ads for publishers.</Li>
                <Li><strong>Community</strong> - an active Discord where the team and community discuss products, ideas, and feedback.</Li>
              </ul>

              <H3>Tech stack</H3>
              <P>
                The Fubrio platform is built on Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui components
                for the frontend. The backend uses Next.js API routes with PostgreSQL on Supabase as the
                database. Authentication is handled by NextAuth with Google OAuth + a credentials provider
                for admin access. Files are stored in Supabase Storage. The platform is deployed on Netlify
                at the domain <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">fubrio.in</code>.
              </P>

              <H3>Contact</H3>
              <P>
                General inquiries: <a href="mailto:hello@fubrio.in" className="text-foreground underline hover:no-underline">hello@fubrio.in</a>{" "}
                - for partnerships, sponsorships, and product questions.<br/>
                Community submissions (apps, games, bots for the Shop):{" "}
                <a href="mailto:community@fubrio.in" className="text-foreground underline hover:no-underline">community@fubrio.in</a><br/>
                Buy requests + Ads API support:{" "}
                <a href="mailto:support@fubrio.in" className="text-foreground underline hover:no-underline">support@fubrio.in</a>
              </P>
              <P>
                The fastest way to reach the team is the Fubrio Discord:{" "}
                <a href="https://discord.gg/UmcWh4VdGK" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">discord.gg/UmcWh4VdGK</a>.
              </P>

              <H3>Brand assets</H3>
              <P>
                The Fubrio logo, OG image, and favicon are all available at the site root:
              </P>
              <ul className="space-y-1 mb-4">
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">https://fubrio.in/fubrio-logo.png</code> - full logo (1254×1254 PNG)</Li>
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">https://fubrio.in/og-image.png</code> - social share image (1200×630 PNG)</Li>
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">https://fubrio.in/favicon.ico</code> - favicon</Li>
              </ul>
            </section>

            <section id="intro" className="scroll-mt-24">
              <H2>Introduction</H2>
              <P>
                Fubrio exposes a small but growing set of public APIs. Each API requires an API key that you
                create from the <button onClick={() => navigate("#api-keys")} className="text-foreground underline hover:no-underline">API Keys</button>{" "}
                page. Keys are scoped to a single API type - a key for the Announcements API cannot call the
                Wisee AI 1.0 endpoint, and vice versa.
              </P>
              <P>
                The base URL for all production API calls is <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">https://fubrio.in</code>.
                All endpoints return JSON. Requests and responses use <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">application/json</code>{" "}
                content type unless otherwise noted.
              </P>
              <H3>Available APIs</H3>
              <ul className="space-y-1 mb-4">
                <Li><strong>Announcements</strong> - receive a webhook POST every time Fubrio publishes a new announcement.</Li>
                <Li><strong>Wisee AI 1.0</strong> - chat completion endpoint. Submit a list of messages, get a response back.</Li>
                <Li><strong>Fubrio Ads</strong> - embed ad units on your site. Get paid per impression. Powered by the highest-paying ad provider we&apos;ve integrated.</Li>
              </ul>
              <div className="rounded-xl border border-border bg-secondary/30 p-4 my-4">
                <div className="text-xs text-muted-foreground">
                  More API types are coming in future releases (e.g. cloud storage, payment, search). All
                  future types will use the same API-key mechanism.
                </div>
              </div>
            </section>

            <section id="auth" className="scroll-mt-24">
              <H2>Authentication</H2>
              <P>
                Every API request must include an <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">Authorization</code>{" "}
                header with the API key prefixed by <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">Bearer </code>.
              </P>
              <CodeBlock lang="http" code={`Authorization: Bearer fubrio_announcements_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json`} />
              <P>
                To create an API key, you must be signed in with a Google account. This is the only accepted
                authentication method for API key creation. Sign in on the{" "}
                <button onClick={() => navigate("#api-keys")} className="text-foreground underline hover:no-underline">API Keys</button>{" "}
                page using the &quot;Sign in with Google&quot; button.
              </P>
              <P>
                Keys are formatted as <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">fubrio_&lt;type&gt;_&lt;32 random chars&gt;</code>.
                The plaintext key is shown only once at creation - copy it immediately. After that, only the
                prefix and last 4 characters are visible in the dashboard (e.g.{" "}
                <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">fubrio_ann_xxxxxxxx…wxyz</code>).
              </P>
              <P>
                If you lose a key, revoke it and create a new one. There&apos;s no recovery option - keys
                are stored as one-way bcrypt hashes.
              </P>
            </section>

            <section id="rate-limits" className="scroll-mt-24">
              <H2>Rate Limits</H2>
              <P>
                To prevent abuse, the following rate limits apply:
              </P>
              <ul className="space-y-1 mb-4">
                <Li><strong>API key creation</strong> - max <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">3</code> keys per user per UTC day.</Li>
                <Li><strong>Wisee AI 1.0 calls</strong> - max <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">60</code> calls per key per minute.</Li>
                <Li><strong>Announcement webhook deliveries</strong> - no rate limit (delivered as they happen).</Li>
              </ul>
              <P>
                When you hit a rate limit, the API returns HTTP 429 with a JSON body explaining the limit.
              </P>
            </section>

            <section id="announcements" className="scroll-mt-24">
              <H2>Announcements API</H2>
              <P>
                The Announcements API is a <strong>webhook</strong> - Fubrio POSTs events to your URL
                whenever a new announcement is published. You create an Announcements-type API key with
                your webhook URL, and every time an admin publishes (or re-publishes a draft), we&apos;ll
                send a POST with the announcement payload.
              </P>

              <H3>Webhook payload</H3>
              <P>Fubrio sends the following JSON to your webhook URL:</P>
              <CodeBlock lang="json" code={`{
  "event": "announcement.published",
  "announcement": {
    "id": "uuid-of-the-announcement",
    "title": "Big launch! New product released today",
    "body": "<p>Full HTML body of the announcement…</p>",
    "image": "https://fubrio.in/...",
    "pinned": false,
    "publishedAt": "2025-09-16T12:34:56.789Z",
    "url": "https://fubrio.in/#announcements"
  },
  "deliveredAt": "2025-09-16T12:34:57.123Z"
}`} />

              <H3>Headers</H3>
              <P>Fubrio sends these headers with every webhook request:</P>
              <CodeBlock lang="http" code={`Content-Type: application/json
User-Agent: Fubrio-Webhook/1.0
X-Fubrio-Event: announcement.published
X-Fubrio-Key: fubrio_ann   (first 12 chars of your API key - use this to verify the request is for you)
X-Fubrio-Signature: v1=masked`} />

              <H3>Expected response</H3>
              <P>
                Your webhook endpoint should return any HTTP 2xx status code within 15 seconds. If it
                returns a non-2xx status or times out, Fubrio marks the delivery as failed in the admin
                dashboard but does not retry (future versions may add automatic retries).
              </P>

              <H3>Wiring instructions</H3>
              <P>Below are minimal examples in Node.js, Python, and a generic webhook handler.</P>

              <H3>Node.js (Express)</H3>
              <CodeBlock lang="javascript" code={`import express from "express";

const app = express();
app.use(express.json());

app.post("/api/fubrio-webhook", (req, res) => {
  const keyPrefix = req.headers["x-fubrio-key"];
  if (!keyPrefix?.startsWith("fubrio_ann_")) {
    return res.status(403).json({ error: "Unexpected key prefix" });
  }

  const { event, announcement } = req.body;
  console.log(\`[\${event}] \${announcement.title}\`);


  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log("Listening on :3000"));`} />

              <H3>Python (FastAPI)</H3>
              <CodeBlock lang="python" code={`from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel

app = FastAPI()

@app.post("/api/fubrio-webhook")
async def webhook(request: Request):
    # Verify the request is for you
    key_prefix = request.headers.get("x-fubrio-key", "")
    if not key_prefix.startswith("fubrio_ann_"):
        raise HTTPException(status_code=403, detail="Unexpected key prefix")

    body = await request.json()
    event = body.get("event")
    announcement = body.get("announcement", {})
    print(f"[{event}] {announcement.get('title')}")

    # Do something with the announcement here

    return {"received": True}`} />

              <H3>Generic webhook handler (any language)</H3>
              <P>
                No matter what language you use, your handler needs to:
              </P>
              <ul className="space-y-1 mb-4">
                <Li>Accept POST requests at a publicly reachable HTTPS URL.</Li>
                <Li>Read JSON from the request body.</Li>
                <Li>Check the <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">X-Fubrio-Key</code> header starts with <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">fubrio_ann_</code>.</Li>
                <Li>Return HTTP 200 within 15 seconds.</Li>
              </ul>

              <H3>Testing your webhook locally</H3>
              <P>
                Use a tunneling tool like <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">ngrok</code> to expose
                your local server:
              </P>
              <CodeBlock lang="bash" code={`# 1. Start your local server (e.g. on port 3000)
node server.js

# 2. Tunnel it with ngrok
ngrok http 3000

# 3. Copy the https://xyz.ngrok.app URL that ngrok prints

# 4. Create an API key on https://fubrio.in/#api-keys
#    with the webhook URL set to https://xyz.ngrok.app/api/fubrio-webhook

# 5. Publish an announcement from the admin dashboard
#    Your local server should receive the webhook POST`} />
            </section>

            <section id="ai" className="scroll-mt-24">
              <H2>Wisee AI 1.0 API</H2>
              <P>
                The Wisee AI 1.0 endpoint is a chat completion API. Submit a list of messages, get a response
                back. The model is <strong>Wisee AI 1.0</strong>, built by Fubrio.
              </P>

              <H3>Endpoint</H3>
              <CodeBlock lang="http" code={`POST https://fubrio.in/api/v1/ai/chat
Authorization: Bearer fubrio_ai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json`} />

              <H3>Request body</H3>
              <CodeBlock lang="json" code={`{
  "messages": [
    { "role": "user", "content": "Hello!" },
    { "role": "assistant", "content": "Hi there! How can I help?" },
    { "role": "user", "content": "What's the capital of France?" }
  ],
  "temperature": 0.7,
  "maxTokens": 1024
}`} />
              <ul className="space-y-1 mb-4">
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">messages</code> (required) - array of <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">{`{role, content}`}</code> objects. Roles: <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">user</code>, <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">assistant</code>, <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">system</code>.</Li>
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">temperature</code> (optional, default 0.7) - 0.0 to 1.0. Higher = more creative.</Li>
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">maxTokens</code> (optional, default 1024, max 8192) - maximum tokens to generate.</Li>
              </ul>

              <H3>Response</H3>
              <CodeBlock lang="json" code={`{
  "ok": true,
  "model": "wisee-ai-1.0",
  "response": "The capital of France is Paris.",
  "usage": {
    "promptTokens": 12,
    "completionTokens": 8,
    "totalTokens": 20
  }
}`} />

              <H3>Wiring instructions</H3>

              <H3>Node.js (fetch)</H3>
              <CodeBlock lang="javascript" code={`const API_KEY = process.env.FUBRIO_AI_KEY; // fubrio_ai_xxx

const res = await fetch("https://fubrio.in/api/v1/ai/chat", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Write a haiku about the ocean." },
    ],
    temperature: 0.9,
    maxTokens: 100,
  }),
});

const data = await res.json();
if (!data.ok) throw new Error(data.error);
console.log(data.model);     // "wisee-ai-1.0"
console.log(data.response);  // the generated text
console.log(data.usage);     // token counts`} />

              <H3>Python (requests)</H3>
              <CodeBlock lang="python" code={`import os
import requests

API_KEY = os.environ["FUBRIO_AI_KEY"]  # fubrio_ai_xxx

res = requests.post(
    "https://fubrio.in/api/v1/ai/chat",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "messages": [
            {"role": "user", "content": "Write a haiku about the ocean."},
        ],
        "temperature": 0.9,
        "maxTokens": 100,
    },
    timeout=60,
)

data = res.json()
if not data["ok"]:
    raise RuntimeError(data["error"])

print(data["model"])     # wisee-ai-1.0
print(data["response"])  # the generated text
print(data["usage"])     # token counts`} />

              <H3>cURL</H3>
              <CodeBlock lang="bash" code={`curl -X POST https://fubrio.in/api/v1/ai/chat \\
  -H "Authorization: Bearer $FUBRIO_AI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'`} />

              <H3>System prompt</H3>
              <P>
                You can prepend a <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">system</code> message
                to set context. The model already has a built-in system prompt that identifies it as Wisee AI 1.0
                and refuses to disclose any other model identity.
              </P>
              <CodeBlock lang="json" code={`{
  "messages": [
    {"role": "system", "content": "You are a helpful coding assistant. Always respond in markdown."},
    {"role": "user", "content": "Show me how to read a file in Python."}
  ]
}`} />
            </section>

            <section id="ads" className="scroll-mt-24">
              <H2>Fubrio Ads API</H2>
              <P>
                The Fubrio Ads API lets you embed ad units on your website and earn revenue per impression.
                Fubrio integrates with the highest-paying ad provider available and serves the ad code
                through a single endpoint - you don&apos;t have to deal with the underlying ad network
                directly. Just create an ads-type API key, embed the snippet, and you&apos;re live.
              </P>

              <H3>Endpoint</H3>
              <CodeBlock lang="http" code={`POST https://fubrio.in/api/v1/ads/render
Authorization: Bearer fubrio_ads_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json`} />

              <H3>Request body</H3>
              <CodeBlock lang="json" code={`{
  "format": "banner",
  "referrer": "https://yoursite.com/page"
}`} />
              <ul className="space-y-1 mb-4">
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">format</code> (optional) - one of <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">banner</code> (728×90), <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">square</code> (300×250), <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">sidebar</code> (300×600), or <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">inline</code> (120×240). Default: <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">banner</code>.</Li>
                <Li><code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">referrer</code> (optional) - the URL of the page where the ad will be displayed. Useful for analytics.</Li>
              </ul>

              <H3>Response</H3>
              <CodeBlock lang="json" code={`{
  "ok": true,
  "impressionId": "8f3a4b2c-1d9e-7f6a-5b8c-3d2e1f0a9b8c",
  "html": "<ins class=\\"adsbygoogle\\" ...>...</ins>",
  "format": "banner",
  "width": 728,
  "height": 90
}`} />
              <P>
                The <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">html</code> field contains the ad code (script tags + ad unit). Insert it
                directly into your page where you want the ad to appear. Each render is logged as an
                impression tied to your API key. Clicks are tracked automatically via an embedded
                tracking pixel.
              </P>

              <H3>Wiring instructions</H3>

              <H3>Vanilla HTML + JavaScript</H3>
              <CodeBlock lang="html" code={`<!-- Place this div where you want the ad to appear -->
<div id="fubrio-ad"></div>

<script>
(async () => {
  const API_KEY = "fubrio_ads_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // your ads key
  const res = await fetch("https://fubrio.in/api/v1/ads/render", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: "banner",
      referrer: window.location.href,
    }),
  });
  const data = await res.json();
  if (data.ok) {
    document.getElementById("fubrio-ad").innerHTML = data.html;
  }
})();
</script>`} />

              <H3>React component</H3>
              <CodeBlock lang="javascript" code={`import { useEffect, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_FUBRIO_ADS_KEY; // fubrio_ads_xxx

export function FubrioAd({ format = "banner" }) {
  const ref = useRef(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("https://fubrio.in/api/v1/ads/render", {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${API_KEY}\`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format, referrer: window.location.href }),
      });
      const data = await res.json();
      if (data.ok && ref.current) {
        ref.current.innerHTML = data.html;
        ref.current.querySelectorAll("script").forEach((old) => {
          const s = document.createElement("script");
          if (old.src) s.src = old.src;
          else s.text = old.text;
          old.parentNode.replaceChild(s, old);
        });
      }
    })();
  }, [format]);
  return <div ref={ref} className="fubrio-ad" />;
}`} />

              <H3>cURL</H3>
              <CodeBlock lang="bash" code={`curl -X POST https://fubrio.in/api/v1/ads/render \\
  -H "Authorization: Bearer $FUBRIO_ADS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"format": "banner"}'`} />

              <H3>Revenue + payouts</H3>
              <P>
                Every impression is logged with an estimated payout (based on the configured CPM). The
                Fubrio admin can see total impressions, clicks, CTR, and estimated payout per API key in
                the Admin dashboard → API Keys tab. Actual payout terms are negotiated separately with
                each publisher - contact <a href="mailto:support@fubrio.in" className="text-foreground underline hover:no-underline">support@fubrio.in</a> to discuss.
              </P>
            </section>

            <section id="errors" className="scroll-mt-24">
              <H2>Error Handling</H2>
              <P>All errors return a JSON body of the form:</P>
              <CodeBlock lang="json" code={`{
  "ok": false,
  "error": "Human-readable error message",
  "model": "wisee-ai-1.0"   // present on AI endpoint only
}`} />
              <H3>HTTP status codes</H3>
              <ul className="space-y-1 mb-4">
                <Li><strong>200</strong> - Success.</Li>
                <Li><strong>400</strong> - Bad request (missing fields, invalid JSON).</Li>
                <Li><strong>401</strong> - Missing or invalid API key.</Li>
                <Li><strong>403</strong> - Wrong key type (e.g. AI key used for announcements or vice versa).</Li>
                <Li><strong>429</strong> - Rate limit exceeded.</Li>
                <Li><strong>500</strong> - Internal server error.</Li>
                <Li><strong>502</strong> - Wisee AI 1.0 upstream service unavailable.</Li>
              </ul>
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 my-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> Error messages never reveal the underlying service provider. If the
                    upstream service fails, you&apos;ll see &quot;Wisee AI 1.0 service error&quot; - never a
                    different provider&apos;s name.
                  </div>
                </div>
              </div>
            </section>

            <section id="examples" className="scroll-mt-24">
              <H2>Full Examples</H2>
              <H3>Discord bot - announce new Fubrio announcements</H3>
              <P>
                A Discord bot that listens for Fubrio announcement webhooks and posts them to a Discord channel.
              </P>
              <CodeBlock lang="javascript" code={`import express from "express";
import { Client, GatewayIntentBits, ChannelType } from "discord.js";

const app = express();
app.use(express.json());

const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
await discord.login(process.env.DISCORD_TOKEN);

app.post("/api/fubrio-webhook", async (req, res) => {
  const { announcement } = req.body;
  const channel = await discord.channels.fetch(process.env.DISCORD_CHANNEL_ID!);
  if (channel?.type === ChannelType.GuildText) {
    await channel.send({
      content: \`📢 **\${announcement.title}**\n\n\${announcement.body?.replace(/<[^>]+>/g, "") ?? ""}\`,
    });
  }
  res.status(200).json({ ok: true });
});

app.listen(3000);`} />

              <H3>Chatbot - Wisee AI 1.0 + your context</H3>
              <P>
                A simple CLI chatbot that uses Wisee AI 1.0 with conversation memory.
              </P>
              <CodeBlock lang="javascript" code={`import readline from "readline";

const API_KEY = process.env.FUBRIO_AI_KEY!;
const conversation = [
  { role: "system", content: "You are a helpful assistant for an e-commerce site." },
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function ask(question: string) {
  conversation.push({ role: "user", content: question });
  const res = await fetch("https://fubrio.in/api/v1/ai/chat", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages: conversation, temperature: 0.7 }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
  conversation.push({ role: "assistant", content: data.response });
  console.log(\`Wisee AI: \${data.response}\\n\`);
}

function prompt() {
  rl.question("You: ", async (input) => {
    if (input === "exit") return rl.close();
    await ask(input);
    prompt();
  });
}

prompt();`} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
