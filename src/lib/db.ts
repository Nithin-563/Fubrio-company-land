import { supabase, isSupabaseConfigured } from "@/lib/supabase";


function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

function transformRow<T = any>(row: any): T | null {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(row)) {
    out[snakeToCamel(k)] = row[k];
  }
  return out as T;
}

function transformRows<T = any>(rows: any[]): T[] {
  return (rows ?? []).map((r) => transformRow<T>(r)!).filter(Boolean);
}

function transformInput(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(data)) {
    if (data[k] === undefined) continue;
    const v = data[k];
    if (v instanceof Date) {
      out[camelToSnake(k)] = v.toISOString();
    } else {
      out[camelToSnake(k)] = v;
    }
  }
  return out;
}

const JSON_FIELDS: Record<string, string[]> = {
  projects: ["gallery", "videos", "technologies", "contributors", "meta"],
  products: ["gallery", "features", "technologies"],
  services: ["features"],
  sponsors: ["socials"],
  partners: ["socials"],
  blog_posts: [],
  media_assets: ["tags"],
  page_sections: ["content", "config"],
  reusable_blocks: ["content", "config"],
  footer_columns: ["links"],
  audit_logs: ["metadata"],
  short_links: [],
  employee_permissions: ["actions"],
  chat_messages: ["body"],
  api_keys: ["scopes"],
  api_key_logs: ["request_data", "response_data"],
  subscription_plans: ["features"],
};

function parseJsonFields(table: string, row: any): any {
  if (!row) return row;
  const fields = JSON_FIELDS[table] ?? [];
  for (const f of fields) {
    const camelKey = snakeToCamel(f);
    if (row[camelKey] !== undefined && typeof row[camelKey] === "string") {
      try {
        row[camelKey] = JSON.parse(row[camelKey]);
      } catch {
      }
    }
  }
  return row;
}


const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const code = (err as any)?.code;
      if (code === "42501" || code === "PGRST116" || code === "23505") {
        throw err;
      }
      const msg = (err as any)?.message || "";
      const isRetryable =
        msg.includes("fetch") ||
        msg.includes("network") ||
        msg.includes("timeout") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("socket") ||
        msg.includes("hang up") ||
        (err as any)?.status >= 500;
      if (attempt < MAX_RETRIES && isRetryable) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

class TableClient<T = any> {
  constructor(private table: string) {}

  async findUnique(args: { where: Record<string, unknown> }): Promise<T | null> {
    if (!isSupabaseConfigured) return null;
    return withRetry(async () => {
      let q = supabase.from(this.table).select("*");
      for (const [k, v] of Object.entries(args.where)) {
        q = q.eq(camelToSnake(k), v as any);
      }
      const { data, error } = await q.limit(1).maybeSingle();
      if (error) throw error;
      return parseJsonFields(this.table, transformRow<T>(data));
    });
  }

  async findFirst(args: { where: Record<string, unknown> }): Promise<T | null> {
    return this.findUnique(args);
  }

