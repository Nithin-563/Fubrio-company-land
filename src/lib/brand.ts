
export type BrandId = "fubrio" | "bloom";

export interface BrandConfig {
  id: BrandId;
  name: string;
  tagline: string;
  domain: string;
  accentColor: string;
  accentForeground: string;
  accentSoft: string;
  logoText: string;
  logoSubtitle: string;
  discordUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  communityEmail: string;
  supportEmail: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  navItems: Array<{ label: string; href: string; desc?: string }>;
  secondaryNavItems: Array<{ label: string; href: string }>;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  footerDescription: string;
  isBloom?: boolean;
  botInviteUrl?: string;
  botStatsFallback?: { servers: number; users: number; commands: number };
}

export const FUBRIO_CONFIG: BrandConfig = {
  id: "fubrio",
  name: "Fubrio",
  tagline: "Digital Technology & Creative Ecosystem",
  domain: "fubrio.in",
  accentColor: "#A0F2A0",
  accentForeground: "#0a0a0a",
  accentSoft: "rgba(160, 242, 160, 0.15)",
  logoText: "Fubrio",
  logoSubtitle: "",
  discordUrl: "https://discord.gg/UmcWh4VdGK",
  linkedinUrl: "https://www.linkedin.com/in/nithin-k-b8082a424",
  contactEmail: "hello@fubrio.in",
  communityEmail: "community@fubrio.in",
  supportEmail: "support@fubrio.in",
  metaTitle: "Fubrio - Digital Technology & Creative Ecosystem | Founded by K Nithin",
  metaDescription: "Fubrio builds products, software, AI tools, games, and creative experiments. A digital technology company by founder K Nithin.",
  metaKeywords: ["Fubrio", "K Nithin", "fubrio.in", "digital studio", "creative technology", "software development"],
  navItems: [
    { label: "Showcase", href: "#showcase", desc: "Projects, products, and creations" },
    { label: "Products", href: "#products", desc: "Digital marketplace" },
    { label: "Services", href: "#services", desc: "Custom development" },
    { label: "Partners", href: "#partners", desc: "Collaborations" },
    { label: "Community", href: "#community", desc: "Discord, events, blog" },
    { label: "Blog", href: "#blog", desc: "Updates and articles" },
    { label: "Shop", href: "#shop", desc: "Apps, games, and digital products" },
  ],
  secondaryNavItems: [
    { label: "About", href: "#about" },
    { label: "Sponsors", href: "#sponsors" },
    { label: "FAQ", href: "#faq" },
    { label: "Announcements", href: "#announcements" },
    { label: "API Keys", href: "#api-keys" },
    { label: "Docs", href: "#docs" },
    { label: "Pricing", href: "#subscriptions" },
    { label: "Contact", href: "#contact" },
  ],
  heroBadge: "Digital Technology & Creative Ecosystem",
  heroTitle: "Build remarkable things",
  heroSubtitle: "Products, software, AI tools, games, and creative experiments - all from one premium platform.",
  footerDescription: "Fubrio is a digital technology and creative ecosystem. We build products, software, games, AI tools, and creative experiments.",
};

export const BLOOM_CONFIG: BrandConfig = {
  id: "bloom",
  name: "Bloom",
  tagline: "The All-in-One Discord Bot",
  domain: "bloom.fubrio.in",
  accentColor: "#F472B6",       // pink
  accentForeground: "#0a0a0a",
  accentSoft: "rgba(244, 114, 182, 0.15)",
  logoText: "Bloom",
  logoSubtitle: "by Fubrio",
  discordUrl: "https://discord.gg/UmcWh4VdGK",
  linkedinUrl: "https://www.linkedin.com/in/nithin-k-b8082a424",
  contactEmail: "hello@fubrio.in",
  communityEmail: "community@fubrio.in",
  supportEmail: "support@fubrio.in",
  metaTitle: "Bloom - The All-in-One Discord Bot | by Fubrio",
  metaDescription: "Bloom is a free all-in-one Discord bot by Fubrio with 100+ commands across 21 categories including moderation, security (anti-raid, anti-nuke, anti-spam), music, economy, AI assistant, leveling, tickets, logging, welcome cards, giveaways, reaction roles, and more. Add Bloom to your Discord server for free.",
  metaKeywords: ["Bloom", "Bloom Discord bot", "Discord bot", "all-in-one Discord bot", "free Discord bot", "Discord moderation bot", "Discord music bot", "Discord security bot", "anti-raid Discord bot", "Fubrio", "multi-purpose Discord bot", "Discord economy bot", "Discord leveling bot", "Discord logging bot", "Discord ticket bot"],
  navItems: [
    { label: "Commands", href: "#commands", desc: "Explore all 100+ commands" },
    { label: "Docs", href: "#docs", desc: "Setup guide and documentation" },
    { label: "Blog", href: "#blog", desc: "Updates and guides" },
    { label: "Announcements", href: "#announcements", desc: "Latest news" },
    { label: "Contact", href: "#contact", desc: "Get support" },
  ],
  secondaryNavItems: [
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
  ],
  heroBadge: "The All-in-One Discord Bot",
  heroTitle: "Your server, blooming with possibilities",
  heroSubtitle: "Moderation, music, utility, fun, economy, logging, tickets, leveling - everything your Discord community needs in one bot. Built by Fubrio.",
  footerDescription: "Bloom is an all-in-one general-purpose Discord bot built by Fubrio. From moderation to music, economy to entertainment - Bloom does it all.",
  isBloom: true,
  botInviteUrl: "https://discord.com/oauth2/authorize?client_id=1550149986673631343",
  botStatsFallback: { servers: 0, users: 0, commands: 150 },
};

export const BRAND_CONFIGS: Record<BrandId, BrandConfig> = {
  fubrio: FUBRIO_CONFIG,
  bloom: BLOOM_CONFIG,
};

export function detectBrand(host: string): BrandId {
  if (!host) return "fubrio";
  const h = host.toLowerCase().trim();
  if (h.startsWith("bloom.") || h.startsWith("bloom-")) return "bloom";
  if (h === "localhost:3001" || h === "bloom.localhost:3000") return "bloom";
  return "fubrio";
}

export function getBrandConfig(brand: BrandId): BrandConfig {
  return BRAND_CONFIGS[brand] ?? FUBRIO_CONFIG;
}

export function applyBrandCssVars(brand: BrandConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--fubrio-accent", brand.accentColor);
  root.style.setProperty("--fubrio-accent-foreground", brand.accentForeground);
  root.style.setProperty("--fubrio-accent-soft", brand.accentSoft);
}
