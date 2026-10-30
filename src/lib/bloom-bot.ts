
const BOT_API_URL = process.env.BLOOM_BOT_API_URL || "";
const BOT_API_KEY = process.env.BLOOM_API_KEY || "";

export function isBotApiConfigured(): boolean {
  return !!(BOT_API_URL && BOT_API_KEY);
}

async function botFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  if (!isBotApiConfigured()) {
    return { error: "Bot API not configured. Set BLOOM_BOT_API_URL and BLOOM_API_KEY env vars." } as any;
  }
  const url = `${BOT_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "x-bloom-api-key": BOT_API_KEY,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) {
    return { error: (data as any)?.error?.message ?? `Bot API returned ${res.status}`, status: res.status } as any;
  }
  return data as T;
}


export async function getBotStatus() {
  try {
    return await botFetch("/api/v1/status");
  } catch (err: any) {
    return { error: "Bot unreachable", details: err?.message };
  }
}

export async function getBotCommands() {
  try {
    return await botFetch("/api/v1/commands");
  } catch {
    return { commands: [] };
  }
}


export async function getBotGuilds() {
  try {
    return await botFetch("/api/v1/guilds");
  } catch {
    return { guilds: [] };
  }
}

export async function getGuildConfig(guildId: string) {
  return botFetch(`/api/v1/guilds/${guildId}`);
}

export async function updateGuildConfig(guildId: string, updates: Record<string, any>) {
  return botFetch(`/api/v1/guilds/${guildId}/config`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function getGuildStats(guildId: string) {
  return botFetch(`/api/v1/guilds/${guildId}/stats`);
}

export async function announceAsBot(guildId: string, opts: { channelId: string; content?: string; title?: string; color?: string }) {
  return botFetch(`/api/v1/guilds/${guildId}/announce`, {
    method: "POST",
    body: JSON.stringify(opts),
  });
}

export async function userManagesGuild(accessToken: string, guildId: string): Promise<boolean> {
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return false;
    const guilds = await res.json();
    const guild = guilds.find((g: any) => String(g.id) === String(guildId));
    if (!guild) return false;
    try {
      const perms = BigInt(guild.permissions);
      return (perms & BigInt(0x20)) === BigInt(0x20) || guild.owner === true;
    } catch {
      return (Number(guild.permissions) & 0x20) === 0x20 || guild.owner === true;
    }
  } catch {
    return false;
  }
}

export async function getUserManageableGuilds(accessToken: string): Promise<Array<{ id: string; name: string; icon: string | null; memberCount?: number; botInGuild: boolean }>> {
  try {
    const discordRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!discordRes.ok) return [];
    const userGuilds = await discordRes.json();

    let botGuildIds = new Set<string>();
    let botGuildMap = new Map<string, any>();
    if (isBotApiConfigured()) {
      try {
        const botGuildsRes = await getBotGuilds();
        const botGuilds = (botGuildsRes as any)?.guilds ?? [];
        botGuildIds = new Set(botGuilds.map((g: any) => String(g.id)));
        botGuildMap = new Map(botGuilds.map((g: any) => [String(g.id), g]));
      } catch {
      }
    }

    return userGuilds
      .filter((g: any) => {
        try {
          const perms = BigInt(g.permissions);
          const hasManage = (perms & BigInt(0x20)) === BigInt(0x20);
          return hasManage || g.owner === true;
        } catch {
          return (Number(g.permissions) & 0x20) === 0x20 || g.owner === true;
        }
      })
      .map((g: any) => ({
        id: String(g.id),
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
        memberCount: botGuildMap.get(String(g.id))?.memberCount,
        botInGuild: botGuildIds.has(String(g.id)),
      }));
  } catch {
    return [];
  }
}
