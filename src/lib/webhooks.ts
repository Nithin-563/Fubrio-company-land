import { supabase } from "@/lib/supabase";
import { logApiKeyEvent } from "@/lib/api-keys";


export interface AnnouncementWebhookPayload {
  event: "announcement.published";
  announcement: {
    id: string;
    title: string;
    body: string | null;
    image: string | null;
    pinned: boolean;
    publishedAt: string;
    url: string;
  };
  deliveredAt: string;
}

export async function fireAnnouncementWebhooks(announcement: {
  id: string;
  title: string;
  body: string | null;
  image: string | null;
  pinned: boolean;
  publishedAt: string | null;
}, baseUrlOverride?: string) {
  try {
    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("type", "announcements")
      .eq("status", "ACTIVE");
    if (error || !keys || keys.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const baseUrl = baseUrlOverride || process.env.NEXTAUTH_URL || "https://fubrio.in";
    const payload: AnnouncementWebhookPayload = {
      event: "announcement.published",
      announcement: {
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        image: announcement.image,
        pinned: announcement.pinned,
        publishedAt: announcement.publishedAt ?? new Date().toISOString(),
        url: `${baseUrl}/#announcements`,
      },
      deliveredAt: new Date().toISOString(),
    };

    let sent = 0;
    let failed = 0;

    await Promise.all(
      keys.map(async (k: any) => {
        if (!k.webhook_url) {
          failed++;
          return;
        }
        if (k.expires_at && new Date(k.expires_at).getTime() < Date.now()) {
          failed++;
          return;
        }

        try {
          const res = await fetch(k.webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Fubrio-Webhook/1.0",
              "X-Fubrio-Event": "announcement.published",
              "X-Fubrio-Key": k.key_prefix,
              "X-Fubrio-Signature": "v1=masked", // placeholder for future HMAC signing
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
          });

          const okStatus = res.ok;
          await logApiKeyEvent({
            apiKeyId: k.id,
            type: "webhook_delivery",
            status: okStatus ? "success" : "failed",
            requestData: { url: k.webhook_url, announcementId: announcement.id },
            responseData: { status: res.status, statusText: res.statusText },
            errorMessage: okStatus ? undefined : `HTTP ${res.status}`,
          });

          if (okStatus) {
            sent++;
          } else {
            failed++;
          }

          await supabase
            .from("api_keys")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", k.id);
        } catch (err: any) {
          failed++;
          await logApiKeyEvent({
            apiKeyId: k.id,
            type: "webhook_delivery",
            status: "failed",
            errorMessage: "Wisee delivery timeout or connection refused", // generic message
            requestData: { url: k.webhook_url, announcementId: announcement.id },
          });
        }
      }),
    );

    console.log(`[Fubrio] Announcement webhooks: sent=${sent}, failed=${failed}`);
    return { sent, failed };
  } catch (err) {
    console.error("[Fubrio] fireAnnouncementWebhooks error:", err);
    return { sent: 0, failed: 0 };
  }
}
