import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGuildConfig, getGuildStats, userManagesGuild, isBotApiConfigured } from "@/lib/bloom-bot";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in with Discord to manage your servers" }, { status: 401 });

    const accessToken = (session.user as any)?.discordAccessToken;
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Discord sign-in required. Sign out and sign in with Discord." }, { status: 403 });
    }

    const { id: guildId } = await params;

    const manages = await userManagesGuild(accessToken, guildId);
    if (!manages) {
      return NextResponse.json({
        ok: false,
        error: "Couldn't verify your permissions for this server. Your Discord session may have expired - please sign in again.",
        expiredToken: true,
      }, { status: 403 });
    }

    if (!isBotApiConfigured()) {
      return NextResponse.json({
        ok: true,
        config: null,
        botNotConfigured: true,
        message: "Bloom bot isn't connected to the website yet. Set BLOOM_BOT_API_URL and BLOOM_API_KEY env vars to enable live config.",
      });
    }

    const configRes = await getGuildConfig(guildId);

    if ((configRes as any)?.error) {
      const errMsg = (configRes as any).error;
      if (errMsg.includes("not in") || errMsg.includes("Not found") || (configRes as any)?.status === 404) {
        return NextResponse.json({
          ok: true,
          config: null,
          botNotInGuild: true,
          message: "Bloom isn't in this server yet. Use the invite button to add it.",
        });
      }
      return NextResponse.json({
        ok: true,
        config: null,
        botError: errMsg,
        message: "Could not reach the Bloom bot. Make sure the bot is running and the API key matches.",
      });
    }

    let statsRes: any = null;
    try {
      statsRes = await getGuildStats(guildId);
    } catch {}

    return NextResponse.json({
      ok: true,
      config: (configRes as any)?.config ?? null,
      guild: (configRes as any)?.guild ?? null,
      stats: statsRes && !(statsRes as any)?.error ? statsRes : null,
    });
  } catch (err) {
    console.error("[Fubrio] Dashboard guild GET error:", err);
    return NextResponse.json({
      ok: false,
      error: "Something went wrong loading the server config. Please try again.",
    }, { status: 500 });
  }
}
