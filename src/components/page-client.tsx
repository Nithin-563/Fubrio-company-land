"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, ArrowLeft } from "lucide-react";
import { getBrandConfig, applyBrandCssVars } from "@/lib/brand";
import type { BrandId, BrandConfig } from "@/lib/brand";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { Metrics } from "@/components/site/metrics";
import { FeaturedShowcase } from "@/components/site/featured-showcase";
import { Ecosystem } from "@/components/site/ecosystem";
import { ServicesGrid } from "@/components/site/services-grid";
import { SponsorsMarquee } from "@/components/site/sponsors-marquee";
import { PartnersGrid } from "@/components/site/partners-grid";
import { Community } from "@/components/site/community";
import { Testimonials } from "@/components/site/testimonials";
import { BlogPreview } from "@/components/site/blog-preview";
import { TeamSection } from "@/components/site/team-section";
import { DonationBanner } from "@/components/site/donation-banner";
import { DonatorsSection } from "@/components/site/donators-section";
import { ShopView } from "@/components/site/shop-view";
import { AnnouncementsView } from "@/components/site/announcements-view";
import { FloatingAnnouncementsButton } from "@/components/site/floating-announcements-button";
import { ApiKeysView } from "@/components/site/api-keys-view";
import { DocsView } from "@/components/site/docs-view";
import { CustomerChatView } from "@/components/site/customer-chat-view";
import { SubscriptionsView } from "@/components/site/subscriptions-view";
import { BloomCommandsShowcase } from "@/components/site/bloom-commands-showcase";
import { BloomBotStatus } from "@/components/site/bloom-bot-status";
import { BloomDashboardPlaceholder } from "@/components/site/bloom-dashboard";
import { BloomHomeView } from "@/components/site/bloom-home-view";
import { BloomDocsView } from "@/components/site/bloom-docs-view";
import { ContactCTA } from "@/components/site/contact-cta";
import { SearchOverlay } from "@/components/site/search-overlay";
import { FaqView } from "@/components/site/faq-view";
import { StaticPage } from "@/components/site/static-page";
import { ShowcaseView } from "@/components/showcase/showcase-view";
import { ProjectDetail } from "@/components/showcase/project-detail";
import { ProductsView, ProductDetail } from "@/components/products/products-view";
import { BlogView, BlogDetail } from "@/components/blog/blog-view";
import { useHashRoute, navigate } from "@/lib/router";
import type {
  SerializedProject, SerializedProduct, SerializedPost, SerializedSponsor,
  SerializedPartner, SerializedService, SerializedTestimonial, SerializedMetric,
  SerializedFaq, SerializedEvent, SerializedFooterColumn, SerializedCategory,
  SerializedPage,
} from "@/lib/types";

const AdminRouter = dynamic(
  () => import("@/components/admin/admin-router").then((m) => m.AdminRouter),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
    ssr: false,
  },
);

const CzerPanel = dynamic(
  () => import("@/components/admin/czer-panel").then((m) => m.CzerPanel),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
    ssr: false,
  },
);

export interface PageData {
  projects: SerializedProject[];
  products: SerializedProduct[];
  posts: SerializedPost[];
  sponsors: SerializedSponsor[];
  partners: SerializedPartner[];
  services: SerializedService[];
  testimonials: SerializedTestimonial[];
  metrics: SerializedMetric[];
  faqs: SerializedFaq[];
  events: SerializedEvent[];
  footerColumns: SerializedFooterColumn[];
  categories: SerializedCategory[];
  pages: SerializedPage[];
  teamMembers: any[];
  donators: any[];
  shopItems: any[];
  settings: Record<string, string>;
}

