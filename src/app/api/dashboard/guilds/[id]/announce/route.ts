import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { announceAsBot, userManagesGuild, isBotApiConfigured } from "@/lib/bloom-bot";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { channelId, content, title, color } = body;

    if (!channelId || (!content && !title)) {
      return NextResponse.json({ ok: false, error: "channelId and content or title required" }, { status: 400 });
    }

    const result = await announceAsBot(guildId, { channelId, content, title, color });

    if ((result as any)?.error) {
      return NextResponse.json({ ok: false, error: (result as any).error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, messageId: (result as any)?.messageId, url: (result as any)?.url });
  } catch (err) {
    console.error("[Fubrio] Dashboard announce POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to announce" }, { status: 500 });
  }
}
