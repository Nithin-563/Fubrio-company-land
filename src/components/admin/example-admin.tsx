"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Loader2, Send, Copy, Check, Key, AlertTriangle, Clock,
  Code2, RefreshCw, Bot, User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/admin/admin-shell";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  type: string;
  name: string;
  keyPrefix: string;
  keySuffix: string;
  status: string;
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  timing?: number;
  tokens?: number;
}

const PRESET_PROMPTS = [
  "Write a haiku about the ocean.",
  "Explain quantum computing in 3 sentences for a 10-year-old.",
  "Give me 5 creative name ideas for a coffee shop.",
  "What's the difference between TCP and UDP?",
  "Write a Python one-liner to reverse a string.",
];

function CodeBlock({ code }: { code: string }) {
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
      <pre className="text-xs font-mono p-3 overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
}

export function ExampleAdmin() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [manualKey, setManualKey] = useState("");
  const [useManual, setUseManual] = useState(false);

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  const loadKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/api-keys");
      const json = await res.json();
      if (json.ok) {
        const aiKeys = json.data.filter((k: ApiKey) => k.type === "ai" && k.status === "ACTIVE");
        setKeys(aiKeys);
        if (aiKeys.length > 0) setSelectedKeyId(aiKeys[0].id);
      }
    } catch {
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const send = async () => {
    if (!input.trim()) return;
    let apiKey = "";
    if (useManual) {
      apiKey = manualKey.trim();
      if (!apiKey.startsWith("fubrio_ai_")) {
        toast.error("API key must start with fubrio_ai_");
        return;
      }
    } else {
      const k = keys.find((x) => x.id === selectedKeyId);
      if (!k) {
        toast.error("No API key selected. Either pick one above or paste a key manually.");
        return;
      }
      toast.error("Existing API keys can't be reused for testing - their plaintext is one-way hashed. Paste the full key above (you copied it when you created it).");
      return;
    }

    const userMsg: ChatTurn = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const t0 = Date.now();
    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          temperature,
          maxTokens,
        }),
      });
      const json = await res.json();
      const timing = Date.now() - t0;
      if (json.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.response,
            timing,
            tokens: json.usage?.totalTokens,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Error: ${json.error ?? "Failed"}`, timing },
        ]);
        toast.error(json.error ?? "Request failed");
      }
    } catch (err) {
      const timing = Date.now() - t0;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error - check your connection.", timing },
      ]);
      toast.error("Network error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Example"
        desc="Live playground for the Wisee AI 1.0 API. Pick an API key, type a message, and see how the endpoint responds - including timing and token usage."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-[var(--fubrio-accent)]" />
              <div className="text-sm font-semibold">API Key</div>
            </div>

            {loadingKeys ? (
              <Skeleton className="h-9 w-full" />
            ) : keys.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Pick from your AI keys</Label>
                <select
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {keys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.keyPrefix}…{k.keySuffix})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-muted-foreground">
                  Note: existing keys are one-way hashed, so you can&apos;t test them by reference.
                  Toggle &quot;Paste a key manually&quot; below and paste the full plaintext key (the one
                  you copied when you created it).
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No active AI-type API keys found. Sign in on the{" "}
                <a href="#api-keys" className="text-foreground underline hover:no-underline">API Keys page</a>{" "}
                with Google to create one, or paste a key manually below.
              </div>
            )}

            <label className="flex items-center gap-2 mt-3 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => setUseManual(e.target.checked)}
              />
              <span>Paste a key manually</span>
            </label>

            {useManual && (
              <div className="mt-2 space-y-1.5">
                <Input
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  placeholder="fubrio_ai_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-background font-mono text-xs"
                  type="password"
                />
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[var(--fubrio-accent)]" />
              <div className="text-sm font-semibold">Generation params</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs font-medium text-muted-foreground">Temperature</Label>
                  <span className="text-xs font-mono">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Max tokens</Label>
                <Input
                  type="number"
                  min={1}
                  max={8192}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Math.min(8192, Math.max(1, Number(e.target.value))))}
                  className="bg-background"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-[var(--fubrio-accent)]" />
              <div className="text-sm font-semibold">cURL example</div>
            </div>
            <CodeBlock code={`curl -X POST https://fubrio.in/api/v1/ai/chat \\
  -H "Authorization: Bearer fubrio_ai_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": ${temperature},
    "maxTokens": ${maxTokens}
  }'`} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
            <div className="border-b border-border p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/30">
                  <Bot className="h-4 w-4 text-[var(--fubrio-accent)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Wisee AI 1.0</div>
                  <div className="text-[10px] text-muted-foreground">Live playground</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setMessages([])}
                title="Clear conversation"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <Bot className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <div className="font-medium mb-1">Try a preset prompt</div>
                  <div className="text-xs text-muted-foreground mb-4">Or write your own question below.</div>
                  <div className="grid grid-cols-1 gap-1.5 max-w-md mx-auto">
                    {PRESET_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setInput(p)}
                        className="text-xs text-left rounded-lg border border-border bg-background p-2 hover:border-[var(--fubrio-accent)]/40 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2",
                        m.role === "user"
                          ? "bg-[var(--fubrio-accent)] text-[var(--fubrio-accent-foreground)] rounded-br-sm"
                          : "bg-card border border-border rounded-bl-sm",
                      )}
                    >
                      {m.role === "assistant" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="h-3 w-3 text-[var(--fubrio-accent)]" />
                          <span className="text-[10px] font-medium text-muted-foreground">Wisee AI 1.0</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
                      {(m.timing !== undefined || m.tokens !== undefined) && (
                        <div className="text-[9px] opacity-60 mt-1 flex items-center gap-2">
                          {m.timing !== undefined && (
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {m.timing}ms
                            </span>
                          )}
                          {m.tokens !== undefined && (
                            <span>{m.tokens} tokens</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3 py-2 bg-card border border-border rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">Wisee AI 1.0 is typing…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Wisee AI 1.0 anything…"
                  className="flex-1 bg-background max-h-32"
                />
                <Button
                  size="icon"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>
                  Each request calls the real API and counts toward your daily limit on the underlying service.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
