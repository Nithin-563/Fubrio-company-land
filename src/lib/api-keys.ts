import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";


const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomString(length: number): string {
  const buf = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < length; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
  }
  let s = "";
  for (let i = 0; i < length; i++) {
    s += CHARSET[buf[i] % CHARSET.length];
  }
  return s;
}

export interface ApiKeyInfo {
  type: "announcements" | "ai" | "ads";
  name: string;
  webhookUrl?: string | null;
}

export interface GeneratedKey {
  plaintext: string;       // shown to user once
  keyHash: string;         // bcrypt hash stored in DB
  keyPrefix: string;       // first 12 chars for display
  keySuffix: string;       // last 4 chars for display
}

export async function generateApiKey(
  info: ApiKeyInfo,
): Promise<GeneratedKey> {
  const typePart = info.type; // "announcements" | "ai"
  const randomPart = randomString(32);
  const plaintext = `fubrio_${typePart}_${randomPart}`;
  const keyHash = await hash(plaintext, 10);
  const keyPrefix = plaintext.slice(0, 12);
  const keySuffix = plaintext.slice(-4);
  return { plaintext, keyHash, keyPrefix, keySuffix };
}

export async function verifyApiKey(rawKey: string): Promise<any | null> {
  if (!rawKey) return null;
  const cleaned = rawKey.startsWith("Bearer ") ? rawKey.slice("Bearer ".length) : rawKey;
  if (!cleaned.startsWith("fubrio_")) return null;

  let type: string | null = null;
  if (cleaned.startsWith("fubrio_announcements_")) type = "announcements";
  else if (cleaned.startsWith("fubrio_ai_")) type = "ai";
  else if (cleaned.startsWith("fubrio_ads_")) type = "ads";
  else return null;

  const { supabase } = await import("@/lib/supabase");
  const { data: candidates, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("type", type)
    .eq("status", "ACTIVE");
  if (error || !candidates) return null;

  for (const k of candidates) {
    const expectedPrefix = cleaned.slice(0, 12);
    const expectedSuffix = cleaned.slice(-4);
    if (k.key_prefix !== expectedPrefix || k.key_suffix !== expectedSuffix) continue;

    if (k.expires_at && new Date(k.expires_at).getTime() < Date.now()) continue;

    const ok = await compareHashes(cleaned, k.key_hash);
    if (ok) {
      return {
        id: k.id,
        userId: k.user_id,
        userEmail: k.user_email,
        userName: k.user_name,
        userAvatar: k.user_avatar,
        authProvider: k.auth_provider,
        type: k.type,
        name: k.name,
        webhookUrl: k.webhook_url,
        scopes: k.scopes,
        status: k.status,
        createdAt: k.created_at,
        expiresAt: k.expires_at,
        lastUsedAt: k.last_used_at,
      };
    }
  }
  return null;
}

async function compareHashes(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await (await import("bcryptjs")).compare(plaintext, hash);
  } catch {
    return false;
  }
}

export const MAX_KEYS_PER_DAY = 3;

export async function getDailyKeyCount(userId: string): Promise<number> {
  const { supabase } = await import("@/lib/supabase");
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());
  if (error) return 0;
  return count ?? 0;
}

export async function logApiKeyEvent(opts: {
  apiKeyId?: string | null;
  type: "call" | "webhook_delivery" | "creation" | "revoke" | "delete";
  status: "success" | "failed";
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
}) {
  try {
    const { supabase } = await import("@/lib/supabase");
    await supabase.from("api_key_logs").insert({
      api_key_id: opts.apiKeyId ?? null,
      type: opts.type,
      status: opts.status,
      request_data: opts.requestData ?? null,
      response_data: opts.responseData ?? null,
      error_message: opts.errorMessage ?? null,
      ip: opts.ip ?? null,
      user_agent: opts.userAgent ?? null,
    });
  } catch (e) {
    console.warn("[Fubrio] Failed to log API key event:", e);
  }
}
