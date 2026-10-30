import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TRANSPARENT_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const impressionToken = url.searchParams.get("imp");
    if (!impressionToken) {
      return new NextResponse(TRANSPARENT_GIF, {
        headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
      });
    }

    try {
      await supabase
        .from("ad_impressions")
        .update({ clicked: true, clicked_at: new Date().toISOString() })
        .eq("impression_token", impressionToken);
    } catch (e) {
      console.warn("[Fubrio] Ads: failed to track click:", e);
    }

    return new NextResponse(TRANSPARENT_GIF, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[Fubrio] Ads click track error:", err);
    return new NextResponse(TRANSPARENT_GIF, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-store" },
    });
  }
}
