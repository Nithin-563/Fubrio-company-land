import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { generateApiKey, getDailyKeyCount, MAX_KEYS_PER_DAY, logApiKeyEvent } from "@/lib/api-keys";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in to view API keys" }, { status: 401 });
    const authProvider = (session.user as { authProvider?: string })?.authProvider ?? "credentials";
    if (authProvider !== "google") {
      return NextResponse.json({ ok: false, error: "API keys require Google authentication. Sign in with Google." }, { status: 403 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      id: r.id,
      type: r.type,
      name: r.name,
      keyPrefix: r.key_prefix,
      keySuffix: r.key_suffix,
      webhookUrl: r.webhook_url,
      scopes: r.scopes,
      status: r.status,
      authProvider: r.auth_provider,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      lastUsedAt: r.last_used_at,
    }));

    const todayCount = await getDailyKeyCount(userId);

    return NextResponse.json({
      ok: true,
      data: rows,
      dailyLimit: MAX_KEYS_PER_DAY,
      dailyRemaining: Math.max(0, MAX_KEYS_PER_DAY - todayCount),
    });
  } catch (err) {
    console.error("[Fubrio] API keys GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load API keys" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in to create API keys" }, { status: 401 });
    const authProvider = (session.user as { authProvider?: string })?.authProvider ?? "credentials";
    if (authProvider !== "google") {
      return NextResponse.json({ ok: false, error: "API key creation requires Google authentication. Sign in with Google." }, { status: 403 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

    const todayCount = await getDailyKeyCount(userId);
    if (todayCount >= MAX_KEYS_PER_DAY) {
      return NextResponse.json(
        { ok: false, error: `Daily limit reached - max ${MAX_KEYS_PER_DAY} API keys per day. Try again tomorrow.` },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { type, name, webhookUrl, scopes, expiresAt } = body;

    const validTypes = ["announcements", "ai", "ads"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid type. Choose: announcements | ai | ads" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ ok: false, error: "Name is required (min 3 chars)" }, { status: 400 });
    }
    if (type === "announcements" && !webhookUrl) {
      return NextResponse.json({ ok: false, error: "Announcements API keys require a webhookUrl" }, { status: 400 });
    }
    if (webhookUrl && !/^https?:\/\/[^\s]+$/.test(webhookUrl)) {
      return NextResponse.json({ ok: false, error: "Invalid webhookUrl - must be http(s)://" }, { status: 400 });
    }
    if (expiresAt) {
      const d = new Date(expiresAt);
      if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
        return NextResponse.json({ ok: false, error: "Invalid expiry date" }, { status: 400 });
      }
    }

    const gen = await generateApiKey({ type, name, webhookUrl });

    const insert: any = {
      user_id: userId,
      user_email: (session.user as { email?: string }).email,
      user_name: (session.user as { name?: string }).name,
      user_avatar: (session.user as { image?: string | null }).image ?? null,
      auth_provider: "google",
      type,
      name: name.trim(),
      key_hash: gen.keyHash,
      key_prefix: gen.keyPrefix,
      key_suffix: gen.keySuffix,
      webhook_url: webhookUrl || null,
      scopes: scopes ?? [],
      status: "ACTIVE",
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
    const { data, error } = await supabase.from("api_keys").insert(insert).select().single();
    if (error) throw error;

    await logApiKeyEvent({
      apiKeyId: data.id,
      type: "creation",
      status: "success",
      requestData: { type, name, hasWebhook: !!webhookUrl },
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        type,
        name: name.trim(),
        key: gen.plaintext, // shown ONCE - user must copy & save
        keyPrefix: gen.keyPrefix,
        keySuffix: gen.keySuffix,
        webhookUrl: webhookUrl || null,
        scopes: scopes ?? [],
        status: "ACTIVE",
        authProvider: "google",
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      },
      warning: "This is the only time the full key will be shown. Copy it now and store it securely.",
    });
  } catch (err) {
    console.error("[Fubrio] API keys POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to create API key" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in to manage API keys" }, { status: 401 });
    const authProvider = (session.user as { authProvider?: string })?.authProvider ?? "credentials";
    if (authProvider !== "google") {
      return NextResponse.json({ ok: false, error: "Google authentication required" }, { status: 403 });
    }
    const userId = (session.user as { id?: string }).id;
    if (!userId) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data: existing } = await supabase
      .from("api_keys")
      .select("id, user_id, name")
      .eq("id", id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (existing.user_id !== userId) {
      return NextResponse.json({ ok: false, error: "You can only delete your own API keys" }, { status: 403 });
    }

    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) throw error;

    await logApiKeyEvent({
      apiKeyId: id,
      type: "delete",
      status: "success",
      requestData: { name: existing.name },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Fubrio] API keys DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete API key" }, { status: 500 });
  }
}
