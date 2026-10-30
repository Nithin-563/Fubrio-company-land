import { supabase } from "@/lib/supabase";


export const RATE_LIMITS = {
  perMinute: 10,        // all keys
  aiFreePerDay: 25,     // AI free tier
  adsPerDay: 1000,      // ads-type
};

function minuteBucketKey(): string {
  return new Date().toISOString().slice(0, 16);
}

function dayBucketKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  used: number;
  remaining: number;
  bucket: "minute" | "day";
  retryAfterSeconds?: number;
}

async function checkAndIncrement(apiKeyId: string, bucketType: "minute" | "day", limit: number): Promise<RateLimitResult> {
  const bucketKey = bucketType === "minute" ? minuteBucketKey() : dayBucketKey();

  const { data, error } = await supabase
    .from("api_key_usage")
    .select("count")
    .eq("api_key_id", apiKeyId)
    .eq("bucket_type", bucketType)
    .eq("bucket_key", bucketKey)
    .maybeSingle();

  if (error) {
    console.warn("[Fubrio] Rate-limit check error:", error.message);
    return { ok: true, limit, used: 0, remaining: limit, bucket: bucketType };
  }

  const currentCount = (data as any)?.count ?? 0;
  if (currentCount >= limit) {
    let retryAfterSeconds = 60;
    if (bucketType === "minute") {
      retryAfterSeconds = 60 - new Date().getUTCSeconds();
    } else {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      retryAfterSeconds = Math.max(1, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000));
    }
    return {
      ok: false,
      limit,
      used: currentCount,
      remaining: 0,
      bucket: bucketType,
      retryAfterSeconds,
    };
  }

  const { error: upsertErr } = await supabase
    .from("api_key_usage")
    .upsert(
      {
        api_key_id: apiKeyId,
        bucket_type: bucketType,
        bucket_key: bucketKey,
        count: currentCount + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "api_key_id,bucket_type,bucket_key", ignoreDuplicates: false },
    );
  if (upsertErr) {
    console.warn("[Fubrio] Rate-limit increment error:", upsertErr.message);
    return { ok: true, limit, used: currentCount, remaining: limit - currentCount, bucket: bucketType };
  }

  return {
    ok: true,
    limit,
    used: currentCount + 1,
    remaining: limit - currentCount - 1,
    bucket: bucketType,
  };
}


export async function checkRateLimitMinute(apiKeyId: string): Promise<RateLimitResult> {
  return checkAndIncrement(apiKeyId, "minute", RATE_LIMITS.perMinute);
}

export async function checkRateLimitAi(apiKeyId: string, dailyLimit: number = RATE_LIMITS.aiFreePerDay): Promise<RateLimitResult> {
  const minuteCheck = await checkAndIncrement(apiKeyId, "minute", RATE_LIMITS.perMinute);
  if (!minuteCheck.ok) return minuteCheck;
  return checkAndIncrement(apiKeyId, "day", dailyLimit);
}

export async function checkRateLimitAds(apiKeyId: string): Promise<RateLimitResult> {
  const minuteCheck = await checkAndIncrement(apiKeyId, "minute", RATE_LIMITS.perMinute);
  if (!minuteCheck.ok) return minuteCheck;
  return checkAndIncrement(apiKeyId, "day", RATE_LIMITS.adsPerDay);
}

export async function getAiDailyLimitForUser(userEmail: string | undefined): Promise<{ limit: number; planName: string | null }> {
  if (!userEmail) return { limit: RATE_LIMITS.aiFreePerDay, planName: null };

  try {
    const { data: sub, error } = await supabase
      .from("user_subscriptions")
      .select("id, plan_id, plan_name, expires_at, status, subscription_plans!inner(ai_credits_per_day, name)")
      .eq("user_email", userEmail.toLowerCase())
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !sub) return { limit: RATE_LIMITS.aiFreePerDay, planName: null };

    if (sub.expires_at && new Date(sub.expires_at).getTime() < Date.now()) {
      return { limit: RATE_LIMITS.aiFreePerDay, planName: null };
    }

    const planData = (sub as any).subscription_plans;
    const credits = planData?.ai_credits_per_day ?? RATE_LIMITS.aiFreePerDay;
    return { limit: credits, planName: planData?.name ?? sub.plan_name };
  } catch {
    return { limit: RATE_LIMITS.aiFreePerDay, planName: null };
  }
}
