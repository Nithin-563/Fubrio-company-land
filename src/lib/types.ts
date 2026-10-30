
export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "CONTRIBUTOR" | "EMPLOYEE";

export const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "CONTRIBUTOR", "EMPLOYEE"];

export const PERMISSIONS = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "content.manage",
    "users.manage",
    "settings.manage",
    "media.manage",
    "inquiries.manage",
    "navigation.manage",
    "pages.manage",
  ],
  EDITOR: [
    "content.manage",
    "media.manage",
    "inquiries.manage",
    "pages.manage",
  ],
  CONTRIBUTOR: ["content.create", "content.edit.own"],
  EMPLOYEE: [], // employees use per-section granular perms instead
} as const;

export function can(role: string, perm: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = (PERMISSIONS as Record<string, readonly string[]>)[role] ?? [];
  if (perms.includes("*")) return true;
  return perms.includes(perm) || perms.some((p) => perm.startsWith(p + ".") || p === perm);
}


export interface EmployeePermissions {
  [section: string]: string[];
}

/** Returns true if the section is accessible (even view-only). */
export function canSection(perms: EmployeePermissions | undefined | null, section: string): boolean {
  if (!perms) return false;
  const acts = perms[section];
  return Array.isArray(acts) && acts.length > 0;
}

/** Returns true if the user can perform a specific action on a section. */
export function canAction(
  perms: EmployeePermissions | undefined | null,
  section: string,
  action: "view" | "create" | "update" | "delete" | "reorder",
): boolean {
  if (!perms) return false;
  const acts = perms[section];
  if (!Array.isArray(acts) || acts.length === 0) return false;
  return acts.includes(action);
}

/** Resolves whether a user (role + perms) can access a section at all. */
export function userCanAccessSection(
  role: string,
  perms: EmployeePermissions | undefined | null,
  section: string,
  requiredPerm: string,
): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (can(role, requiredPerm)) return true; // ADMIN/EDITOR/CONTRIBUTOR pass-through
  if (role === "EMPLOYEE") return canSection(perms, section);
  return false;
}

/** Resolves whether a user (role + perms) can perform an action on a section. */
export function userCanAction(
  role: string,
  perms: EmployeePermissions | undefined | null,
  section: string,
  action: "view" | "create" | "update" | "delete" | "reorder",
  requiredPerm: string,
): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (can(role, requiredPerm)) {
    return true;
  }
  if (role === "EMPLOYEE") return canAction(perms, section, action);
  return false;
}

/**
 * Server-side helper - given a session object (from getServerSession), check
 * whether the user is allowed to perform `action` on `section`.
 *
 * Usage:
 *   const session = await getServerSession(authOptions);
 *   if (!session || !canSession(session, "shop", "create", "content.manage")) {
 *     return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
 *   }
 *
 * Behavior:
 *   - Not signed in → false
 *   - SUPER_ADMIN → true
 *   - ADMIN/EDITOR/CONTRIBUTOR → true if their role passes the legacy perm check
 *   - EMPLOYEE → true if their per-section map includes the section AND the action
 */
export function canSession(
  session: any,
  section: string,
  action: "view" | "create" | "update" | "delete" | "reorder",
  requiredPerm: string,
): boolean {
  if (!session) return false;
  const role = (session.user as { role?: string } | undefined)?.role ?? "CONTRIBUTOR";
  if (role === "SUPER_ADMIN") return true;
  if (role === "EMPLOYEE") {
    const perms = (session.user as { permissions?: EmployeePermissions } | undefined)?.permissions;
    return canAction(perms, section, action);
  }
  return can(role, requiredPerm);
}

/**
 * Server-side helper - given a session, check if the user can access a section
 * at all (even view-only). Used to gate GET routes for non-CRUD sections like
 * analytics, settings, etc.
 */
export function canSessionAccess(
  session: any,
  section: string,
  requiredPerm: string,
): boolean {
  if (!session) return false;
  const role = (session.user as { role?: string } | undefined)?.role ?? "CONTRIBUTOR";
  if (role === "SUPER_ADMIN") return true;
  if (role === "EMPLOYEE") {
    const perms = (session.user as { permissions?: EmployeePermissions } | undefined)?.permissions;
    return canSection(perms, section);
  }
  return can(role, requiredPerm);
}

export type ViewKey =
  | "home"
  | "showcase"
  | "products"
  | "services"
  | "partners"
  | "sponsors"
  | "community"
  | "blog"
  | "contact"
  | "faq"
  | "about"
  | "search"
  | "admin";

export interface SerializedProject {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  fullDesc: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  gallery: string[];
  videos: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  downloadUrl: string | null;
  purchaseUrl: string | null;
  technologies: string[];
  status: string;
  visibility: string;
  featured: boolean;
  launchDate: string | null;
  publishedAt: string | null;
  authorId: string | null;
  contributors: Array<{ name: string; role: string; avatar: string | null }>;
  client: string | null;
  category: { id: string; name: string; slug: string; color: string | null; icon: string | null } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  fullDesc: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  gallery: string[];
  features: string[];
  demoUrl: string | null;
  documentation: string | null;
  version: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  status: string;
  featured: boolean;
  technologies: string[];
  category: { id: string; name: string; slug: string } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  author: { id: string; name: string | null; email: string; image: string | null } | null;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  readTime: number;
  tags: Array<{ id: string; name: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedSponsor {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  tier: string;
  industry: string | null;
  active: boolean;
  featured: boolean;
  socials: Record<string, string>;
  order: number;
}

export interface SerializedPartner {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  type: string;
  socials: Record<string, string>;
  featured: boolean;
  published: boolean;
  order: number;
}

export interface SerializedService {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  fullDesc: string | null;
  icon: string | null;
  image: string | null;
  features: string[];
  pricingType: string;
  price: number | null;
  currency: string;
  ctaText: string;
  featured: boolean;
  status: string;
}

export interface SerializedTestimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatar: string | null;
  content: string;
  rating: number;
  published: boolean;
  order: number;
}

export interface SerializedInquiry {
  id: string;
  reference: string;
  name: string;
  email: string;
  company: string | null;
  inquiryType: string;
  budget: string | null;
  message: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedMetric {
  id: string;
  key: string;
  label: string;
  value: string;
  unit: string | null;
  icon: string | null;
  order: number;
}

export interface SerializedFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface SerializedEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  location: string | null;
  url: string | null;
  type: string;
  status: string;
}

export interface SerializedNavItem {
  id: string;
  label: string;
  href: string;
  order: number;
  visible: boolean;
  icon: string | null;
}

export interface SerializedFooterColumn {
  id: string;
  title: string;
  order: number;
  links: Array<{ label: string; href: string }>;
  visible: boolean;
}

export interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  type: string;
  order: number;
}

export interface SerializedMedia {
  id: string;
  name: string;
  url: string;
  type: string;
  mime: string | null;
  size: number | null;
  alt: string | null;
  caption: string | null;
  tags: string[];
  folder: string | null;
  createdAt: string;
}

export interface SerializedPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  description: string | null;
  sections: Array<{
    id: string;
    type: string;
    content: Record<string, unknown>;
    config: Record<string, unknown>;
    visibility: string;
    order: number;
  }>;
  seoTitle: string | null;
  seoDesc: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

export interface SerializedAuditLog {
  id: string;
  userId: string | null;
  user: { name: string | null; email: string } | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
