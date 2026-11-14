"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, ArrowLeft, ArrowUpRight } from "lucide-react";
import { getBrandConfig, applyBrandCssVars } from "@/lib/brand";
import type { BrandId, BrandConfig } from "@/lib/brand";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { FeaturedShowcase } from "@/components/site/featured-showcase";
import { Ecosystem } from "@/components/site/ecosystem";
import { ServicesGrid } from "@/components/site/services-grid";
import { SponsorsMarquee } from "@/components/site/sponsors-marquee";
import { PartnersGrid } from "@/components/site/partners-grid";
import { Community } from "@/components/site/community";
import { Testimonials } from "@/components/site/testimonials";
import { DonatorsSection } from "@/components/site/donators-section";
import { BlogPreview } from "@/components/site/blog-preview";
import { TeamSection } from "@/components/site/team-section";
import { DonationBanner } from "@/components/site/donation-banner";
import { ContactCTA } from "@/components/site/contact-cta";
import { SearchOverlay } from "@/components/site/search-overlay";
import { useHashRoute, navigate } from "@/lib/router";
import type {
  SerializedProject, SerializedProduct, SerializedPost, SerializedSponsor,
  SerializedPartner, SerializedService, SerializedTestimonial, SerializedMetric,
  SerializedFaq, SerializedEvent, SerializedFooterColumn, SerializedCategory,
  SerializedPage,
} from "@/lib/types";

const viewLoading = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
  </div>
);

const AdminRouter = dynamic(
  () => import("@/components/admin/admin-router").then((m) => m.AdminRouter),
  { loading: viewLoading, ssr: false },
);

const LegalView = dynamic(
  () => import("@/components/site/legal-view").then((m) => m.LegalView),
  { ssr: false },
);

const AdvertiseView = dynamic(
  () => import("@/components/site/advertise-view").then((m) => m.AdvertiseView),
  { ssr: false },
);

const CzerPanel = dynamic(
  () => import("@/components/admin/czer-panel").then((m) => m.CzerPanel),
  { loading: viewLoading, ssr: false },
);