  async findMany(args: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;
    take?: number;
    skip?: number;
    include?: Record<string, unknown>;
  } = {}): Promise<T[]> {
    if (!isSupabaseConfigured) return [];
    return withRetry(async () => {
      let q = supabase.from(this.table).select("*");

    if (args.where) {
      for (const [k, v] of Object.entries(args.where)) {
        const snakeKey = camelToSnake(k);
        if (v === null) {
          q = q.is(snakeKey, null);
        } else if (typeof v === "object" && v !== null) {
          for (const [op, val] of Object.entries(v as Record<string, unknown>)) {
            if (op === "in" && Array.isArray(val)) {
              q = q.in(snakeKey, val as any[]);
            } else if (op === "contains" && typeof val === "string") {
              q = q.ilike(snakeKey, `%${val}%`);
            } else if (op === "gte") {
              q = q.gte(snakeKey, val as any);
            } else if (op === "lte") {
              q = q.lte(snakeKey, val as any);
            } else if (op === "gt") {
              q = q.gt(snakeKey, val as any);
            } else if (op === "lt") {
              q = q.lt(snakeKey, val as any);
            }
          }
        } else {
          q = q.eq(snakeKey, v as any);
        }
      }
    }

    if (args.orderBy) {
      const orderEntries = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
      for (const o of orderEntries) {
        for (const [k, dir] of Object.entries(o)) {
          q = q.order(camelToSnake(k), { ascending: dir === "asc" });
        }
      }
    }

    if (args.take !== undefined) {
      const limit = args.take;
      const offset = args.skip ?? 0;
      q = q.range(offset, offset + limit - 1);
    } else if (args.skip !== undefined) {
      q = q.range(args.skip, Number.MAX_SAFE_INTEGER);
    }

    const { data, error } = await q;
    if (error) throw error;
    return transformRows<T>(data).map((r) => parseJsonFields(this.table, r));
    });
  }

  async count(args: { where?: Record<string, unknown> } = {}): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    return withRetry(async () => {
      let q = supabase.from(this.table).select("*", { count: "exact", head: true });
    if (args.where) {
      for (const [k, v] of Object.entries(args.where)) {
        const snakeKey = camelToSnake(k);
        if (v === null) {
          q = q.is(snakeKey, null);
        } else if (typeof v === "object" && v !== null) {
          for (const [op, val] of Object.entries(v as Record<string, unknown>)) {
            if (op === "in" && Array.isArray(val)) {
              q = q.in(snakeKey, val as any[]);
            } else if (op === "contains" && typeof val === "string") {
              q = q.ilike(snakeKey, `%${val}%`);
            } else if (op === "gte") {
              q = q.gte(snakeKey, val as any);
            }
          }
        } else {
          q = q.eq(snakeKey, v as any);
        }
      }
    }
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
    });
  }

  async create(args: { data: Record<string, unknown> }): Promise<T> {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    return withRetry(async () => {
      const payload = transformInput(args.data);
      const { data, error } = await supabase
        .from(this.table)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return parseJsonFields(this.table, transformRow<T>(data));
    });
  }

  async update(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<T> {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    return withRetry(async () => {
      const payload = transformInput(args.data);
      let q = supabase.from(this.table).update(payload);
      for (const [k, v] of Object.entries(args.where)) {
        q = q.eq(camelToSnake(k), v as any);
      }
      const { data, error } = await q.select().single();
      if (error) throw error;
      return parseJsonFields(this.table, transformRow<T>(data));
    });
  }

  async upsert(args: {
    where: Record<string, unknown>;
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }): Promise<T> {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    }
    return this.create({ data: { ...args.create, ...args.where } });
  }

  async delete(args: { where: Record<string, unknown> }): Promise<void> {
    if (!isSupabaseConfigured) return;
    await withRetry(async () => {
      let q = supabase.from(this.table).delete();
      for (const [k, v] of Object.entries(args.where)) {
        q = q.eq(camelToSnake(k), v as any);
      }
      const { error } = await q;
      if (error) throw error;
    });
  }

  async connectTags(relationTable: string, parentIdField: string, parentId: string, tagIds: string[]): Promise<void> {
    if (!isSupabaseConfigured || tagIds.length === 0) return;
    await withRetry(async () => {
      const rows = tagIds.map((tagId) => ({ [parentIdField]: parentId, tag_id: tagId }));
      const { error } = await supabase.from(relationTable).insert(rows);
      if (error) throw error;
    });
  }

  async setTags(relationTable: string, parentIdField: string, parentId: string, tagIds: string[]): Promise<void> {
    if (!isSupabaseConfigured) return;
    await withRetry(async () => {
      const { error } = await supabase.from(relationTable).delete().eq(parentIdField, parentId);
      if (error) throw error;
    });
    if (tagIds.length > 0) {
      await this.connectTags(relationTable, parentIdField, parentId, tagIds);
    }
  }

  async getTags(relationTable: string, parentIdField: string, parentId: string): Promise<any[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from(relationTable)
      .select("tag_id, tags(id, name, slug)")
      .eq(parentIdField, parentId);
    if (error) throw error;
    return (data ?? []).map((r: any) => r.tags).filter(Boolean);
  }
}