export function PageClient({ data, brandId = "fubrio" }: { data: PageData; brandId?: BrandId }) {
  const brand = getBrandConfig(brandId);

  useEffect(() => {
    applyBrandCssVars(brand);
  }, [brand]);

  useEffect(() => {
    document.title = brand.metaTitle;
  }, [brand]);
  const route = useHashRoute();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailData, setDetailData] = useState<{
    project?: SerializedProject;
    related?: SerializedProject[];
    product?: SerializedProduct;
    post?: SerializedPost;
  }>({});

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);

    try {
      let visitorId = localStorage.getItem("fubrio_visitor_id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("fubrio_visitor_id", visitorId);
      }
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          path: window.location.hash || "#home",
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    } catch {}

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = useMemo(() => {
    const clean = route.startsWith("#") ? route.slice(1) : route;
    const parts = clean.split("/").filter(Boolean);
    return { full: route, parts, base: parts[0] ?? "home", sub: parts[1] };
  }, [route]);

  const effectiveBase = mounted ? parsed.base : "home";
  const effectiveSub = mounted ? parsed.sub : undefined;

  if (effectiveBase === "czer") {
    return <CzerPanel onClose={() => navigate("#home")} />;
  }

  if (effectiveBase === "admin") {
    return <AdminRouter />;
  }

  if (effectiveBase === "showcase" && effectiveSub) {
    const project = data.projects.find((p) => p.slug === effectiveSub);
    if (!project) return <NotFoundShell onBack={() => navigate("#showcase")} entity="project" brand={brand} />;
    const related = data.projects.filter((p) => p.slug !== project.slug && (p.category?.id === project.category?.id || p.featured)).slice(0, 3);
    return (
      <Chrome searchOpen={searchOpen} setSearchOpen={setSearchOpen} footerColumns={data.footerColumns} brand={brand}>
        <ProjectDetail project={project} related={related} />
      </Chrome>
    );
  }
  if (effectiveBase === "products" && effectiveSub) {
    const product = data.products.find((p) => p.slug === effectiveSub);
    if (!product) return <NotFoundShell onBack={() => navigate("#products")} entity="product" brand={brand} />;
    return (
      <Chrome searchOpen={searchOpen} setSearchOpen={setSearchOpen} footerColumns={data.footerColumns} brand={brand}>
        <ProductDetail product={product} />
      </Chrome>
    );
  }
  if (effectiveBase === "blog" && effectiveSub) {
    const post = data.posts.find((p) => p.slug === effectiveSub);
    if (!post) return <NotFoundShell onBack={() => navigate("#blog")} entity="article" brand={brand} />;
    return (
      <Chrome searchOpen={searchOpen} setSearchOpen={setSearchOpen} footerColumns={data.footerColumns} brand={brand}>
        <BlogDetail post={post} />
      </Chrome>
    );
  }

  if (mounted && effectiveBase !== "home" && effectiveBase !== "showcase" && effectiveBase !== "products" && effectiveBase !== "blog" && effectiveBase !== "contact" && effectiveBase !== "faq" && effectiveBase !== "shop" && effectiveBase !== "announcements" && effectiveBase !== "api-keys" && effectiveBase !== "docs" && effectiveBase !== "chat" && effectiveBase !== "subscriptions" && effectiveBase !== "commands") {
    const cmsPage = data.pages.find((p) => p.slug === effectiveBase);
    if (cmsPage) {
      return (
        <Chrome searchOpen={searchOpen} setSearchOpen={setSearchOpen} footerColumns={data.footerColumns} showFloatingAnnouncements={false} brand={brand}>
          <StaticPage page={cmsPage} />
        </Chrome>
      );
    }
  }

  return (
    <Chrome searchOpen={searchOpen} setSearchOpen={setSearchOpen} footerColumns={data.footerColumns} brand={brand}>
      {effectiveBase === "showcase" && <ShowcaseView projects={data.projects} categories={data.categories} />}
      {effectiveBase === "products" && <ProductsView products={data.products} categories={data.categories} />}
      {effectiveBase === "blog" && <BlogView posts={data.posts} />}
      {effectiveBase === "faq" && <FaqView faqs={data.faqs} />}
      {effectiveBase === "shop" && <ShopView items={data.shopItems} settings={data.settings} />}
      {effectiveBase === "announcements" && <AnnouncementsView />}
      {effectiveBase === "api-keys" && <ApiKeysView />}
      {effectiveBase === "docs" && (brand.isBloom
        ? <BloomDocsView botInviteUrl={brand.botInviteUrl} discordUrl={brand.discordUrl} />
        : <DocsView />)}
      {effectiveBase === "chat" && <CustomerChatView />}
      {effectiveBase === "subscriptions" && !brand.isBloom && <SubscriptionsView />}
      {effectiveBase === "subscriptions" && brand.isBloom && (
        <div className="pt-4 pb-24 min-h-screen">
          <div className="mx-auto max-w-3xl px-4 text-center pt-20">
            <div className="text-sm text-muted-foreground">Bloom is completely free - no subscriptions needed.</div>
            <Button onClick={() => navigate("#home")} variant="outline" className="rounded-full mt-4">Back to home</Button>
          </div>
        </div>
      )}
      {effectiveBase === "commands" && brand.isBloom && (
        <div className="pt-4 pb-24 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <button onClick={() => navigate("#home")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-6">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </button>
            <div className="text-xs uppercase tracking-wider text-[var(--fubrio-accent)] font-semibold">Commands</div>
            <h1 className="display-heading mt-2 text-4xl sm:text-5xl">Browse all commands</h1>
            <p className="mt-2 text-muted-foreground">Explore every Bloom command across 21 categories.</p>
            <div className="mt-6"><BloomBotStatus fallback={brand.botStatsFallback} /></div>
            <div className="mt-8"><BloomCommandsShowcase /></div>
          </div>
        </div>
      )}
      {effectiveBase === "commands" && !brand.isBloom && (
        <div className="pt-4 pb-24 min-h-screen">
          <div className="mx-auto max-w-3xl px-4 text-center pt-20">
            <div className="text-sm text-muted-foreground">Commands page is available on the Bloom website at bloom.fubrio.in/#commands</div>
          </div>
        </div>
      )}
      {brand.isBloom ? (
        <BloomHomeView data={data} brand={brand} />
      ) : (
        (effectiveBase === "home" || effectiveBase === "services" || effectiveBase === "partners" || effectiveBase === "sponsors" || effectiveBase === "community" || effectiveBase === "contact" || effectiveBase === "about" || effectiveBase === "careers" || effectiveBase === "changelog" || effectiveBase === "roadmap" || effectiveBase === "privacy" || effectiveBase === "terms") && (
          <HomeView data={data} brand={brand} />
        )
      )}
    </Chrome>
  );
}

