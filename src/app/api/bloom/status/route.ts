import { NextResponse } from "next/server";
import { getBotStatus, isBotApiConfigured } from "@/lib/bloom-bot";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (isBotApiConfigured()) {
    const status = await getBotStatus();
    if ((status as any)?.bot) {
      return NextResponse.json(status);
    }
  }

  try {
    const { data: rows } = await supabase
      .from("site_settings")
      .select("*")
      .like("key", "bloom.%");

    const settings: Record<string, string> = {};
    for (const r of rows ?? []) {
      settings[r.key] = r.value;
    }

    const servers = parseInt(settings["bloom.servers"]) || 0;
    const users = parseInt(settings["bloom.users"]) || 0;
    const commands = parseInt(settings["bloom.commands"]) || 150;
    const isOnline = settings["bloom.status"] !== "offline";

    return NextResponse.json({
      ok: true,
      bot: {
        id: null,
        tag: "Bloom",
        avatar: null,
        ready: isOnline,
        guilds: servers,
        users: users,
        commands: commands,
        uptimeSeconds: 0,
        ping: 0,
      },
      source: "settings", // indicates these are admin-configured, not live
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "No bot stats configured",
      bot: null,
    });
  }
}
