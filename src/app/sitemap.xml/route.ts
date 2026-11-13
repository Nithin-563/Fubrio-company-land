import { headers } from "next/headers";

type Entry = { loc: string; changefreq: string; priority: string; lastmod?: string };

const FUBRIO_ENTRIES: Entry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/#showcase", changefreq: "weekly", priority: "0.9" },
  { loc: "/#services", changefreq: "monthly", priority: "0.9" },
  { loc: "/#capabilities", changefreq: "monthly", priority: "0.8" },
  { loc: "/#products", changefreq: "weekly", priority: "0.8" },
  { loc: "/#partners", changefreq: "monthly", priority: "0.7" },
  { loc: "/#community", changefreq: "weekly", priority: "0.7" },
  { loc: "/#blog", changefreq: "weekly", priority: "0.7" },
  { loc: "/#shop", changefreq: "weekly", priority: "0.7" },
  { loc: "/#donators", changefreq: "monthly", priority: "0.6" },
  { loc: "/#docs", changefreq: "monthly", priority: "0.6" },
  { loc: "/#announcements", changefreq: "daily", priority: "0.6" },
  { loc: "/#subscriptions", changefreq: "monthly", priority: "0.6" },
  { loc: "/#faq", changefreq: "monthly", priority: "0.5" },
  { loc: "/#api-keys", changefreq: "monthly", priority: "0.5" },
  { loc: "/#contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/#about", changefreq: "monthly", priority: "0.4" },
  { loc: "/#team", changefreq: "monthly", priority: "0.4" },
  { loc: "/#advertise", changefreq: "monthly", priority: "0.5" },
  { loc: "/#terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/#privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/#cookies", changefreq: "yearly", priority: "0.3" },
  { loc: "/#sponsors", changefreq: "monthly", priority: "0.4" },
];

const BLOOM_ENTRIES: Entry[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/#commands", changefreq: "weekly", priority: "0.9" },
  { loc: "/#docs", changefreq: "monthly", priority: "0.8" },
  { loc: "/#blog", changefreq: "weekly", priority: "0.7" },
  { loc: "/#announcements", changefreq: "daily", priority: "0.7" },
  { loc: "/#shop", changefreq: "weekly", priority: "0.6" },
  { loc: "/#faq", changefreq: "monthly", priority: "0.6" },
  { loc: "/#api-keys", changefreq: "monthly", priority: "0.5" },
  { loc: "/#contact", changefreq: "monthly", priority: "0.5" },
];

export async function GET() {
  const headersList = await headers();
  const host = (headersList.get("host") || headersList.get("x-forwarded-host") || "").toLowerCase();
  const isBloom = host.startsWith("bloom.");
  const origin = isBloom ? "https://bloom.fubrio.in" : "https://fubrio.in";
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = isBloom ? BLOOM_ENTRIES : FUBRIO_ENTRIES;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${origin}${e.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
