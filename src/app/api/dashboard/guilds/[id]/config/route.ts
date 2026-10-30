import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateGuildConfig, userManagesGuild, isBotApiConfigured } from "@/lib/bloom-bot";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in" }, { status: 401 });

    const accessToken = (session.user as any)?.discordAccessToken;
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Discord sign-in required" }, { status: 403 });
    }

    const { id: guildId } = await params;

    const manages = await userManagesGuild(accessToken, guildId);
    if (!manages) {
      return NextResponse.json({ ok: false, error: "You don't manage this server" }, { status: 403 });
    }

    if (!isBotApiConfigured()) {
      return NextResponse.json({ ok: false, error: "Bot API not configured" }, { status: 503 });
    }

    const body = await req.json();

    const result = await updateGuildConfig(guildId, body);

    if ((result as any)?.error) {
      return NextResponse.json({ ok: false, error: (result as any).error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, config: (result as any)?.config ?? null });
  } catch (err) {
    console.error("[Fubrio] Dashboard config PATCH error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update config" }, { status: 500 });
  }
}