export const db = {
  user: new TableClient("users"),
  account: new TableClient("accounts"),
  session: new TableClient("sessions"),
  verificationToken: new TableClient("verification_tokens"),
  category: new TableClient("categories"),
  tag: new TableClient("tags"),
  project: new TableClient("projects"),
  product: new TableClient("products"),
  service: new TableClient("services"),
  sponsor: new TableClient("sponsors"),
  partner: new TableClient("partners"),
  blogPost: new TableClient("blog_posts"),
  testimonial: new TableClient("testimonials"),
  faq: new TableClient("faqs"),
  event: new TableClient("events"),
  metric: new TableClient("metrics"),
  inquiry: new TableClient("inquiries"),
  mediaAsset: new TableClient("media_assets"),
  page: new TableClient("pages"),
  pageSection: new TableClient("page_sections"),
  reusableBlock: new TableClient("reusable_blocks"),
  navItem: new TableClient("nav_items"),
  footerColumn: new TableClient("footer_columns"),
  siteSetting: new TableClient("site_settings"),
  auditLog: new TableClient("audit_logs"),
  shortLink: new TableClient("short_links"),
  teamMember: new TableClient("team_members"),
  newsletterSubscriber: new TableClient("newsletter_subscribers"),
  newsletterCampaign: new TableClient("newsletter_campaigns"),
  donator: new TableClient("donators"),
  visit: new TableClient("visits"),
  email: new TableClient("emails"),
  shopItem: new TableClient("shop_items"),
  shopRequest: new TableClient("shop_requests"),
  employee: new TableClient("employees"),
  employeePermission: new TableClient("employee_permissions"),
  announcement: new TableClient("announcements"),
  announcementView: new TableClient("announcement_views"),
  announcementSubscription: new TableClient("announcement_subscriptions"),
  chatConversation: new TableClient("chat_conversations"),
  chatParticipant: new TableClient("chat_participants"),
  chatMessage: new TableClient("chat_messages"),
  chatReadReceipt: new TableClient("chat_read_receipts"),
  apiKey: new TableClient("api_keys"),
  apiKeyLog: new TableClient("api_key_logs"),
  donationLink: new TableClient("donation_links"),
  adImpression: new TableClient("ad_impressions"),
  serviceRequest: new TableClient("service_requests"),
  customerChat: new TableClient("customer_chats"),
  customerChatMessage: new TableClient("customer_chat_messages"),
  apiKeyUsage: new TableClient("api_key_usage"),
  subscriptionPlan: new TableClient("subscription_plans"),
  userSubscription: new TableClient("user_subscriptions"),
  subscriptionChangeRequest: new TableClient("subscription_change_requests"),
  bugReport: new TableClient("bug_reports"),
  notification: new TableClient("notifications"),

  async $disconnect() {},

  projectTags: {
    async set(projectId: string, tagIds: string[]) {
      const t = new TableClient("project_tags");
      await t.setTags("project_tags", "project_id", projectId, tagIds);
    },
    async get(projectId: string) {
      const t = new TableClient("project_tags");
      return t.getTags("project_tags", "project_id", projectId);
    },
  },
  productTags: {
    async set(productId: string, tagIds: string[]) {
      const t = new TableClient("product_tags");
      await t.setTags("product_tags", "product_id", productId, tagIds);
    },
    async get(productId: string) {
      const t = new TableClient("product_tags");
      return t.getTags("product_tags", "product_id", productId);
    },
  },
  blogPostTags: {
    async set(postId: string, tagIds: string[]) {
      const t = new TableClient("blog_post_tags");
      await t.setTags("blog_post_tags", "blog_post_id", postId, tagIds);
    },
    async get(postId: string) {
      const t = new TableClient("blog_post_tags");
      return t.getTags("blog_post_tags", "blog_post_id", postId);
    },
  },
};

export { supabase };