function Chrome({
  children, searchOpen, setSearchOpen, footerColumns, showFloatingAnnouncements = true, brand,
}: {
  children: React.ReactNode;
  searchOpen: boolean;
  setSearchOpen: (o: boolean) => void;
  footerColumns: SerializedFooterColumn[];
  showFloatingAnnouncements?: boolean;
  brand: BrandConfig;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-50">
        <DonationBanner />
        <Navbar onOpenSearch={() => setSearchOpen(true)} brand={brand} />
      </div>
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="flex-1">{children}</main>
      <Footer columns={footerColumns} brand={brand} />
      {showFloatingAnnouncements && <FloatingAnnouncementsButton />}
    </div>
  );
}

function HomeView({ data, brand }: { data: PageData; brand: BrandConfig }) {
  return (
    <>
      <Hero projects={data.projects} metrics={data.metrics} />
      <FeaturedShowcase projects={data.projects} />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fubrio-accent)]">Now open</div>
            <h2 className="display-heading mt-3 text-3xl sm:text-4xl">FubFindz Store</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Discover products and explore current offers on Amazon India through FubFindz, by Fubrio.</p>
          </div>
          <a href="https://fubfindz.fubrio.in" className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90">
            Open FubFindz Store <span aria-hidden="true" className="ml-2">↗</span>
          </a>
        </div>
      </section>
      <Ecosystem />
      <ServicesGrid services={data.services} categories={data.categories} />
      <SponsorsMarquee sponsors={data.sponsors} />
      <PartnersGrid partners={data.partners} />
      <Community events={data.events} />
      <TeamSection members={data.teamMembers} />
      <Testimonials testimonials={data.testimonials} />
      <BlogPreview posts={data.posts} />
      <DonatorsSection donators={data.donators} />
      <ContactCTA settings={data.settings} />
    </>
  );
}

function NotFoundShell({ onBack, entity, brand }: { onBack: () => void; entity: string; brand: BrandConfig }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenSearch={() => {}} brand={brand} />
      <main className="flex-1 flex items-center justify-center pt-32 pb-24">
        <div className="text-center">
          <div className="font-display text-7xl font-bold text-[var(--fubrio-accent)]">404</div>
          <h1 className="mt-4 font-display text-2xl font-semibold">{entity[0].toUpperCase() + entity.slice(1)} not found</h1>
          <p className="mt-2 text-muted-foreground">This content may have been removed or unpublished.</p>
          <button onClick={onBack} className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-accent">
            Go back
          </button>
        </div>
      </main>
      <Footer columns={[]} />
    </div>
  );
}