const ShowcaseView = dynamic(() => import("@/components/showcase/showcase-view").then((m) => m.ShowcaseView), { loading: viewLoading });
const ProjectDetail = dynamic(() => import("@/components/showcase/project-detail").then((m) => m.ProjectDetail), { loading: viewLoading });
const ProductsView = dynamic(() => import("@/components/products/products-view").then((m) => m.ProductsView), { loading: viewLoading });
const ProductDetail = dynamic(() => import("@/components/products/products-view").then((m) => m.ProductDetail), { loading: viewLoading });
const BlogView = dynamic(() => import("@/components/blog/blog-view").then((m) => m.BlogView), { loading: viewLoading });
const BlogDetail = dynamic(() => import("@/components/blog/blog-view").then((m) => m.BlogDetail), { loading: viewLoading });
const FaqView = dynamic(() => import("@/components/site/faq-view").then((m) => m.FaqView), { loading: viewLoading });
const ShopView = dynamic(() => import("@/components/site/shop-view").then((m) => m.ShopView), { loading: viewLoading });
const AnnouncementsView = dynamic(() => import("@/components/site/announcements-view").then((m) => m.AnnouncementsView), { loading: viewLoading });
const ApiKeysView = dynamic(() => import("@/components/site/api-keys-view").then((m) => m.ApiKeysView), { loading: viewLoading });
const DocsView = dynamic(() => import("@/components/site/docs-view").then((m) => m.DocsView), { loading: viewLoading });
const SubscriptionsView = dynamic(() => import("@/components/site/subscriptions-view").then((m) => m.SubscriptionsView), { loading: viewLoading });
const CustomerChatView = dynamic(() => import("@/components/site/customer-chat-view").then((m) => m.CustomerChatView), { loading: viewLoading });
const StaticPage = dynamic(() => import("@/components/site/static-page").then((m) => m.StaticPage), { loading: viewLoading });
const FloatingAnnouncementsButton = dynamic(() => import("@/components/site/floating-announcements-button").then((m) => m.FloatingAnnouncementsButton), { ssr: false });
const BloomCommandsShowcase = dynamic(() => import("@/components/site/bloom-commands-showcase").then((m) => m.BloomCommandsShowcase), { loading: viewLoading });
const BloomBotStatus = dynamic(() => import("@/components/site/bloom-bot-status").then((m) => m.BloomBotStatus), { loading: viewLoading });
const BloomHomeView = dynamic(() => import("@/components/site/bloom-home-view").then((m) => m.BloomHomeView), { loading: viewLoading });
const BloomDocsView = dynamic(() => import("@/components/site/bloom-docs-view").then((m) => m.BloomDocsView), { loading: viewLoading });

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

  if (effectiveBase === "terms" || effectiveBase === "privacy" || effectiveBase === "cookies") {
    return <LegalView kind={effectiveBase} />;
  }

  if (effectiveBase === "advertise") {
    return <AdvertiseView communityEmail={data.settings?.["email.community"]} />;
  }

  if (effectiveBase === "showcase" && effectiveSub) {
    const project = data.projects.find((p) => p.slug === effectiveSub);
    if (!project) return <NotFoundShell onBack={() => navigate("#showcase")} entity="project" brand={brand} />;
    const related = data.projects
      .filter((p) => p.slug !== project.slug && (p.category?.id === project.category?.id || p.featured))
      .slice(0, 3);
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

  const reserved = new Set([
    "home", "showcase", "products", "blog", "contact", "faq", "shop",
    "announcements", "api-keys", "docs", "chat", "subscriptions", "commands",
  ]);

  if (mounted && !reserved.has(effectiveBase)) {
    const cmsPage = data.pages.find((p) => p.slug === effectiveBase);
    if (cmsPage) {
      return (
        <Chrome
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          footerColumns={data.footerColumns}
          showFloatingAnnouncements={false}
          brand={brand}
        >
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
      {effectiveBase === "docs" && (brand.isBloom ? (
        <BloomDocsView botInviteUrl={brand.botInviteUrl} discordUrl={brand.discordUrl} />
      ) : (
        <DocsView />
      ))}
      {effectiveBase === "chat" && <CustomerChatView />}
      {effectiveBase === "subscriptions" && !brand.isBloom && <SubscriptionsView />}
      {effectiveBase === "subscriptions" && brand.isBloom && (
        <div className="mx-auto max-w-[84rem] px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">Bloom is completely free — no subscriptions needed.</p>
          <button onClick={() => navigate("#home")} className="btn-line mt-4">
            Back to home
          </button>
        </div>
      )}
      {effectiveBase === "commands" && brand.isBloom && (
        <div className="py-12">
          <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("#home")}
              className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <div className="eyebrow">Commands</div>
            <h1 className="display-heading mt-2 text-[2.6rem]">Everything Bloom can do</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Every command across 21 categories, with the permission each one needs.
            </p>
            <div className="mt-6"><BloomBotStatus fallback={brand.botStatsFallback} /></div>
            <div className="mt-8"><BloomCommandsShowcase /></div>
          </div>
        </div>
      )}
      {effectiveBase === "commands" && !brand.isBloom && (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            The command reference lives on the Bloom site — bloom.fubrio.in/#commands
          </p>
        </div>
      )}
      {brand.isBloom ? (
        <BloomHomeView data={data} brand={brand} />
      ) : (
        (effectiveBase === "home" || effectiveBase === "services" || effectiveBase === "partners" || effectiveBase === "sponsors" || effectiveBase === "community" || effectiveBase === "contact" || effectiveBase === "about" || effectiveBase === "careers" || effectiveBase === "changelog" || effectiveBase === "roadmap") && (
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
    <div className="relative z-[1] flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40">
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

      <section className="border-b border-border py-6">
        <div className="mx-auto max-w-[84rem] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="eyebrow">Also running</span>
              <span className="text-sm">
                <span className="font-medium">FubFindz</span>{" "}
                <span className="text-muted-foreground">— a storefront for Amazon India finds.</span>
              </span>
            </div>
            <a href="https://fubfindz.fubrio.in" className="link-arrow shrink-0 text-foreground">
              Open the store <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Ecosystem />
      <ServicesGrid services={data.services} categories={data.categories} />
      <Community events={data.events} />
      <PartnersGrid partners={data.partners} />
      <SponsorsMarquee sponsors={data.sponsors} />
      <TeamSection members={data.teamMembers} />
      <Testimonials testimonials={data.testimonials} />
      <DonatorsSection donators={data.donators} />
      <BlogPreview posts={data.posts} />
      {data.faqs && data.faqs.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[84rem] px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="eyebrow">07 — Questions</div>
                <h2 className="display-heading mt-2 text-[2rem] leading-tight sm:text-[2.5rem]">
                  Answers before you ask.
                </h2>
                <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
                  Pricing, timelines, ownership and how the products are supported. The full list
                  lives on the FAQ page.
                </p>
                <button onClick={() => navigate("#faq")} className="link-arrow mt-4 text-muted-foreground">
                  All questions <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="lg:col-span-8 lg:border-l lg:border-border lg:pl-12">
                <dl className="border-t border-border">
                  {data.faqs.slice(0, 6).map((faq) => (
                    <div key={faq.id} className="border-b border-border py-4">
                      <dt className="text-[0.9375rem]">{faq.question}</dt>
                      <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>
      )}

      <ContactCTA settings={data.settings} />
    </>
  );
}

function NotFoundShell({ onBack, entity, brand }: { onBack: () => void; entity: string; brand: BrandConfig }) {
  return (
    <div className="relative z-[1] flex min-h-screen flex-col bg-background">
      <Navbar onOpenSearch={() => {}} brand={brand} />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-sm">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Error 404</div>
          <h1 className="display-heading mt-2 text-[2.6rem] capitalize">{entity} not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This page may have been unpublished or renamed since the link was shared.
          </p>
          <button onClick={onBack} className="btn-line mt-6">
            Go back
          </button>
        </div>
      </main>
      <Footer columns={[]} brand={brand} />
    </div>
  );
}
