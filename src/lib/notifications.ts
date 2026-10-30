import { supabase } from "@/lib/supabase";


export type NotificationType =
  | "bug_report"
  | "inquiry"
  | "shop_request"
  | "service_request"
  | "customer_chat"
  | "subscription_change"
  | "announcement_webhook_failed"
  | "system";

export async function createNotification(opts: {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  sourceId?: string;
  userId?: string | null;
}): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      type: opts.type,
      title: opts.title,
      body: opts.body ?? null,
      link: opts.link ?? null,
      source_id: opts.sourceId ?? null,
      user_id: opts.userId ?? null,
      read_at: null,
    });
  } catch (e) {
    console.warn("[Fubrio] Failed to create notification:", e);
  }
}
