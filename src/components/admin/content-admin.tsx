"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CrudTable, Field, StatusBadge } from "@/components/admin/crud-table";
import { ImageUpload } from "@/components/admin/image-upload";
import type { SerializedPost, SerializedService, SerializedTestimonial, SerializedFaq, SerializedEvent, SerializedCategory } from "@/lib/types";

interface PostProps { categories: SerializedCategory[]; }
interface ServiceProps { categories: SerializedCategory[]; }

export function BlogAdmin({ categories: _ }: PostProps) {
  return (
    <CrudTable<SerializedPost>
      title="Blog posts"
      desc="Articles, updates, and announcements."
      endpoint="/api/admin/blog"
      section="blog"
      perm="content.manage"
      searchKeys={["title", "excerpt"]}
      labelFor={(r) => r.title}
      canReorder
      columns={[
        {
          key: "title",
          label: "Title",
          render: (r) => (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--fubrio-accent-soft)] border border-[var(--fubrio-accent)]/20 flex items-center justify-center text-xs font-semibold text-[var(--fubrio-accent)] flex-shrink-0">
                {r.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.readTime} min read</div>
              </div>
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusBadge status={r.status} />,
        },
        {
          key: "featured",
          label: "Featured",
          render: (r) => r.featured ? <Badge variant="secondary" className="text-[10px]">Featured</Badge> : <span className="text-muted-foreground">-</span>,
        },
        {
          key: "publishedAt",
          label: "Published",
          render: (r) => r.publishedAt ? <span className="text-xs text-muted-foreground">{new Date(r.publishedAt).toLocaleDateString()}</span> : <span className="text-muted-foreground">-</span>,
        },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Slug (optional)">
            <Input value={value.slug ?? ""} onChange={(e) => onChange({ slug: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={value.status ?? "DRAFT"} onValueChange={(v) => onChange({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Read time (minutes)">
            <Input type="number" value={value.readTime ?? 3} onChange={(e) => onChange({ readTime: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Excerpt">
              <Textarea value={value.excerpt ?? ""} onChange={(e) => onChange({ excerpt: e.target.value })} rows={2} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Content (Markdown)">
              <Textarea value={value.content ?? ""} onChange={(e) => onChange({ content: e.target.value })} rows={8} className="font-mono text-xs" />
            </Field>
          </div>
          <Field label="Cover image">
            <ImageUpload value={value.coverImage ?? ""} onChange={(url) => onChange({ coverImage: url })} />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured
            </label>
          </div>
        </div>
      )}
    />
  );
}

export function ServicesAdmin({ categories }: ServiceProps) {
  const serviceCategories = categories.filter((c: any) => c.type === "service" || c.type === "Service");
  const allCats = serviceCategories.length > 0 ? serviceCategories : categories;

  return (
    <CrudTable<SerializedService>
      title="Services"
      desc="Services offered by Fubrio. Add images, categories, Buy URLs, or enable a Contact CTA."
      endpoint="/api/admin/services"
      section="services"
      perm="content.manage"
      searchKeys={["title"]}
      labelFor={(r) => r.title}
      canReorder
      columns={[
        { key: "title", label: "Title", render: (r) => (
          <div className="flex items-center gap-2">
            {(r as any).image ? (
              <img src={(r as any).image} alt="" className="h-8 w-8 rounded object-cover" />
            ) : null}
            <div className="font-medium">{r.title}</div>
          </div>
        ) },
        { key: "category", label: "Category", render: (r) => {
          const cat = allCats.find((c: any) => c.id === (r as any).categoryId);
          return cat ? <Badge variant="outline" className="text-[10px]">{cat.name}</Badge> : <span className="text-muted-foreground">-</span>;
        } },
        { key: "pricingType", label: "Pricing", render: (r) => <Badge variant="outline" className="text-[10px]">{r.pricingType}</Badge> },
        { key: "price", label: "Price", render: (r) => r.price ? <span className="font-mono">${r.price}</span> : <span className="text-muted-foreground">-</span> },
        { key: "featured", label: "Featured", render: (r) => r.featured ? <Badge variant="secondary" className="text-[10px]">Featured</Badge> : <span className="text-muted-foreground">-</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Category">
            <Select
              value={(value as any).categoryId ?? ""}
              onValueChange={(v) => onChange({ categoryId: v === "__none__" ? null : v } as any)}
            >
              <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">- No category -</SelectItem>
                {allCats.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Icon (lucide name)">
            <Input value={value.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value })} placeholder="Globe | Sparkles | Bot" />
          </Field>
          <Field label="Pricing type">
            <Select value={value.pricingType ?? "custom"} onValueChange={(v) => onChange({ pricingType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency">
            <select
              value={(value as any).currency ?? "INR"}
              onChange={(e) => onChange({ currency: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </Field>
          <Field label="Price (min) - in selected currency">
            <Input type="number" step="0.01" value={value.price ?? 0} onChange={(e) => onChange({ price: Number(e.target.value) })} placeholder="e.g. 499" />
          </Field>
          <Field label="Price (max - leave 0 for fixed price)">
            <Input type="number" step="0.01" value={(value as any).priceMax ?? 0} onChange={(e) => onChange({ priceMax: Number(e.target.value) } as any)} placeholder="e.g. 1999 (0 = fixed)" />
          </Field>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={(value as any).autoConvertCurrency ?? false}
                onCheckedChange={(v) => onChange({ autoConvertCurrency: v === true } as any)}
              />
              <span>Auto-convert: show both INR + USD prices on the website (₹83 ≈ $1)</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <Field label="Image / Cover">
              <ImageUpload value={(value as any).image ?? ""} onChange={(url) => onChange({ image: url } as any)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Short description">
              <Input value={value.shortDesc ?? ""} onChange={(e) => onChange({ shortDesc: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Features (comma-separated)">
              <Input
                value={Array.isArray(value.features) ? value.features.join(", ") : ""}
                onChange={(e) => onChange({ features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
            </Field>
          </div>
          <Field label="CTA text">
            <Input value={value.ctaText ?? ""} onChange={(e) => onChange({ ctaText: e.target.value })} placeholder="Get a quote" />
          </Field>
          <Field label="Purchase URL (optional)">
            <Input
              value={(value as any).purchaseUrl ?? ""}
              onChange={(e) => onChange({ purchaseUrl: e.target.value } as any)}
              placeholder="https://buy.stripe.com/..."
            />
          </Field>
          <Field label="Contact email (optional)">
            <Input
              type="email"
              value={(value as any).contactEmail ?? ""}
              onChange={(e) => onChange({ contactEmail: e.target.value } as any)}
              placeholder="hello@fubrio.in"
            />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={(value as any).contactEnabled ?? false}
                onCheckedChange={(v) => onChange({ contactEnabled: v === true } as any)}
              />
              Enable Contact CTA (visitor opens contact form instead of buy)
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value.featured ?? false} onCheckedChange={(v) => onChange({ featured: v === true })} />
              Featured
            </label>
          </div>
        </div>
      )}
    />
  );
}

export function TestimonialsAdmin() {
  return (
    <CrudTable<SerializedTestimonial>
      title="Testimonials"
      desc="Client testimonials."
      endpoint="/api/admin/testimonials"
      section="testimonials"
      perm="content.manage"
      searchKeys={["name", "content"]}
      labelFor={(r) => r.name}
      canReorder
      columns={[
        { key: "name", label: "Name", render: (r) => <div className="font-medium">{r.name}</div> },
        { key: "company", label: "Company", render: (r) => r.company ?? <span className="text-muted-foreground">-</span> },
        { key: "rating", label: "Rating", render: (r) => <span className="text-xs">{"★".repeat(r.rating)}<span className="text-muted-foreground">{"★".repeat(5 - r.rating)}</span></span> },
        { key: "published", label: "Published", render: (r) => r.published ? <Badge variant="secondary" className="text-[10px]">Published</Badge> : <span className="text-muted-foreground">Hidden</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name"><Input value={value.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} /></Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Role"><Input value={value.role ?? ""} onChange={(e) => onChange({ role: e.target.value })} /></Field>
          <Field label="Company"><Input value={value.company ?? ""} onChange={(e) => onChange({ company: e.target.value })} /></Field>
          <Field label="Rating (1-5)"><Input type="number" min={1} max={5} value={value.rating ?? 5} onChange={(e) => onChange({ rating: Number(e.target.value) })} /></Field>
          <Field label="Avatar"><ImageUpload value={value.avatar ?? ""} onChange={(url) => onChange({ avatar: url })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Testimonial"><Textarea value={value.content ?? ""} onChange={(e) => onChange({ content: e.target.value })} rows={4} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={value.published ?? true} onCheckedChange={(v) => onChange({ published: v === true })} />
            Published
          </label>
        </div>
      )}
    />
  );
}

export function FaqsAdmin() {
  return (
    <CrudTable<SerializedFaq>
      title="FAQs"
      desc="Frequently asked questions."
      endpoint="/api/admin/faqs"
      section="faqs"
      perm="content.manage"
      searchKeys={["question", "answer"]}
      labelFor={(r) => r.question}
      canReorder
      columns={[
        { key: "question", label: "Question", render: (r) => <div className="font-medium">{r.question}</div> },
        { key: "category", label: "Category", render: (r) => <Badge variant="outline" className="text-[10px]">{r.category}</Badge> },
        { key: "published", label: "Published", render: (r) => r.published ? <Badge variant="secondary" className="text-[10px]">Published</Badge> : <span className="text-muted-foreground">Hidden</span> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 gap-4">
          <Field label="Question"><Input value={value.question ?? ""} onChange={(e) => onChange({ question: e.target.value })} /></Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Category"><Input value={value.category ?? "General"} onChange={(e) => onChange({ category: e.target.value })} /></Field>
          <Field label="Answer"><Textarea value={value.answer ?? ""} onChange={(e) => onChange({ answer: e.target.value })} rows={4} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={value.published ?? true} onCheckedChange={(v) => onChange({ published: v === true })} />
            Published
          </label>
        </div>
      )}
    />
  );
}

export function EventsAdmin() {
  return (
    <CrudTable<SerializedEvent>
      title="Events"
      desc="Upcoming and past events."
      endpoint="/api/admin/events"
      section="events"
      perm="content.manage"
      searchKeys={["title"]}
      labelFor={(r) => r.title}
      canReorder
      columns={[
        { key: "title", label: "Title", render: (r) => <div className="font-medium">{r.title}</div> },
        { key: "type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
        { key: "date", label: "Date", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
      ]}
      form={({ value, onChange }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title"><Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} /></Field>
          <Field label="Brand">
            <select
              value={(value as any).brand ?? "fubrio"}
              onChange={(e) => onChange({ brand: e.target.value } as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="fubrio">Fubrio</option>
              <option value="bloom">Bloom</option>
              <option value="both">Both</option>
            </select>
          </Field>

          <Field label="Type">
            <Select value={value.type ?? "MEETUP"} onValueChange={(v) => onChange({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEETUP">Meetup</SelectItem>
                <SelectItem value="WEBINAR">Webinar</SelectItem>
                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                <SelectItem value="CONFERENCE">Conference</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date">
            <Input
              type="datetime-local"
              value={value.date ? (value.date instanceof Date ? value.date.toISOString().slice(0, 16) : String(value.date).slice(0, 16)) : ""}
              onChange={(e) => {
                if (e.target.value) {
                  onChange({ date: new Date(e.target.value).toISOString() });
                }
              }}
            />
          </Field>
          <Field label="Location"><Input value={(value as any).location ?? ""} onChange={(e) => onChange({ location: e.target.value } as any)} /></Field>
          <Field label="URL"><Input value={(value as any).url ?? ""} onChange={(e) => onChange({ url: e.target.value } as any)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Cover image">
              <ImageUpload value={(value as any).coverImage ?? (value as any).image ?? ""} onChange={(url) => onChange({ image: url } as any)} />
            </Field>
          </div>
          <Field label="Status">
            <Select value={value.status ?? "UPCOMING"} onValueChange={(v) => onChange({ status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="PAST">Past</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description"><Textarea value={value.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} rows={3} /></Field>
          </div>
        </div>
      )}
    />
  );
}
