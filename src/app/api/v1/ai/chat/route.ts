import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, logApiKeyEvent } from "@/lib/api-keys";
import { checkRateLimitAi, getAiDailyLimitForUser } from "@/lib/rate-limit";
import {
  isAiKeyConfigured,
  openAiChatEndpoint,
  readAiSettings,
  resolveAiConfig,
  type AiConfig,
} from "@/lib/ai-config";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  system?: string;
}

function serviceError(status: number, message: string, model = "") {
  return NextResponse.json({ ok: false, error: message, model }, { status });
}

function upstreamMessage(status: number): string {
  if (status === 401 || status === 403) return "Upstream provider rejected the credentials. Check the server key.";
  if (status === 404) return "Upstream provider could not find that model or endpoint. Check the model and base URL.";
  if (status === 429) return "Upstream provider rate limit reached. Retry shortly.";
  if (status >= 500) return "Upstream provider is unavailable. Retry shortly.";
  return "Upstream provider error.";
}

export async function POST(req: NextRequest) {
  let apiKeyRow: { id?: string; type?: string; userEmail?: string } | null = null;
  try {
    const auth = req.headers.get("authorization") || "";
    const rawKey = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;
    if (!rawKey) return serviceError(401, "Missing API key. Set Authorization: Bearer fubrio_xxx");

    apiKeyRow = await verifyApiKey(rawKey);
    if (!apiKeyRow) return serviceError(401, "Invalid or revoked API key");

    if (apiKeyRow.type !== "ai") {
      return serviceError(403, "This API key is not authorized for AI. Create an AI-type key.");
    }

    const { limit: aiDailyLimit } = await getAiDailyLimitForUser(apiKeyRow.userEmail as string);
    const rl = await checkRateLimitAi(apiKeyRow.id as string, aiDailyLimit);
    if (!rl.ok) {
      const isDaily = rl.bucket === "day";
      const retryAfter = rl.retryAfterSeconds ?? 60;
      return NextResponse.json(
        {
          ok: false,
          error: isDaily
            ? `Daily limit reached (${rl.limit} requests per day for the ${aiDailyLimit > 25 ? "Pro" : "Free"} tier). Try again in ${Math.ceil(retryAfter / 60)} minutes or upgrade your plan.`
            : `Rate limit reached (${rl.limit} requests per minute). Try again in ${retryAfter} seconds.`,
          rateLimit: {
            limit: rl.limit,
            used: rl.used,
            remaining: rl.remaining,
            bucket: rl.bucket,
            retryAfterSeconds: retryAfter,
          },
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return serviceError(400, "Invalid JSON body");
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return serviceError(400, "messages[] is required and must be non-empty");
    }
    if (body.messages.length > 100) return serviceError(400, "Too many messages (max 100)");
    for (const m of body.messages) {
      if (!m || typeof m.role !== "string" || typeof m.content !== "string") {
        return serviceError(400, "Each message must have { role, content }");
      }
      if (!["user", "assistant", "system"].includes(m.role)) {
        return serviceError(400, "message.role must be user | assistant | system");
      }
      if (m.content.length > 32000) {
        return serviceError(400, "Message content too long (max 32k chars per message)");
      }
    }

    const temperature =
      typeof body.temperature === "number" ? Math.max(0, Math.min(2, body.temperature)) : 0.7;
    const maxTokens =
      typeof body.maxTokens === "number" ? Math.min(8192, Math.max(1, body.maxTokens)) : 1024;
    const modelOverride =
      typeof body.model === "string" && body.model.trim() ? body.model.trim().slice(0, 120) : undefined;

    const config = await resolveAiConfig(modelOverride);

    if (!config.apiKey) {
      return serviceError(
        503,
        "AI provider is not configured. Set AI_API_KEY in the server environment, and the provider / model in Admin > Settings > AI API.",
      );
    }

    const upstream = await callProvider(config, body.messages, temperature, maxTokens, body.system);

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    if (!upstream.ok) {
      console.error(`[ai] ${config.provider} upstream status ${upstream.status}:`, (upstream.detail ?? "").slice(0, 300));
      await logApiKeyEvent({
        apiKeyId: apiKeyRow.id,
        type: "call",
        status: "failed",
        errorMessage: `Upstream returned status ${upstream.status}`,
        requestData: {
          provider: config.provider,
          model: config.model,
          messageCount: body.messages.length,
          temperature,
          maxTokens,
        },
        ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
      return serviceError(
        upstream.status === 429 ? 429 : upstream.status === 503 ? 503 : 502,
        upstreamMessage(upstream.status ?? 502),
        config.model,
      );
    }

    try {
      const { serverSupabase: supabase } = await import("@/lib/supabase-admin");
      await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", apiKeyRow.id);
    } catch {}

    await logApiKeyEvent({
      apiKeyId: apiKeyRow.id,
      type: "call",
      status: "success",
      requestData: {
        provider: config.provider,
        model: config.model,
        messageCount: body.messages.length,
        temperature,
        maxTokens,
        totalChars: body.messages.reduce((s, m) => s + m.content.length, 0),
      },
      responseData: { tokensUsed: upstream.usage?.totalTokens },
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      provider: config.provider,
      model: config.model,
      response: upstream.text,
      usage: upstream.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });
  } catch (err) {
    console.error("[ai] chat error:", err instanceof Error ? err.message : err);
    await logApiKeyEvent({
      apiKeyId: apiKeyRow?.id,
      type: "call",
      status: "failed",
      errorMessage: "AI service error",
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    }).catch(() => {});
    return serviceError(500, "AI service error");
  }
}

interface ProviderResult {
  ok: boolean;
  text: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  status?: number;
  detail?: string;
}

async function callProvider(
  config: AiConfig,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  systemOverride?: string,
): Promise<ProviderResult> {
  const system = [config.systemPrompt, systemOverride?.trim()].filter(Boolean).join("\n\n");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    if (config.provider === "gemini") {
      const contents = [
        ...(system ? [{ role: "user", parts: [{ text: system }] }] : []),
        ...messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
      ];
      const res = await fetch(
        `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature, maxOutputTokens: maxTokens },
          }),
          signal: controller.signal,
        },
      );
      if (!res.ok) return { ok: false, text: "", status: res.status, detail: await safeText(res) };
      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
      if (!text) {
        if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
          return { ok: true, text: "I can't help with that request." };
        }
        return { ok: false, text: "", status: 502, detail: "empty-response" };
      }
      return {
        ok: true,
        text,
        usage: data?.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount ?? 0,
              completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
              totalTokens: data.usageMetadata.totalTokenCount ?? 0,
            }
          : undefined,
      };
    }

    if (config.provider === "anthropic") {
      const res = await fetch(`${config.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: maxTokens,
          temperature,
          ...(system ? { system } : {}),
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        }),
        signal: controller.signal,
      });
      if (!res.ok) return { ok: false, text: "", status: res.status, detail: await safeText(res) };
      const data = await res.json();
      const text = Array.isArray(data?.content)
        ? data.content.map((c: { text?: string }) => c.text ?? "").join("")
        : "";
      if (!text) return { ok: false, text: "", status: 502, detail: "empty-response" };
      return {
        ok: true,
        text,
        usage: data?.usage
          ? {
              promptTokens: data.usage.input_tokens ?? 0,
              completionTokens: data.usage.output_tokens ?? 0,
              totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
            }
          : undefined,
      };
    }

    const res = await fetch(openAiChatEndpoint(config.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, text: "", status: res.status, detail: await safeText(res) };
    const data = await res.json();
    const text: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.message?.content ??
      "";
    if (typeof text !== "string" || !text.trim()) {
      return { ok: false, text: "", status: 502, detail: "empty-response" };
    }
    return {
      ok: true,
      text,
      usage: data?.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens:
              data.usage.total_tokens ??
              (data.usage.prompt_tokens ?? 0) + (data.usage.completion_tokens ?? 0),
          }
        : undefined,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      text: "",
      status: aborted ? 504 : 500,
      detail: aborted ? "timeout" : err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "";
  }
}

export async function GET() {
  const settings = await readAiSettings();
  return NextResponse.json({
    ok: true,
    service: "ai-chat",
    description: "Chat completion endpoint. Works with any OpenAI-compatible provider, Gemini or Anthropic.",
    configured: isAiKeyConfigured(),
    provider: settings.provider,
    model: settings.model,
    docs: "POST with Authorization: Bearer fubrio_... and { messages: [{ role, content }], model?, temperature?, maxTokens? }",
    providers: ["openai", "gemini", "anthropic"],
    keyLocation: "server environment only",
    settings: ["ai.provider", "ai.baseUrl", "ai.model", "ai.assistantName", "ai.systemPrompt"],
  });
}
