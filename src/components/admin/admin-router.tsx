"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell, type AdminSection } from "@/components/admin/admin-shell";
import { AdminOverview } from "@/components/admin/admin-overview";
import { ProjectsAdmin } from "@/components/admin/projects-admin";
import { ProductsAdmin } from "@/components/admin/products-admin";
import { SponsorsAdmin } from "@/components/admin/sponsors-admin";
import { PartnersAdmin } from "@/components/admin/partners-admin";
import { BlogAdmin, ServicesAdmin, TestimonialsAdmin, FaqsAdmin, EventsAdmin } from "@/components/admin/content-admin";
import { InquiriesAdmin } from "@/components/admin/inquiries-admin";
import { MediaLibrary } from "@/components/admin/media-library";
import { UsersAdmin } from "@/components/admin/users-admin";
import { SettingsAdmin } from "@/components/admin/settings-admin";
import { CategoriesAdmin, AuditLogAdmin } from "@/components/admin/system-admin";
import { PagesAdmin } from "@/components/admin/pages-admin";
import { LinksAdmin } from "@/components/admin/links-admin";
import { TeamAdmin } from "@/components/admin/team-admin";
import { NewsletterAdmin } from "@/components/admin/newsletter-admin";
import { DonationAdmin } from "@/components/admin/donation-admin";
import { DonatorsAdmin } from "@/components/admin/donators-admin";
import { AnalyticsAdmin } from "@/components/admin/analytics-admin";
import { EmailAdmin } from "@/components/admin/email-admin";
import { ShopAdmin } from "@/components/admin/shop-admin";
import { ShopRequestsAdmin } from "@/components/admin/shop-requests-admin";
import { EmployeesAdmin } from "@/components/admin/employees-admin";
import { AnnouncementsAdmin } from "@/components/admin/announcements-admin";
import { ChatAdmin } from "@/components/admin/chat-admin";
import { ApiKeysAdmin } from "@/components/admin/api-keys-admin";
import { ExampleAdmin } from "@/components/admin/example-admin";
import { CustomerChatAdmin } from "@/components/admin/customer-chat-admin";
import { SubscriptionsAdmin } from "@/components/admin/subscriptions-admin";
import { BugReportsAdmin } from "@/components/admin/bug-reports-admin";
import { BloomStatsAdmin } from "@/components/admin/bloom-stats-admin";
import type { SerializedCategory } from "@/lib/types";

const VALID_SECTIONS: AdminSection[] = [
  "overview", "projects", "products", "services", "blog", "testimonials",
  "faqs", "events", "sponsors", "partners", "links", "pages", "categories", "team", "newsletter", "donation", "donators", "analytics", "email", "shop", "shopRequests",
  "announcements",
  "media", "inquiries", "users", "employees", "chat", "apiKeys", "example", "customerChat", "bugReports", "bloomStats", "subscriptions", "audit", "settings",
];

function getSectionFromHash(): AdminSection {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash;
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  const sub = parts[1] as AdminSection;
  return VALID_SECTIONS.includes(sub) ? sub : "overview";
}

export function AdminRouter() {
  const { data: session, status } = useSession();
  const [adminSection, setAdminSection] = useState<AdminSection>(getSectionFromHash());
  const [categories, setCategories] = useState<SerializedCategory[]>([]);

  useEffect(() => {
    const onHashChange = () => setAdminSection(getSectionFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setCategories(json.data); })
      .catch(() => {});
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) return <AdminLogin />;

  return (
    <AdminShell active={adminSection} onChange={(s) => { setAdminSection(s); if (typeof window !== "undefined") window.location.hash = `#admin/${s}`; }}>
      {adminSection === "overview" && <AdminOverview onNavigate={setAdminSection} />}
      {adminSection === "projects" && <ProjectsAdmin categories={categories} />}
      {adminSection === "products" && <ProductsAdmin categories={categories} />}
      {adminSection === "services" && <ServicesAdmin categories={categories} />}
      {adminSection === "blog" && <BlogAdmin categories={categories} />}
      {adminSection === "testimonials" && <TestimonialsAdmin />}
      {adminSection === "faqs" && <FaqsAdmin />}
      {adminSection === "events" && <EventsAdmin />}
      {adminSection === "sponsors" && <SponsorsAdmin />}
      {adminSection === "partners" && <PartnersAdmin />}
      {adminSection === "links" && <LinksAdmin />}
      {adminSection === "team" && <TeamAdmin categories={categories} />}
      {adminSection === "newsletter" && <NewsletterAdmin />}
      {adminSection === "donation" && <DonationAdmin />}
      {adminSection === "donators" && <DonatorsAdmin categories={categories} />}
      {adminSection === "analytics" && <AnalyticsAdmin />}
      {adminSection === "email" && <EmailAdmin />}
      {adminSection === "shop" && <ShopAdmin />}
      {adminSection === "shopRequests" && <ShopRequestsAdmin />}
      {adminSection === "announcements" && <AnnouncementsAdmin />}
      {adminSection === "employees" && <EmployeesAdmin />}
      {adminSection === "chat" && <ChatAdmin />}
      {adminSection === "apiKeys" && <ApiKeysAdmin />}
      {adminSection === "example" && <ExampleAdmin />}
      {adminSection === "customerChat" && <CustomerChatAdmin />}
      {adminSection === "bugReports" && <BugReportsAdmin />}
      {adminSection === "bloomStats" && <BloomStatsAdmin />}
      {adminSection === "subscriptions" && <SubscriptionsAdmin />}
      {adminSection === "pages" && <PagesAdmin />}
      {adminSection === "categories" && <CategoriesAdmin />}
      {adminSection === "media" && <MediaLibrary />}
      {adminSection === "inquiries" && <InquiriesAdmin />}
      {adminSection === "users" && <UsersAdmin />}
      {adminSection === "audit" && <AuditLogAdmin />}
      {adminSection === "settings" && <SettingsAdmin />}
    </AdminShell>
  );
}
