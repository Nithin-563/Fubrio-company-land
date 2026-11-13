const SECRET_KEY_PATTERN = /(api[_-]?key|apikey|secret|token|password|passwd|private[_-]?key|credential)/i;

export const AI_KEY_ENV_VARS = ["AI_API_KEY", "WISEE_AI_UPSTREAM_KEY"] as const;

const PUBLIC_SETTING_PREFIXES = [
  "brand.",
  "email.",
  "contact.",
  "social.",
  "donation.",
  "seo.",
  "bloom.",
];

export type AiProvider = "openai" | "gemini" | "anthropic";

export interface AiSettings {
  provider: AiProvider;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  assistantName: string;
}

export interface AiConfig extends AiSettings {
  apiKey: string;
}

export const DEFAULT_AI_BASE_URLS: Record<AiProvider, string> = {
  openai: "https://api.openai.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  anthropic: "https://api.anthropic.com/v1",
};

export const DEFAULT_AI_SYSTEM_PROMPT =
  "You are a helpful assistant. Be accurate, concise and direct. Refuse harmful, illegal or hateful requests.";

export function isSecretSettingKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function isPublicSettingKey(key: string): boolean {
  if (!key || isSecretSettingKey(key)) return false;
  return PUBLIC_SETTING_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function stripSecretSettings<T extends Record<string, string>>(settings: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(settings ?? {})) {
    if (!isSecretSettingKey(key)) out[key] = value;
  }
  return out;
}

export function getAiApiKey(): string {
  for (const name of AI_KEY_ENV_VARS) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return "";
}

export function isAiKeyConfigured(): boolean {
  return getAiApiKey().length > 0;
}

function normaliseProvider(raw: string | undefined): AiProvider {
  const value = (raw || "").toLowerCase();
  if (value === "gemini" || value === "google") return "gemini";
  if (value === "anthropic" || value === "claude") return "anthropic";
  return "openai";
}

let scrubPromise: Promise<number> | null = null;

/**
 * Deletes any secret-looking ai.* row left in site_settings by the old admin
 * form. Runs once per server process; failures are silent because the SQL
 * migration does the same cleanup with admin rights.
 */
export function scrubStoredSecretSettings(): Promise<number> {
  if (!scrubPromise) {
    scrubPromise = (async () => {
      try {
        const { serverSupabase } = await import("@/lib/supabase-admin");
        const { data } = await serverSupabase.from("site_settings").select("key");
        const keys = (data ?? [])
          .map((row: { key?: string }) => row.key)
          .filter((key: string | undefined): key is string =>
            typeof key === "string" && key.startsWith("ai.") && isSecretSettingKey(key),
          );
        if (keys.length === 0) return 0;
        const { error } = await serverSupabase.from("site_settings").delete().in("key", keys);
        if (error) return 0;
        console.warn(`[ai-config] removed ${keys.length} stored secret setting row(s)`);
        return keys.length;
      } catch {
        return 0;
      }
    })();
  }
  return scrubPromise;
}

async function readSettingsRows(): Promise<Record<string, string>> {
  try {
    const { serverSupabase: supabase } = await import("@/lib/supabase-admin");
    const { data } = await supabase.from("site_settings").select("key, value");
    const out: Record<string, string> = {};
    for (const row of data ?? []) {
      const key = (row as { key?: string }).key;
      const value = (row as { value?: unknown }).value;
      if (typeof key === "string" && value != null) out[key] = String(value);
    }
    return out;
  } catch {
    return {};
  }
}

export async function readAiSettings(): Promise<AiSettings> {
  await scrubStoredSecretSettings();
  const settings = stripSecretSettings(await readSettingsRows());
  const provider = normaliseProvider(settings["ai.provider"] || process.env.AI_PROVIDER);

  return {
    provider,
    baseUrl: (settings["ai.baseUrl"] || process.env.AI_BASE_URL || "").trim().replace(/\/+$/, "") ||
      DEFAULT_AI_BASE_URLS[provider],
    model:
      settings["ai.model"] ||
      process.env.AI_MODEL ||
      process.env.WISEE_AI_UPSTREAM_MODEL ||
      (provider === "gemini" ? "gemini-2.0-flash" : provider === "anthropic" ? "claude-3-5-sonnet-latest" : "gpt-4o-mini"),
    systemPrompt: settings["ai.systemPrompt"] || process.env.AI_SYSTEM_PROMPT || DEFAULT_AI_SYSTEM_PROMPT,
    assistantName: settings["ai.assistantName"] || "Fubrio Assistant",
  };
}

export async function resolveAiConfig(modelOverride?: string): Promise<AiConfig> {
  const settings = await readAiSettings();
  return {
    ...settings,
    model: modelOverride || settings.model,
    apiKey: getAiApiKey(),
  };
}

export function openAiChatEndpoint(baseUrl: string): string {
  const url = baseUrl.replace(/\/+$/, "");
  if (/\/chat\/completions$/.test(url)) return url;
  return `${url}/chat/completions`;
}
