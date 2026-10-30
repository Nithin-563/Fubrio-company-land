import { db } from "@/lib/db";
import type {
  SerializedProject,
  SerializedProduct,
  SerializedPost,
  SerializedSponsor,
  SerializedPartner,
  SerializedService,
  SerializedTestimonial,
  SerializedMetric,
  SerializedFaq,
  SerializedEvent,
  SerializedNavItem,
  SerializedFooterColumn,
  SerializedCategory,
  SerializedInquiry,
  SerializedMedia,
  SerializedPage,
  SerializedUser,
  SerializedAuditLog,
} from "@/lib/types";

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}


export async function getFeaturedProjects(limit = 6, brand?: string) {
  const where: Record<string, unknown> = { status: "LIVE", visibility: "PUBLIC" };
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.project.findMany({
    where,
    include: { category: true, tags: true, author: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(serializeProject);
}

export async function getProjects(opts: {
  search?: string;
  categoryId?: string;
  tagSlug?: string;
  status?: string;
  featured?: boolean;
  sort?: "newest" | "oldest" | "name" | "featured";
  limit?: number;
  offset?: number;
} = {}) {
  const { search, categoryId, tagSlug, status, featured, sort = "newest", limit = 50, offset = 0 } = opts;
  const where: Record<string, unknown> = { visibility: "PUBLIC" };
  if (status) where.status = status;
  else where.status = { in: ["LIVE", "MAINTENANCE"] };
  if (categoryId) where.categoryId = categoryId;
  if (featured !== undefined) where.featured = featured;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { shortDesc: { contains: search } },
      { fullDesc: { contains: search } },
    ];
  }
  if (tagSlug) {
    where.tags = { some: { slug: tagSlug } };
  }
  const order: Record<string, "asc" | "desc">[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }]
      : sort === "name"
        ? [{ title: "asc" }]
        : sort === "featured"
          ? [{ featured: "desc" }, { publishedAt: "desc" }]
          : [{ publishedAt: "desc" }];
  const rows = await db.project.findMany({
    where,
    include: { category: true, tags: true, author: true },
    orderBy: order,
    skip: offset,
    take: limit,
  });
  return rows.map(serializeProject);
}

export async function getProjectBySlug(slug: string) {
  const row = await db.project.findUnique({
    where: { slug },
    include: { category: true, tags: true, author: true },
  });
  return row ? serializeProject(row) : null;
}

export async function getRelatedProjects(projectId: string, categoryId: string | null, limit = 3) {
  const rows = await db.project.findMany({
    where: {
      id: { not: projectId },
      status: "LIVE",
      visibility: "PUBLIC",
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true, tags: true },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(serializeProject);
}

export async function getProducts(opts: { search?: string; categoryId?: string; featured?: boolean; limit?: number; brand?: string } = {}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (opts.brand) where.brand = { in: [opts.brand, "both"] };
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search } },
      { shortDesc: { contains: opts.search } },
    ];
  }
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.featured !== undefined) where.featured = opts.featured;
  const rows = await db.product.findMany({
    where,
    include: { category: true, tags: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: opts.limit ?? 50,
  });
  return rows.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const row = await db.product.findUnique({
    where: { slug },
    include: { category: true, tags: true },
  });
  return row ? serializeProduct(row) : null;
}

export async function getFeaturedServices(brand?: string) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.service.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
  return rows.map(serializeService);
}

