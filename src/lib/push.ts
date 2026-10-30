import webpush from "web-push";
import { supabase } from "@/lib/supabase";


let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@fubrio.in";
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  }
  configured = true;
}

export async function sendPushToAllSubscribers(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  ensureConfigured();
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    console.warn("[Fubrio] VAPID keys not configured - skipping push notifications.");
    return { sent: 0, failed: 0, total: 0 };
  }

  const { data: subs, error } = await supabase
    .from("announcement_subscriptions")
    .select("*");

  if (error || !subs || subs.length === 0) {
    return { sent: 0, failed: 0, total: 0 };
  }

  const message = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
    icon: "/fubrio-logo.png",
    badge: "/favicon-32.png",
    tag: "fubrio-announcement",
  });

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  for (const s of subs) {
    try {
      const sub = {
        endpoint: s.endpoint,
        keys: {
          p256dh: s.p256dh,
          auth: s.auth,
        },
      };
      await webpush.sendNotification(sub, message);
      sent++;
    } catch (err: any) {
      failed++;
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        staleEndpoints.push(s.endpoint);
      } else {
        console.warn(`[Fubrio] Push to ${s.endpoint?.slice(0, 60)}… failed:`, err?.message ?? err);
      }
    }
  }

  if (staleEndpoints.length > 0) {
    await supabase.from("announcement_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  console.log(`[Fubrio] Push sent: ${sent}, failed: ${failed}, total: ${subs.length}`);
  return { sent, failed, total: subs.length };
}
