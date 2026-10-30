import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, logApiKeyEvent } from "@/lib/api-keys";
import { checkRateLimitAds } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import { getBaseUrl } from "@/lib/base-url";
import { v4 as uuid } from "uuid";


const FORMATS: Record<string, { width: number; height: number; label: string }> = {
  banner: { width: 728, height: 90, label: "Banner 728×90" },
  square: { width: 300, height: 250, label: "Square 300×250" },
  sidebar: { width: 300, height: 600, label: "Sidebar 300×600" },
  inline: { width: 120, height: 240, label: "Inline 120×240" },
};

export async function POST(req: NextRequest) {
  let apiKeyRow: any = null;
  try {
    const auth = req.headers.get("authorization") || "";
    const rawKey = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;
    if (!rawKey) {
      return NextResponse.json({ ok: false, error: "Missing API key. Set Authorization: Bearer fubrio_ads_xxx" }, { status: 401 });
    }
    apiKeyRow = await verifyApiKey(rawKey);
    if (!apiKeyRow) {
      return NextResponse.json({ ok: false, error: "Invalid or revoked API key" }, { status: 401 });
    }
    if (apiKeyRow.type !== "ads") {
      return NextResponse.json({ ok: false, error: "This API key is not authorized for ads. Create an ads-type key." }, { status: 403 });
    }

    const rl = await checkRateLimitAds(apiKeyRow.id);
    if (!rl.ok) {
      const isDaily = rl.bucket === "day";
      const retryAfter = rl.retryAfterSeconds ?? 60;
      return NextResponse.json(
        {
          ok: false,
          error: isDaily
            ? `Daily ad-request limit reached (${rl.limit} per day). Try again in ${Math.ceil(retryAfter / 60)} minutes.`
            : `Rate limit reached (${rl.limit} requests per minute). Try again in ${retryAfter} seconds.`,
          rateLimit: {
            limit: rl.limit,
            used: rl.used,
            remaining: rl.remaining,
            bucket: rl.bucket,
            retryAfterSeconds: retryAfter,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const format = FORMATS[body.format] ? body.format : "banner";
    const fmt = FORMATS[format];
    const referrer = (typeof body.referrer === "string" ? body.referrer : req.headers.get("referer") || "").slice(0, 500);

    const impressionToken = uuid();
    const publisherId = process.env.ADSENSE_PUBLISHER_ID || "";
    const slotMap: Record<string, string> = {
      banner: process.env.ADSENSE_AD_SLOT_BANNER || "",
      square: process.env.ADSENSE_AD_SLOT_SQUARE || "",
      sidebar: process.env.ADSENSE_AD_SLOT_SIDEBAR || "",
      inline: process.env.ADSENSE_AD_SLOT_INLINE || "",
    };
    const adSlot = slotMap[format] || "";
    const cpm = Number(process.env.AD_CPM_USD || 0.5);

    try {
      await supabase.from("ad_impressions").insert({
        api_key_id: apiKeyRow.id,
        impression_token: impressionToken,
        ad_format: format,
        ad_unit: adSlot || null,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
        user_agent: (req.headers.get("user-agent") || "").slice(0, 500),
        referrer: referrer || null,
        payout_usd: cpm / 1000, // per-impression estimated payout
      });
    } catch (e) {
      console.warn("[Fubrio] Ads: failed to log impression:", e);
    }

    let html: string;
    if (publisherId && adSlot) {
      html = `<ins class="adsbygoogle" style="display:inline-block;width:${fmt.width}px;height:${fmt.height}px"
  data-ad-client="${publisherId}" data-ad-slot="${adSlot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>
<img src="${getBaseUrl(req)}/api/v1/ads/click?imp=${impressionToken}" style="display:none" width="1" height="1" alt="" />`;
    } else {
      const promoUrl = getBaseUrl(req);
      html = `<a href="${promoUrl}/#api-keys" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:${fmt.width}px;height:${fmt.height}px;background:linear-gradient(135deg,#A0F2A0,#10B981);color:#0a0a0a;text-decoration:none;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;font-weight:600;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">🌟 Powered by Fubrio Ads</a>`;
    }

    try {
      await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", apiKeyRow.id);
    } catch {}

    return NextResponse.json({
      ok: true,
      impressionId: impressionToken,
      html,
      format,
      width: fmt.width,
      height: fmt.height,
    });
  } catch (err: any) {
    console.error("[Fubrio] Ads render error:", err?.message ?? err);
    return NextResponse.json({ ok: false, error: "Ad service error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fubrio-ads",
    description: "Fubrio Ads render endpoint - returns ad HTML for embedding",
    docs: "POST with Authorization: Bearer fubrio_ads_xxx and { format: 'banner' | 'square' | 'sidebar' | 'inline' }",
    formats: Object.entries(FORMATS).map(([id, f]) => ({ id, width: f.width, height: f.height, label: f.label })),
  });
}