export async function getSponsors(brand?: string) {
  const where: Record<string, unknown> = { active: true };
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.sponsor.findMany({
    where,
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(serializeSponsor);
}

export async function getPartners(brand?: string) {
  const where: Record<string, unknown> = {};
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.partner.findMany({
    where,
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(serializePartner);
}

export async function getTestimonials(limit = 6, brand?: string) {
  const where: Record<string, unknown> = { published: true };
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.testimonial.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(serializeTestimonial);
}

export async function getRecentPosts(limit = 3, brand?: string) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.blogPost.findMany({
    where,
    include: { author: true, tags: true },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map(serializePost);
}

export async function getPosts(opts: { search?: string; limit?: number; offset?: number; brand?: string } = {}) {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (opts.brand) where.brand = { in: [opts.brand, "both"] };
  if (opts.search) {
    where.OR = [
      { title: { contains: opts.search } },
      { excerpt: { contains: opts.search } },
    ];
  }
  const rows = await db.blogPost.findMany({
    where,
    include: { author: true, tags: true },
    orderBy: [{ publishedAt: "desc" }],
    skip: opts.offset ?? 0,
    take: opts.limit ?? 50,
  });
  return rows.map(serializePost);
}

export async function getPostBySlug(slug: string) {
  const row = await db.blogPost.findUnique({
    where: { slug },
    include: { author: true, tags: true },
  });
  return row ? serializePost(row) : null;
}

export async function getMetrics() {
  const rows = await db.metric.findMany({ orderBy: [{ order: "asc" }] });
  return rows.map(serializeMetric);
}

export async function getFaqs(brand?: string) {
  const where: Record<string, unknown> = {};
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.faq.findMany({
    where,
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(serializeFaq);
}

export async function getEvents(limit = 5, brand?: string) {
  const where: Record<string, unknown> = {};
  if (brand) where.brand = { in: [brand, "both"] };
  const rows = await db.event.findMany({
    where,
    where: { status: "UPCOMING" },
    orderBy: [{ date: "asc" }],
    take: limit,
  });
  return rows.map(serializeEvent);
}

export async function getNavItems() {
  const rows = await db.navItem.findMany({
    where: { visible: true, parentId: null },
    orderBy: [{ order: "asc" }],
  });
  return rows.map(serializeNavItem);
}

export async function getFooterColumns() {
  const rows = await db.footerColumn.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }],
  });
  return rows.map(serializeFooterColumn);
}

export async function getCategories(type?: string) {
  const rows = await db.category.findMany({
    where: type ? { type } : {},
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return rows.map(serializeCategory);
}

export async function getPageBySlug(slug: string) {
  const row = await db.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: [{ order: "asc" }] } },
  });
  return row ? serializePage(row) : null;
}

export async function searchAll(query: string, limit = 10) {
  if (!query || query.length < 2) return { projects: [], products: [], posts: [], sponsors: [], partners: [] };
  const q = query.trim();
  const [projects, products, posts, sponsors, partners] = await Promise.all([
    db.project.findMany({
      where: { status: "LIVE", visibility: "PUBLIC", OR: [{ title: { contains: q } }, { shortDesc: { contains: q } }] },
      include: { category: true },
      take: limit,
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { shortDesc: { contains: q } }] },
      include: { category: true },
      take: limit,
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] },
      take: limit,
    }),
    db.sponsor.findMany({
      where: { active: true, OR: [{ name: { contains: q } }, { description: { contains: q } }] },
      take: limit,
    }),
    db.partner.findMany({
      where: { published: true, OR: [{ name: { contains: q } }, { description: { contains: q } }] },
      take: limit,
    }),
  ]);
  return {
    projects: projects.map(serializeProject),
    products: products.map(serializeProduct),
    posts: posts.map(serializePost),
    sponsors: sponsors.map(serializeSponsor),
    partners: partners.map(serializePartner),
  };
}


export async function getAdminStats() {
  const [
    projects, products, sponsors, partners, posts,
    inquiries, pages, media, users, services, testimonials, faqs, events,
    newInquiries, draftProjects, draftPosts,
  ] = await Promise.all([
    db.project.count(),
    db.product.count(),
    db.sponsor.count(),
    db.partner.count(),
    db.blogPost.count(),
    db.inquiry.count(),
    db.page.count(),
    db.mediaAsset.count(),
    db.user.count(),
    db.service.count(),
    db.testimonial.count(),
    db.faq.count(),
    db.event.count(),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.project.count({ where: { status: "DRAFT" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
  ]);
  return {
    projects, products, sponsors, partners, posts,
    inquiries, pages, media, users, services, testimonials, faqs, events,
    newInquiries, draftProjects, draftPosts,
  };
}

export async function getAdminProjects(limit = 50) {
  const rows = await db.project.findMany({
    include: { category: true },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return rows.map(serializeProject);
}

export async function getAdminProducts(limit = 50) {
  const rows = await db.product.findMany({
    include: { category: true },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return rows.map(serializeProduct);
}

export async function getAdminSponsors() {
  const rows = await db.sponsor.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return rows.map(serializeSponsor);
}

export async function getAdminPartners() {
  const rows = await db.partner.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return rows.map(serializePartner);
}

export async function getAdminServices() {
  const rows = await db.service.findMany({ include: { category: true }, orderBy: [{ order: "asc" }] });
  return rows.map(serializeService);
}

export async function getAdminPosts() {
  const rows = await db.blogPost.findMany({
    include: { author: true, category: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return rows.map(serializePost);
}

export async function getAdminTestimonials() {
  const rows = await db.testimonial.findMany({ orderBy: [{ order: "asc" }] });
  return rows.map(serializeTestimonial);
}

export async function getAdminFaqs() {
  const rows = await db.faq.findMany({ orderBy: [{ order: "asc" }] });
  return rows.map(serializeFaq);
}

export async function getAdminInquiries() {
  const rows = await db.inquiry.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { assignee: true },
  });
  return rows.map(serializeInquiry);
}

export async function getAdminMedia() {
  const rows = await db.mediaAsset.findMany({ orderBy: [{ createdAt: "desc" }] });
  return rows.map(serializeMedia);
}

export async function getAdminPages() {
  const rows = await db.page.findMany({
    include: { sections: { orderBy: [{ order: "asc" }] } },
    orderBy: [{ createdAt: "desc" }],
  });
  return rows.map(serializePage);
}

export async function getTeamMembers() {
  const rows = await db.teamMember.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    bio: r.bio,
    photo: r.photo,
    email: r.email,
    linkedin: r.linkedin,
    twitter: r.twitter,
    github: r.github,
    website: r.website,
    order: r.order,
  }));
}

export async function getDonators() {
  try {
    const rows = await db.donator.findMany({
      where: { verified: true },
      orderBy: [{ amount: "desc" }, { date: "desc" }],
    });
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount ?? 0),
      currency: r.currency || "USD",
      message: r.message,
      date: r.date ? (r.date instanceof Date ? r.date.toISOString() : String(r.date)) : null,
    }));
  } catch {
    return [];
  }
}

export async function getShopItems(brand?: string) {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (brand) where.brand = { in: [brand, "both"] };
    const rows = await db.shopItem.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      price: Number(r.price ?? 0),
      currency: r.currency || "USD",
      isFree: r.isFree,
      category: r.category,
      creator: r.creator,
      downloadUrl: r.downloadUrl,
      demoUrl: r.demoUrl,
      features: r.features,
      tags: r.tags,
      featured: r.featured,
    }));
  } catch {
    return [];
  }
}

