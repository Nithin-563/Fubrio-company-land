import { headers } from "next/headers";


export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host") || headersList.get("x-forwarded-host") || "";
  const isBloom = host.toLowerCase().startsWith("bloom.");

  const today = new Date().toISOString().slice(0, 10);

  let urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [];

  if (isBloom) {
    urls = [
      { loc: "https://bloom.fubrio.in/", lastmod: today, changefreq: "weekly", priority: "1.0" },
      { loc: "https://bloom.fubrio.in/#commands", lastmod: today, changefreq: "weekly", priority: "0.9" },
      { loc: "https://bloom.fubrio.in/#docs", lastmod: today, changefreq: "monthly", priority: "0.8" },
      { loc: "https://bloom.fubrio.in/#subscriptions", lastmod: today, changefreq: "monthly", priority: "0.8" },
      { loc: "https://bloom.fubrio.in/#announcements", lastmod: today, changefreq: "daily", priority: "0.7" },
      { loc: "https://bloom.fubrio.in/#blog", lastmod: today, changefreq: "weekly", priority: "0.7" },
      { loc: "https://bloom.fubrio.in/#shop", lastmod: today, changefreq: "weekly", priority: "0.6" },
      { loc: "https://bloom.fubrio.in/#faq", lastmod: today, changefreq: "monthly", priority: "0.6" },
      { loc: "https://bloom.fubrio.in/#api-keys", lastmod: today, changefreq: "monthly", priority: "0.5" },
      { loc: "https://bloom.fubrio.in/#contact", lastmod: today, changefreq: "monthly", priority: "0.5" },
    ];
  } else {
    urls = [
      { loc: "https://fubrio.in/", lastmod: today, changefreq: "weekly", priority: "1.0" },
      { loc: "https://fubrio.in/#showcase", lastmod: today, changefreq: "weekly", priority: "0.9" },
      { loc: "https://fubrio.in/#products", lastmod: today, changefreq: "weekly", priority: "0.8" },
      { loc: "https://fubrio.in/#services", lastmod: today, changefreq: "monthly", priority: "0.8" },
      { loc: "https://fubrio.in/#blog", lastmod: today, changefreq: "weekly", priority: "0.7" },
      { loc: "https://fubrio.in/#shop", lastmod: today, changefreq: "weekly", priority: "0.7" },
      { loc: "https://fubrio.in/#docs", lastmod: today, changefreq: "monthly", priority: "0.7" },
      { loc: "https://fubrio.in/#announcements", lastmod: today, changefreq: "daily", priority: "0.6" },
      { loc: "https://fubrio.in/#subscriptions", lastmod: today, changefreq: "monthly", priority: "0.6" },
      { loc: "https://fubrio.in/#api-keys", lastmod: today, changefreq: "monthly", priority: "0.5" },
      { loc: "https://fubrio.in/#faq", lastmod: today, changefreq: "monthly", priority: "0.5" },
      { loc: "https://fubrio.in/#contact", lastmod: today, changefreq: "monthly", priority: "0.5" },
      { loc: "https://fubrio.in/#about", lastmod: today, changefreq: "monthly", priority: "0.4" },
      { loc: "https://fubrio.in/#sponsors", lastmod: today, changefreq: "monthly", priority: "0.4" },
    ];
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
    ${u.priority ? `<priority>${u.priority}</priority>` : ""}
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
