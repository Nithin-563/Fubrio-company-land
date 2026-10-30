"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


interface CommandInfo {
  name: string;
  description: string;
}

interface CategoryInfo {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  commands: CommandInfo[];
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: "moderation",
    label: "Moderation",
    description: "Keep your server safe with powerful moderation tools",
    icon: "🛡️",
    color: "var(--fubrio-accent)",
    commands: [
      { name: "ban", description: "Ban a member from the server" },
      { name: "kick", description: "Kick a member from the server" },
      { name: "timeout", description: "Timeout a member temporarily" },
      { name: "warn", description: "Warn a member with a recorded case" },
      { name: "unban", description: "Unban a previously banned member" },
      { name: "tempban", description: "Temporarily ban a member" },
      { name: "temprole", description: "Assign a temporary role" },
      { name: "lock", description: "Lock a channel" },
      { name: "purge", description: "Bulk delete messages" },
      { name: "mass", description: "Mass moderation actions" },
      { name: "cases", description: "View moderation case history" },
      { name: "usernotes", description: "Manage user notes" },
      { name: "dm", description: "DM a member through the bot" },
    ],
  },
  {
    id: "security",
    label: "Security",
    description: "Anti-raid, anti-nuke, anti-spam, and more",
    icon: "🔒",
    color: "#ef4444",
    commands: [
      { name: "security", description: "Configure anti-raid, anti-nuke, anti-spam, anti-bot, anti-webhook, content filters, and panic lockdown" },
    ],
  },
  {
    id: "music",
    label: "Music",
    description: "High-quality music playback from YouTube, Spotify, SoundCloud",
    icon: "🎵",
    color: "#a855f7",
    commands: [
      { name: "play", description: "Play a song from YouTube/Spotify/SoundCloud" },
      { name: "music", description: "Full music control panel" },
      { name: "queue", description: "View the music queue" },
      { name: "join", description: "Join the bot to your voice channel" },
      { name: "nowplaying", description: "Show the currently playing song" },
    ],
  },
  {
    id: "economy",
    label: "Economy",
    description: "Server currency, shop, gambling, leaderboards",
    icon: "💰",
    color: "#f59e0b",
    commands: [
      { name: "balance", description: "Check your coin balance" },
      { name: "daily", description: "Claim daily coins" },
      { name: "work", description: "Work for coins" },
      { name: "shop", description: "Browse the server shop" },
      { name: "buy", description: "Buy an item from the shop" },
      { name: "gamble", description: "Gamble your coins" },
      { name: "pay", description: "Pay coins to another member" },
      { name: "rob", description: "Attempt to rob another member" },
      { name: "fish", description: "Fish for coins" },
      { name: "mine", description: "Mine for coins" },
      { name: "inventory", description: "View your inventory" },
      { name: "leaderboard", description: "View the economy leaderboard" },
      { name: "beg", description: "Beg for coins" },
      { name: "crime", description: "Commit a crime for coins" },
      { name: "deposit", description: "Deposit coins to the bank" },
      { name: "withdraw", description: "Withdraw coins from the bank" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    description: "Ask questions, chat, summarize, translate, and more",
    icon: "🤖",
    color: "#3b82f6",
    commands: [
      { name: "ask", description: "Ask the AI a question" },
      { name: "ai", description: "Configure AI settings (ticket AI, DM chat, persona)" },
    ],
  },
  {
    id: "leveling",
    label: "Leveling",
    description: "XP, ranks, leaderboards, and level roles",
    icon: "📊",
    color: "#10b981",
    commands: [
      { name: "rank", description: "View your rank card" },
      { name: "level", description: "View your level" },
      { name: "leaderboard", description: "View the XP leaderboard" },
    ],
  },
  {
    id: "ticket",
    label: "Tickets",
    description: "Support tickets with AI assistant",
    icon: "🎫",
    color: "#ec4899",
    commands: [
      { name: "ticket", description: "Create a support ticket" },
    ],
  },
  {
    id: "logging",
    label: "Logging",
    description: "Track member joins, leaves, message edits, deletes, and more",
    icon: "📝",
    color: "#6366f1",
    commands: [
      { name: "logging", description: "Configure logging channels and events" },
    ],
  },
  {
    id: "welcome",
    label: "Welcome & Farewell",
    description: "Greet new members and say goodbye with custom cards",
    icon: "👋",
    color: "#f97316",
    commands: [
      { name: "welcome", description: "Configure welcome messages + image cards" },
      { name: "goodbye", description: "Configure farewell messages" },
      { name: "autorole", description: "Auto-assign roles on join" },
      { name: "greet", description: "Test the welcome message" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    description: "Polls, embeds, calculators, and more",
    icon: "🔧",
    color: "#8b5cf6",
    commands: [
      { name: "embedbuilder", description: "Build custom embeds" },
      { name: "calculate", description: "Math calculator" },
      { name: "poll", description: "Create a poll" },
      { name: "generatepassword", description: "Generate a secure password" },
      { name: "hexcolor", description: "Preview hex colors" },
      { name: "baseconvert", description: "Convert between number bases" },
      { name: "countdown", description: "Set a countdown timer" },
      { name: "randomuser", description: "Pick a random user" },
      { name: "shorten", description: "Shorten a URL" },
      { name: "time", description: "Get the current time" },
      { name: "unixtime", description: "Get the Unix timestamp" },
    ],
  },
  {
    id: "utility",
    label: "Utility",
    description: "Reminders, schedules, user info, weather, and more",
    icon: "🛎️",
    color: "#06b6d4",
    commands: [
      { name: "remind", description: "Set a reminder" },
      { name: "schedule", description: "Schedule a message" },
      { name: "userinfo", description: "View user info" },
      { name: "serverinfo", description: "View server info" },
      { name: "weather", description: "Get the weather" },
      { name: "code", description: "Create a custom command" },
      { name: "todo", description: "Manage your todo list" },
      { name: "highlight", description: "Set highlight keywords" },
      { name: "report", description: "Report a bug to the bot owner" },
      { name: "suggest", description: "Submit a suggestion to the bot owner" },
      { name: "emoji", description: "Get emoji info" },
      { name: "firstmsg", description: "Fetch the first message in a channel" },
      { name: "wipedata", description: "Wipe your data from the bot" },
    ],
  },
  {
    id: "fun",
    label: "Fun",
    description: "Games and entertainment commands",
    icon: "🎮",
    color: "#f43f5e",
    commands: [
      { name: "fun", description: "Various fun commands" },
      { name: "count", description: "Counting game" },
    ],
  },
  {
    id: "reaction-roles",
    label: "Reaction Roles",
    description: "Self-assignable roles via reactions",
    icon: "🎭",
    color: "#a855f7",
    commands: [
      { name: "reactroles", description: "Configure reaction role messages" },
    ],
  },
  {
    id: "join-to-create",
    label: "Join to Create",
    description: "Voice channel join-to-create system",
    icon: "🔊",
    color: "#14b8a6",
    commands: [
      { name: "jointocreate", description: "Configure join-to-create voice channels" },
    ],
  },
  {
    id: "giveaway",
    label: "Giveaways",
    description: "Host giveaways with auto-winner selection",
    icon: "🎁",
    color: "#f59e0b",
    commands: [
      { name: "giveaway", description: "Start and manage giveaways" },
    ],
  },
  {
    id: "server-stats",
    label: "Server Stats",
    description: "Live server statistics counters (member count, etc.)",
    icon: "📈",
    color: "#6366f1",
    commands: [
      { name: "serverstats", description: "Create and manage server stat counters" },
    ],
  },
  {
    id: "verification",
    label: "Verification",
    description: "Captcha, email, and role-gate verification",
    icon: "✅",
    color: "#10b981",
    commands: [
      { name: "verify", description: "Start the verification process" },
      { name: "verification", description: "Configure verification settings" },
      { name: "autoverify", description: "Configure auto-verification" },
    ],
  },
  {
    id: "community",
    label: "Community",
    description: "Applications and staff management",
    icon: "👥",
    color: "#ec4899",
    commands: [
      { name: "apply", description: "Apply for a position" },
      { name: "app-admin", description: "Manage applications (admin)" },
    ],
  },
  {
    id: "search",
    label: "Search",
    description: "Search the web through the bot",
    icon: "🔍",
    color: "#3b82f6",
    commands: [
      { name: "search", description: "Search the web" },
    ],
  },
  {
    id: "birthday",
    label: "Birthday",
    description: "Track and celebrate member birthdays",
    icon: "🎂",
    color: "#f97316",
    commands: [
      { name: "birthday", description: "Set and manage birthdays" },
    ],
  },
  {
    id: "core",
    label: "Core",
    description: "Essential bot commands",
    icon: "⚙️",
    color: "#64748b",
    commands: [
      { name: "help", description: "View the help menu" },
      { name: "ping", description: "Check the bot's latency" },
      { name: "stats", description: "View bot statistics" },
      { name: "uptime", description: "View bot uptime" },
      { name: "invite", description: "Get the bot invite link" },
      { name: "support", description: "Get support links" },
      { name: "commands", description: "Browse all commands" },
      { name: "configWizard", description: "Interactive config wizard" },
    ],
  },
];

export function BloomCommandsShowcase() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = CATEGORIES.filter((cat) => {
    if (activeCategory !== "all" && cat.id !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        cat.label.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.commands.some((cmd) => cmd.name.includes(q) || cmd.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCommands = CATEGORIES.reduce((sum, c) => sum + c.commands.length, 0);

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${totalCommands} commands...`}
            className="pl-10 bg-background"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="rounded-full"
          >
            All ({totalCommands})
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c.id}
              variant={activeCategory === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(c.id)}
              className="rounded-full"
            >
              {c.icon} {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-border bg-card overflow-hidden glass-card">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="font-display text-lg font-semibold">{cat.label}</h3>
                <Badge variant="outline" className="text-[10px] ml-auto">{cat.commands.length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </div>
            <div className="p-3 space-y-1 max-h-48 overflow-y-auto">
              {cat.commands.map((cmd) => (
                <div key={cmd.name} className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                  <code className="text-xs font-mono text-[var(--fubrio-accent)] flex-shrink-0">/{cmd.name}</code>
                  <span className="text-xs text-muted-foreground">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No commands found. Try a different search.
        </div>
      )}
    </div>
  );
}