export async function getAdminUsers() {
  const rows = await db.user.findMany({ orderBy: [{ createdAt: "desc" }] });
  return rows.map(serializeUser);
}

export async function getAdminAuditLogs(limit = 50) {
  const rows = await db.auditLog.findMany({
    include: { user: true },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return rows.map(serializeAuditLog);
}

export async function getAdminCategories() {
  const rows = await db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return rows.map(serializeCategory);
}

export async function getRecentActivity(limit = 8) {
  const [logs, recentInquiries] = await Promise.all([
    db.auditLog.findMany({
      include: { user: true },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    }),
    db.inquiry.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 3,
    }),
  ]);
  return {
    logs: logs.map(serializeAuditLog),
    recentInquiries: recentInquiries.map(serializeInquiry),
  };
}


export function serializeProject(row: any): SerializedProject {
  const toISO = (v: any) => v instanceof Date ? v.toISOString() : (v ? String(v) : null);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDesc: row.shortDesc,
    fullDesc: row.fullDesc,
    thumbnail: row.thumbnail,
    coverImage: row.coverImage,
    gallery: parseJSON<string[]>(row.gallery, []),
    videos: parseJSON<string[]>(row.videos, []),
    demoUrl: row.demoUrl,
    githubUrl: row.githubUrl,
    downloadUrl: row.downloadUrl,
    purchaseUrl: row.purchaseUrl,
    technologies: parseJSON<string[]>(row.technologies, []),
    status: row.status,
    visibility: row.visibility,
    featured: row.featured,
    launchDate: toISO(row.launchDate),
    publishedAt: toISO(row.publishedAt),
    authorId: row.authorId,
    contributors: parseJSON(row.contributors, []),
    client: row.client,
    category: row.category
      ? {
          id: row.category.id,
          name: row.category.name,
          slug: row.category.slug,
          color: row.category.color,
          icon: row.category.icon,
        }
      : null,
    tags: (row.tags ?? []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
    createdAt: toISO(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toISO(row.updatedAt) ?? new Date().toISOString(),
  };
}

export function serializeProduct(row: any): SerializedProduct {
  const toISO = (v: any) => v instanceof Date ? v.toISOString() : (v ? String(v) : null);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDesc: row.shortDesc,
    fullDesc: row.fullDesc,
    thumbnail: row.thumbnail,
    coverImage: row.coverImage,
    gallery: parseJSON<string[]>(row.gallery, []),
    features: parseJSON<string[]>(row.features, []),
    demoUrl: row.demoUrl,
    documentation: row.documentation,
    version: row.version,
    price: row.price,
    currency: row.currency,
    isFree: row.isFree,
    status: row.status,
    featured: row.featured,
    technologies: parseJSON<string[]>(row.technologies, []),
    category: row.category
      ? { id: row.category.id, name: row.category.name, slug: row.category.slug }
      : null,
    publishedAt: toISO(row.publishedAt),
    createdAt: toISO(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toISO(row.updatedAt) ?? new Date().toISOString(),
  };
}

export function serializePost(row: any): SerializedPost {
  const toISO = (v: any) => v instanceof Date ? v.toISOString() : (v ? String(v) : null);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    author: row.author
      ? { id: row.author.id, name: row.author.name, email: row.author.email, image: row.author.image }
      : null,
    status: row.status,
    featured: row.featured,
    publishedAt: toISO(row.publishedAt),
    readTime: row.readTime,
    tags: (row.tags ?? []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
    createdAt: toISO(row.createdAt) ?? new Date().toISOString(),
    updatedAt: toISO(row.updatedAt) ?? new Date().toISOString(),
  };
}

export function serializeSponsor(row: any): SerializedSponsor {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    description: row.description,
    website: row.website,
    tier: row.tier,
    industry: row.industry,
    active: row.active,
    featured: row.featured,
    socials: parseJSON(row.socials, {}),
    order: row.order,
  };
}

