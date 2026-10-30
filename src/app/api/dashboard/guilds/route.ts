import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserManageableGuilds, isBotApiConfigured, getBotStatus } from "@/lib/bloom-bot";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ ok: false, error: "Sign in with Discord" }, { status: 401 });

    const accessToken = (session.user as any)?.discordAccessToken;
    if (!accessToken) {
      return NextResponse.json({ ok: false, error: "Discord sign-in required to manage guilds" }, { status: 403 });
    }

    const guilds = await getUserManageableGuilds(accessToken);

    const botStatus = isBotApiConfigured() ? await getBotStatus() : null;

    return NextResponse.json({
      ok: true,
      data: guilds,
      botStatus: botStatus,
      botConfigured: isBotApiConfigured(),
    });
  } catch (err) {
    console.error("[Fubrio] Dashboard guilds GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load guilds" }, { status: 500 });
  }
}
