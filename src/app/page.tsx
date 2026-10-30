import {
  getFeaturedProjects, getProducts, getRecentPosts, getSponsors, getPartners,
  getFeaturedServices, getTestimonials, getMetrics, getFaqs, getEvents,
  getFooterColumns, getCategories, getAdminPages, getTeamMembers, getDonators, getShopItems,
} from "@/lib/content";
import { PageClient } from "@/components/page-client";
import { isSupabaseConfigured } from "@/lib/supabase";
import { db } from "@/lib/db";
import { detectBrand, getBrandConfig } from "@/lib/brand";
import { headers } from "next/headers";
import { FubFindzStore } from "@/components/fubfindz-store";

export const dynamic = "force-dynamic";

function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    const parts: string[] = [];
    if (e.message) parts.push(String(e.message));
    if (e.code) parts.push(`[code: ${e.code}]`);
    if (e.details) parts.push(`[details: ${e.details}]`);
    if (e.hint) parts.push(`[hint: ${e.hint}]`);
    if (parts.length > 0) return parts.join(" ");
    try {
      return JSON.stringify(err, null, 2);
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "";
  // Serve the dedicated FubFindz storefront on its subdomain without requiring Fubrio CMS data.
  if (host.toLowerCase().split(":")[0] === "fubfindz.fubrio.in") {
    return <FubFindzStore />;
  }
  const brandId = detectBrand(host);
  const brandConfig = getBrandConfig(brandId);

  const brandStyle = (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        --fubrio-accent: ${brandConfig.accentColor};
        --fubrio-accent-foreground: ${brandConfig.accentForeground};
        --fubrio-accent-soft: ${brandConfig.accentSoft};
      }
    `}} />
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground">
        <div className="max-w-xl w-full text-center">
          <div className="font-display text-4xl font-bold mb-3">Fubrio</div>
          <h1 className="font-display text-2xl font-semibold mb-2">Supabase not configured</h1>
          <p className="text-muted-foreground mb-6">
            This app needs Supabase to function. Follow the setup steps below to get it running.
          </p>
          <div className="text-left rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">1. Create a Supabase project</div>
              <div className="text-muted-foreground">Go to <a className="text-[var(--fubrio-accent)] underline" href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a new project.</div>
            </div>
            <div>
              <div className="font-semibold mb-1">2. Run the SQL schema</div>
              <div className="text-muted-foreground">In Supabase → SQL Editor → New query → paste the contents of <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">supabase/schema.sql</code> → Run.</div>
            </div>
            <div>
              <div className="font-semibold mb-1">3. Get your API credentials</div>
              <div className="text-muted-foreground">Supabase → Project Settings → API → copy the Project URL and the <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">anon public</code> key.</div>
            </div>
            <div>
              <div className="font-semibold mb-1">4. Edit <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">.env</code></div>
              <div className="text-muted-foreground">
                Set these 4 variables:
                <pre className="mt-2 text-xs bg-secondary p-2 rounded overflow-x-auto">{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000`}</pre>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">5. Seed content</div>
              <div className="text-muted-foreground">Run <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">bun run seed</code> to populate the database with projects, products, and admin users.</div>
            </div>
            <div>
              <div className="font-semibold mb-1">6. Restart the dev server</div>
              <div className="text-muted-foreground">Stop the server (Ctrl+C) and run <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">bun run dev</code> again.</div>
            </div>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Or run <code className="font-mono">./setup.sh</code> for an interactive walkthrough.
          </div>
        </div>
      </div>
    );
  }

  let data: any = {
    projects: [], products: [], posts: [], sponsors: [], partners: [],
    services: [], testimonials: [], metrics: [], faqs: [], events: [],
    footerColumns: [], categories: [], pages: [], teamMembers: [], donators: [], shopItems: [],
    settings: {},
  };

  const errors: string[] = [];

  const tryQuery = async <T,>(name: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      errors.push(`${name}: ${extractErrorMessage(err)}`);
      return fallback;
    }
  };

  const [
    projects, products, posts, sponsors, partners,
    services, testimonials, metrics, faqs, events,
    footerColumns, categories, pages, teamMembers, donators, shopItems,
    settingsRows,
  ] = await Promise.all([
    tryQuery("projects", () => getFeaturedProjects(12, brandId), []),
    tryQuery("products", () => getProducts({ limit: 20, brand: brandId }), []),
    tryQuery("posts", () => getRecentPosts(6, brandId), []),
    tryQuery("sponsors", () => getSponsors(brandId), []),
    tryQuery("partners", () => getPartners(brandId), []),
    tryQuery("services", () => getFeaturedServices(brandId), []),
    tryQuery("testimonials", () => getTestimonials(6, brandId), []),
    tryQuery("metrics", () => getMetrics(), []),
    tryQuery("faqs", () => getFaqs(brandId), []),
    tryQuery("events", () => getEvents(5, brandId), []),
    tryQuery("footerColumns", () => getFooterColumns(), []),
    tryQuery("categories", () => getCategories(), []),
    tryQuery("pages", () => getAdminPages(), []),
    tryQuery("teamMembers", () => getTeamMembers(), []),
    tryQuery("donators", () => getDonators(), []),
    tryQuery("shopItems", () => getShopItems(brandId), []),
    tryQuery("settings", async () => {
      const rows = await db.siteSetting.findMany();
      const out: Record<string, string> = {};
      for (const r of rows) {
        if (r && r.key) {
          if (r.key.startsWith("donation.") || r.key.startsWith("brand.") || r.key.startsWith("social.") || r.key.startsWith("seo.") || r.key.startsWith("email.") || r.key.startsWith("contact.")) {
            out[r.key] = r.value;
          }
        }
      }
      return out;
    }, {}),
  ]);

  data = {
    projects, products, posts, sponsors, partners,
    services, testimonials, metrics, faqs, events,
    footerColumns, categories, pages, teamMembers, donators, shopItems,
    settings: settingsRows,
  };

  if (errors.length === 17) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="font-display text-4xl font-bold mb-3">Fubrio</div>
            <h1 className="font-display text-2xl font-semibold mb-2">Database connection failed</h1>
            <p className="text-muted-foreground">
              All queries failed. Here are the errors:
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-6 space-y-3">
            {errors.map((e, i) => (
              <div key={i} className="text-xs font-mono text-destructive whitespace-pre-wrap break-all border-b border-border last:border-0 pb-2 last:pb-0">
                {e}
              </div>
            ))}
          </div>
          <div className="text-left rounded-xl border border-border bg-card p-5 space-y-4 text-sm">
            <div className="pl-3 border-l-2 border-border">
              <div className="font-medium">Most likely causes:</div>
              <div className="text-muted-foreground mt-1">
                <div>1. Tables not created - run <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">supabase/schema.sql</code> in Supabase SQL Editor</div>
                <div>2. RLS blocking reads - the schema.sql now includes RLS policies, re-run it</div>
                <div>3. Wrong anon key - must be the <strong>anon public</strong> key, not service_role</div>
                <div>4. Tables are empty - run <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">bun run seed</code> locally</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div>
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-600 dark:text-amber-400">
          ⚠ {errors.length} query(ies) failed: {errors.join("; ").slice(0, 200)}...
        </div>
        <PageClient data={data} />
      </div>
    );
  }

  return (
    <>
      {brandStyle}
      <PageClient data={data} brandId={brandId} />
    </>
  );
}