export function serializePartner(row: any): SerializedPartner {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    description: row.description,
    website: row.website,
    type: row.type,
    socials: parseJSON(row.socials, {}),
    featured: row.featured,
    published: row.published,
    order: row.order,
  };
}

export function serializeService(row: any): SerializedService {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDesc: row.shortDesc,
    fullDesc: row.fullDesc,
    icon: row.icon,
    image: row.image,
    features: parseJSON<string[]>(row.features, []),
    pricingType: row.pricingType,
    price: Number(row.price ?? 0),
    priceMax: row.priceMax ? Number(row.priceMax) : undefined,
    autoConvertCurrency: row.autoConvertCurrency === true,
    currency: row.currency || "INR",
    ctaText: row.ctaText,
    featured: row.featured,
    status: row.status,
    category: row.category
      ? { id: row.category.id, name: row.category.name, slug: row.category.slug }
      : null,
    contactEnabled: row.contactEnabled === true,
    purchaseUrl: row.purchaseUrl ?? null,
    contactEmail: row.contactEmail ?? null,
  } as any;
}

export function serializeTestimonial(row: any): SerializedTestimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    avatar: row.avatar,
    content: row.content,
    rating: row.rating,
    published: row.published,
    order: row.order,
  };
}

export function serializeFaq(row: any): SerializedFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    order: row.order,
    published: row.published,
  };
}

export function serializeEvent(row: any): SerializedEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date.toISOString(),
    endDate: row.endDate?.toISOString() ?? null,
    location: row.location,
    url: row.url,
    type: row.type,
    status: row.status,
  };
}

export function serializeMetric(row: any): SerializedMetric {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    value: row.value,
    unit: row.unit,
    icon: row.icon,
    order: row.order,
  };
}

export function serializeNavItem(row: any): SerializedNavItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    order: row.order,
    visible: row.visible,
    icon: row.icon,
  };
}

export function serializeFooterColumn(row: any): SerializedFooterColumn {
  return {
    id: row.id,
    title: row.title,
    order: row.order,
    links: parseJSON(row.links, []),
    visible: row.visible,
  };
}

export function serializeCategory(row: any): SerializedCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: row.color,
    icon: row.icon,
    type: row.type,
    order: row.order,
  };
}

export function serializeInquiry(row: any): SerializedInquiry {
  return {
    id: row.id,
    reference: row.reference,
    name: row.name,
    email: row.email,
    company: row.company,
    inquiryType: row.inquiryType,
    budget: row.budget,
    message: row.message,
    status: row.status,
    internalNotes: row.internalNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeMedia(row: any): SerializedMedia {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    type: row.type,
    mime: row.mime,
    size: row.size,
    alt: row.alt,
    caption: row.caption,
    tags: parseJSON(row.tags, []),
    folder: row.folder,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializePage(row: any): SerializedPage {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    description: row.description,
    sections: (row.sections ?? []).map((s: any) => ({
      id: s.id,
      type: s.type,
      content: parseJSON(s.content, {}),
      config: parseJSON(s.config, {}),
      visibility: s.visibility,
      order: s.order,
    })),
    seoTitle: row.seoTitle,
    seoDesc: row.seoDesc,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializeUser(row: any): SerializedUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAuditLog(row: any): SerializedAuditLog {
  return {
    id: row.id,
    userId: row.userId,
    user: row.user ? { name: row.user.name, email: row.user.email } : null,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    metadata: parseJSON(row.metadata, {}),
    createdAt: row.createdAt.toISOString(),
  };
}
